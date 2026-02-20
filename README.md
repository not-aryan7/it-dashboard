# IT Operations Dashboard

## SQL Query - Open Tickets

```sql
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
ORDER BY t.created DESC;
```

## Console Test - Fetch API

```js
fetch("http://localhost:5045/api/tickets").then(r => r.json()).then(d => console.log(d)).catch(e => console.log("ERROR:", e))
```

## Git Push Commands

```
echo bin/ > .gitignore
echo obj/ >> .gitignore
echo *.user >> .gitignore
echo *.suo >> .gitignore
echo .vs/ >> .gitignore
```

```
git add .gitignore
git add Program.cs
git add appsettings.json
git add app.js
git add index.html
git add styles.css
git add README.md
git add TicketApi/TicketApi.csproj
git add TicketApi/Program.cs
git add TicketApi/appsettings.json
```

```
git commit -m "Update dashboard with live API connection"
```

```
git push origin main
```
