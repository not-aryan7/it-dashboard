# IT Dashboard - Session Summary

## Project Overview

**Project:** IT Operations TV Dashboard for Clinton County Government
**Goal:** Build a TV-friendly dashboard that displays live IT helpdesk ticket data from an osTicket MySQL database in a clean, Apple-style dark mode layout.
**GitHub:** `https://github.com/not-aryan7/it-dashboard`
**GitHub Username:** `not-aryan7`

**Constraints:**
- No frameworks (no React, Vue, Tailwind) — vanilla HTML, CSS, and JavaScript only
- Step-by-step development with confirmation between each step
- Minimal, Apple-like dark mode design
- Runs locally in a browser via a simple local server

---

## Step-by-Step Progression

### Step 1: Static HTML Layout
- Created the `it-dashboard` folder inside `/Users/aryanrajbhandari/Desktop/gitclaude/`
- Built `index.html` with:
  - Header: "IT OPERATIONS" title
  - Stats bar: Four summary counters (Open, Overdue, High Priority, Closed Today)
  - Ticket table: 9 rows with columns — Ticket #, Age, Priority, Subject, Assigned To
  - Footer: Oldest Ticket, SLA Status, Last Updated
- Created placeholder files for `styles.css`, `app.js`, and `config.js`

### Git Setup & GitHub Push
- Installed GitHub CLI (`brew install gh`)
- Authenticated as `not-aryan7`
- Initialized git repo and pushed to GitHub

### Step 2: Apple-Style Dark CSS
- Dark background (`#0d0d1a`) with Apple system font stack
- Stats bar with large thin-weight numbers, color coded (yellow=overdue, red=high priority, green=closed)
- Glassmorphic card for the ticket table with subtle border and rounded corners
- Priority dots using `::before` pseudo-elements (gray=normal, red=high/alert, yellow=overdue)
- Clean table spacing, muted header labels, subtle row dividers
- TV-friendly sizing: 42px header, 56px stat numbers, 16px table text

### Step 3: Dynamic JavaScript Rendering
- Emptied all hardcoded data from `index.html`, replaced with `id`-attributed empty containers
- Created `app.js` with:
  - Mock data arrays: `tickets` (9 objects), `stats` object, `meta` object
  - Render functions: `renderTickets()`, `renderStats()`, `renderFooter()`
  - `renderDashboard()` entry point fired on `DOMContentLoaded`

### Step 4: Auto-Refresh Timer & Live Timestamp
- Added `REFRESH_INTERVAL = 60000` (60 seconds)
- Added `getCurrentTime()` helper using `new Date().toLocaleTimeString()`
- Updated `renderFooter` to show real current time
- Added `setInterval(renderDashboard, REFRESH_INTERVAL)` for periodic refresh

### Exploring Data Connection Options (Multiple Pivots)

#### Attempt 1: osTicket API
- Explored osTicket's built-in API — discovered it's **write-only** (can only create tickets, not read)
- Scrapped this approach

#### Attempt 2: PHP Proxy to MySQL
- Created `dashboard.php` that would query MySQL directly and return JSON
- Identified the osTicket URL: `https://helpdesk.clintoncountygov.com/scp/index.php`
- Updated `app.js` with `fetch()` to call the PHP script, with fallback to mock data
- Removed `config.js`, added API_URL directly in `app.js`

#### Attempt 3 (Final): C# .NET API + MySQL
- Supervisor directed to use C# with direct MySQL database connection
- **Deleted** `dashboard.php` and all PHP-related code
- Cleaned up `app.js` back to mock data mode with `API_URL = "#"` placeholder

### Database Exploration
- User SSH'd into Ubuntu server, confirmed MySQL running
- Connected to MySQL via MySQL Workbench
- Explored osTicket schema and tables:
  - `ost_ticket` — Main ticket table (ticket_id, number, status_id, staff_id, created, closed)
  - `ost_ticket__cdata` — Ticket subjects and priority (ticket_id, subject, priority)
  - `ost_ticket_priority` — Priority lookup (priority_id 1-4: Low, Normal, High, Emergency)
  - `ost_ticket_status` — Status lookup (Open=1, Resolved=2, Closed=3, Waiting=6, On Hold=7)
  - `ost_staff` — Staff names (staff_id, firstname, lastname)
- Built and tested the master SQL query joining all 5 tables

### Step 5: C# ASP.NET API (TicketApi)
- Installed .NET SDK 8.0 on both Ubuntu server and work computer
- Created `TicketApi` project with 3 files:
  - `TicketApi.csproj` — .NET 8.0 project file with MySqlConnector dependency
  - `appsettings.json` — MySQL connection string with `#` placeholders
  - `Program.cs` — Full API with single `GET /api/tickets` endpoint
- The API:
  - Connects to MySQL using MySqlConnector
  - Runs the SQL query joining all 5 osTicket tables
  - Calculates ticket ages (days/hours/minutes)
  - Counts open, overdue, high priority, and closed-today tickets
  - Returns JSON with `tickets`, `stats`, and `meta` objects
  - Includes CORS support for cross-origin dashboard requests
- Successfully ran on work computer at `http://localhost:5045`
- API returned live data: **55 real tickets** from MySQL

### Connecting Dashboard to API
- Updated `app.js` with `API_URL = "http://localhost:5045/api/tickets"`
- Rewrote `renderDashboard()` to use `fetch()` with fallback to mock data on failure
- Debugged connection issues (see Bugs section below)
- Added `LIMIT 20` to SQL query and `.Take(10)` to only show top 10 tickets in table while computing stats from top 20

### Cleanup & Git Management
- Created `.gitignore` to exclude `bin/`, `obj/`, `*.user`, `*.suo`, `.vs/`
- Updated README with SQL query, fetch test command, and git commands

---

## Files Created/Modified

| File | Path | Description |
|---|---|---|
| `index.html` | `it-dashboard/index.html` | Dashboard HTML skeleton with id-attributed empty containers |
| `styles.css` | `it-dashboard/styles.css` | Dark mode Apple-style CSS |
| `app.js` | `it-dashboard/app.js` | JavaScript with mock data, render functions, fetch from API, auto-refresh |
| `README.md` | `it-dashboard/README.md` | SQL queries, fetch test commands, git commands |
| `sql-notes.md` | `it-dashboard/sql-notes.md` | Obsidian-formatted SQL notes |
| `Program.cs` | `it-dashboard/TicketApi/Program.cs` | C# ASP.NET minimal API — single endpoint querying MySQL |
| `appsettings.json` | `it-dashboard/TicketApi/appsettings.json` | MySQL connection string with placeholder credentials |
| `TicketApi.csproj` | `it-dashboard/TicketApi/TicketApi.csproj` | .NET 8.0 project file with MySqlConnector dependency |

**Deleted files:**
- `dashboard.php` (PHP proxy approach — scrapped)
- `config.js` (originally for API credentials — removed)

---

## Features Implemented

1. **Dark mode Apple-style TV dashboard** with glassmorphic card design
2. **Summary stats bar** showing Open, Overdue, High Priority, Closed Today counts
3. **Ticket table** with Ticket #, Age, Priority (color-coded dots), Subject, Assigned To
4. **Footer** with Oldest Ticket age, SLA overdue count, and live Last Updated timestamp
5. **Auto-refresh every 60 seconds** with live timestamp updates
6. **C# ASP.NET API** (`GET /api/tickets`) querying MySQL database
7. **Fallback to mock data** when API is unreachable
8. **SQL query** joining 5 osTicket tables
9. **Ticket age calculation** in the C# backend (days, hours, minutes)
10. **Top 10 tickets displayed** with stats computed from top 20

---

## Bugs Encountered and Fixed

1. **osTicket API is write-only** — Could not read tickets via API. Pivoted to PHP proxy, then to C# API.
2. **SQL Error 1064** — User accidentally pasted C# code (with `@"` string delimiters) into MySQL Workbench instead of clean SQL.
3. **Dashboard showing mock data instead of live data** — The `fetch()` call was failing silently. Diagnosed by testing fetch in browser console manually.
4. **`API_URL is not defined` error** — The user's work computer copy of `app.js` was missing the `API_URL` constant at the top.
5. **Browser cache** — Needed `Ctrl+Shift+R` hard refresh to load updated JS.
6. **`&&` not valid on work computer** — PowerShell on Windows doesn't support `&&` the same way; had to run commands separately.
7. **Too many tickets displayed** — All 55 open tickets shown. Fixed by adding `LIMIT 20` to SQL and `.Take(10)` in C#.
8. **Git pushing build artifacts** — `bin/` and `obj/` folders from .NET. Fixed with `.gitignore`.

---

## Current State

- **Front-end:** Complete and functional. Vanilla HTML/CSS/JS dashboard with dark mode, auto-refresh, and live timestamp.
- **Back-end:** C# ASP.NET minimal API (`TicketApi`) is built and tested. Returns live ticket data from MySQL on port 5045.
- **Database:** Connected to osTicket MySQL database on Ubuntu server. SQL query validated and working.
- **Integration:** Dashboard fetches from API at `http://localhost:5045/api/tickets` and displays live data. Falls back to mock data if API is unavailable.
- **GitHub:** Code pushed to `https://github.com/not-aryan7/it-dashboard`.
- **Two computers:** Mac (for Claude Code sessions and GitHub pushes) and a work computer (where .NET runs and the actual dashboard + API operate).

---

## Pending / Future Tasks

1. **Run the API as a service** — Currently `dotnet run` stops when the terminal closes. Needs systemd service or similar for persistent operation.
2. **Dockerize the application** — Interest in Docker for clean deployment.
3. **Deploy to production** — Move the API from the work computer to the Ubuntu server for permanent hosting.
4. **TV display setup** — Point a TV browser to the dashboard URL for always-on display.
5. **Real-time data** — Current setup uses a backup MySQL server that updates every few days, not the live osTicket database directly.
6. **Sensitive credentials** — `appsettings.json` still has placeholder `#` values in the GitHub repo; actual credentials are only on the work computer.

---

## Educational Topics Covered

Throughout the session, the following concepts were taught:
- **HTML:** Structure, semantic elements (`<strong>` vs `<span>`), id attributes
- **CSS:** Resets, box-sizing, pseudo-elements (`::before`), glassmorphism
- **JavaScript:** Arrays, objects, `.map()`, `getElementById`, `innerHTML`, `textContent`, template literals, `DOMContentLoaded`, `fetch()`, Promises, `setInterval`
- **SQL:** SELECT, FROM, LEFT JOIN, aliases, WHERE, ORDER BY, LIMIT, CONCAT, DESCRIBE, SHOW TABLES
- **Git:** add, commit, push, pull, clone, `.gitignore`
- **PHP vs C#** — differences and when to use each
- **.NET / ASP.NET** — what they are and how minimal APIs work
- **SSH basics** — connecting to remote servers
- **MySQL Workbench** — navigating databases and running queries
- **CORS** — Cross-Origin Resource Sharing and why it's needed
- **Backend APIs** — the concept of middleware between browser and database
