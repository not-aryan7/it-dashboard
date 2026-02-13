<?php
// ── Database Connection ──
// Replace # values with your actual osTicket database credentials
$dbHost = "#";          // e.g. "localhost"
$dbName = "#";          // e.g. "osticket"
$dbUser = "#";          // e.g. "osticket_user"
$dbPass = "#";          // e.g. "your_password"
$tablePrefix = "ost_";  // default osTicket prefix, change if different

// Allow cross-origin requests from your dashboard
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

// Connect to MySQL
$conn = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

// ── Open Tickets ──
$ticketQuery = "
    SELECT
        t.ticket_id,
        t.number AS ticket_number,
        t.created AS created_date,
        c.subject,
        p.priority_desc AS priority,
        p.priority_color,
        CONCAT(s.firstname, ' ', s.lastname) AS assigned_to,
        t.status_id,
        ts.name AS status_name
    FROM {$tablePrefix}ticket t
    LEFT JOIN {$tablePrefix}ticket__cdata c ON c.ticket_id = t.ticket_id
    LEFT JOIN {$tablePrefix}ticket_priority p ON p.priority_id = t.priority_id
    LEFT JOIN {$tablePrefix}staff s ON s.staff_id = t.staff_id
    LEFT JOIN {$tablePrefix}ticket_status ts ON ts.id = t.status_id
    WHERE ts.state = 'open'
    ORDER BY t.created DESC
";

$result = $conn->query($ticketQuery);
$tickets = [];
$overdueCount = 0;
$highCount = 0;
$oldestDate = null;

while ($row = $result->fetch_assoc()) {
    // Calculate age
    $created = new DateTime($row["created_date"]);
    $now = new DateTime();
    $diff = $now->diff($created);

    if ($diff->days > 0) {
        $age = $diff->days . "d " . $diff->h . "h";
    } elseif ($diff->h > 0) {
        $age = $diff->h . "h " . $diff->i . "m";
    } else {
        $age = $diff->i . "m";
    }

    // Determine priority class
    $priorityName = strtolower($row["priority"] ?? "normal");
    $priorityClass = "normal";
    if (strpos($priorityName, "high") !== false || strpos($priorityName, "emergency") !== false) {
        $priorityClass = "high";
        $highCount++;
    }

    // Check if overdue (older than 2 days as default, adjust as needed)
    if ($diff->days >= 2) {
        $priorityClass = "overdue";
        $overdueCount++;
    }

    // Track oldest ticket
    if ($oldestDate === null || $created < $oldestDate) {
        $oldestDate = $created;
    }

    $tickets[] = [
        "id" => "#" . $row["ticket_number"],
        "age" => $age,
        "priority" => ucfirst($priorityName),
        "priorityClass" => $priorityClass,
        "subject" => $row["subject"] ?? "No subject",
        "assignedTo" => $row["assigned_to"] ?? "Unassigned",
    ];
}

// ── Closed Today ──
$closedQuery = "
    SELECT COUNT(*) AS count
    FROM {$tablePrefix}ticket t
    LEFT JOIN {$tablePrefix}ticket_status ts ON ts.id = t.status_id
    WHERE ts.state = 'closed'
    AND DATE(t.closed) = CURDATE()
";
$closedResult = $conn->query($closedQuery);
$closedToday = $closedResult->fetch_assoc()["count"] ?? 0;

// ── Oldest Ticket Age ──
$oldestAge = "0 days";
if ($oldestDate !== null) {
    $oldestDiff = (new DateTime())->diff($oldestDate);
    $oldestAge = $oldestDiff->days . " days";
}

// ── Build Response ──
$response = [
    "tickets" => $tickets,
    "stats" => [
        "open" => count($tickets),
        "overdue" => $overdueCount,
        "highPriority" => $highCount,
        "closedToday" => (int)$closedToday,
    ],
    "meta" => [
        "oldestTicket" => $oldestAge,
        "slaOverdue" => $overdueCount,
    ],
];

echo json_encode($response);
$conn->close();
?>
