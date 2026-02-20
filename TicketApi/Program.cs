using MySqlConnector;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors();

var app = builder.Build();

app.UseCors(policy => policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader());

app.MapGet("/api/tickets", async () =>
{
    var connectionString = builder.Configuration.GetConnectionString("MySQL");
    using var connection = new MySqlConnection(connectionString);
    await connection.OpenAsync();

    // Open tickets query
    var sql = @"
        SELECT
            t.number AS ticket_number,
            t.created,
            c.subject,
            p.priority_desc AS priority,
            ts.name AS status_name,
            CONCAT(s.firstname, ' ', s.lastname) AS assigned_to
        FROM ost_ticket t
        LEFT JOIN ost_ticket__cdata c ON c.ticket_id = t.ticket_id
        LEFT JOIN ost_ticket_priority p ON p.priority_id = c.priority
        LEFT JOIN ost_ticket_status ts ON ts.id = t.status_id
        LEFT JOIN ost_staff s ON s.staff_id = t.staff_id
        WHERE ts.state = 'open'
        ORDER BY t.created DESC
        LIMIT 20";

    using var cmd = new MySqlCommand(sql, connection);
    using var reader = await cmd.ExecuteReaderAsync();

    var tickets = new List<object>();
    var overdueCount = 0;
    var highCount = 0;
    DateTime? oldestDate = null;

    while (await reader.ReadAsync())
    {
        var created = reader.GetDateTime("created");
        var age = DateTime.Now - created;
        var priority = reader.IsDBNull(reader.GetOrdinal("priority"))
            ? "Normal"
            : reader.GetString("priority");

        // Calculate age string
        string ageStr;
        if (age.Days > 0)
            ageStr = $"{age.Days}d {age.Hours}h";
        else if (age.Hours > 0)
            ageStr = $"{age.Hours}h {age.Minutes}m";
        else
            ageStr = $"{age.Minutes}m";

        // Determine priority class
        var priorityClass = "normal";
        if (priority == "High" || priority == "Emergency")
        {
            priorityClass = "high";
            highCount++;
        }
        if (age.Days >= 2)
        {
            priorityClass = "overdue";
            overdueCount++;
        }

        // Track oldest ticket
        if (oldestDate == null || created < oldestDate)
            oldestDate = created;

        tickets.Add(new
        {
            id = "#" + reader.GetString("ticket_number"),
            age = ageStr,
            priority,
            priorityClass,
            subject = reader.IsDBNull(reader.GetOrdinal("subject"))
                ? "No subject"
                : reader.GetString("subject"),
            assignedTo = reader.IsDBNull(reader.GetOrdinal("assigned_to"))
                ? "Unassigned"
                : reader.GetString("assigned_to")
        });
    }

    // Close the reader before running the next query
    await reader.CloseAsync();

    // Count tickets closed today
    var closedSql = @"
        SELECT COUNT(*) AS count
        FROM ost_ticket t
        LEFT JOIN ost_ticket_status ts ON ts.id = t.status_id
        WHERE ts.state = 'closed'
        AND DATE(t.closed) = CURDATE()";

    using var closedCmd = new MySqlCommand(closedSql, connection);
    var closedToday = Convert.ToInt32(await closedCmd.ExecuteScalarAsync());

    // Calculate oldest ticket age
    var oldestAge = oldestDate != null
        ? $"{(DateTime.Now - oldestDate.Value).Days} days"
        : "0 days";

    return Results.Ok(new
    {
        tickets = tickets.Take(10).ToList(),
        stats = new
        {
            open = tickets.Count,
            overdue = overdueCount,
            highPriority = highCount,
            closedToday
        },
        meta = new
        {
            oldestTicket = oldestAge,
            slaOverdue = overdueCount
        }
    });
});

app.Run();
