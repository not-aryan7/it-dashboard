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
