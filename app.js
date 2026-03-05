// ── Config ──

const REFRESH_INTERVAL = 60000; // 60 seconds
const API_BASE = "http://localhost:5045";
const API_URL = API_BASE + "/api/tickets";
const LOGIN_URL = API_BASE + "/api/login";
var AUTH_KEY = "dashboard_auth";

// ── Auth ──

function checkAuth() {
  var token = localStorage.getItem(AUTH_KEY);
  if (token) {
    // Verify the token still works by testing the API
    fetch(API_URL, {
      headers: { "Authorization": "Bearer " + token }
    })
      .then(function (response) {
        if (response.ok) {
          showDashboard();
        } else {
          showLogin();
        }
      })
      .catch(function () {
        // API down — show login
        showLogin();
      });
  } else {
    showLogin();
  }
}

function showLogin() {
  document.getElementById("login-screen").style.display = "flex";
  document.getElementById("dashboard").style.display = "none";
}

function handleLogin() {
  var user = document.getElementById("login-user").value;
  var pass = document.getElementById("login-pass").value;
  var error = document.getElementById("login-error");

  fetch(LOGIN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user, password: pass })
  })
    .then(function (response) {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Invalid");
      }
    })
    .then(function (data) {
      localStorage.setItem(AUTH_KEY, data.token);
      showDashboard();
    })
    .catch(function () {
      error.textContent = "Invalid credentials";
    });
}

function showDashboard() {
  document.getElementById("login-screen").style.display = "none";
  document.getElementById("dashboard").style.display = "";
  renderDashboard();
  setInterval(renderDashboard, REFRESH_INTERVAL);
}

// ── Mock Data ──

const tickets = [
  { id: "#1112239", age: "59m",    priority: "Normal",  priorityClass: "normal",       subject: "Please post in Partner Nurse Q1 2026...",    from: "Sarah Johnson",     assignedTo: "Karen Ploats-McGrath" },
  { id: "#1112237", age: "2h 30m", priority: "High",    priorityClass: "high",         subject: "Camera Equipment and footage help",          from: "Mike Chen",         assignedTo: "Catherine LaFountain" },
  { id: "#1112207", age: "10h",    priority: "Normal",  priorityClass: "normal",       subject: "Nessus Scan Results: Server Scan - Re...",   from: "Auto Scanner",      assignedTo: "David Randall" },
  { id: "#1112203", age: "19h 2m", priority: "Normal",  priorityClass: "normal-alert", subject: "External Drive Missing and Error",            from: "Lisa Martinez",     assignedTo: "Tammy Lacey" },
  { id: "#1112200", age: "1d 21h", priority: "Overdue", priorityClass: "overdue",      subject: "Google account for subpoenas",               from: "Tom Bradley",       assignedTo: "Adriena Sadler" },
  { id: "#1112108", age: "2d 4h",  priority: "Normal",  priorityClass: "normal-alert", subject: "Slow printing",                              from: "Amy Wilson",        assignedTo: "John Gaver" },
  { id: "#1112107", age: "3d 7h",  priority: "High",    priorityClass: "high",         subject: "Missing apps",                               from: "Robert Davis",      assignedTo: "John Gaver" },
  { id: "#1112225", age: "7d 22h", priority: "Overdue", priorityClass: "overdue",      subject: "FW: Operator client?",                       from: "Jennifer Lee",      assignedTo: "Peggy Rey" },
  { id: "#1112236", age: "9d 7h",  priority: "Overdue", priorityClass: "overdue",      subject: "Sharepoint - Airport Landing Page ...",       from: "Carlos Ruiz",       assignedTo: "Luis Oquendo" },
];

const stats = {
  open: 19,
  overdue: 4,
  highPriority: 3,
  closedToday: 22,
};

const meta = {
  oldestTicket: "11 days",
  slaOverdue: 3,
};

// ── Helpers ──

function getCurrentTime() {
  return new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ── Render Functions ──

function renderTickets(data) {
  const tbody = document.getElementById("ticket-body");
  tbody.innerHTML = data
    .map(
      (t) => `
      <tr>
        <td>${t.id}</td>
        <td>${t.age}</td>
        <td><span class="priority ${t.priorityClass}">${t.priority}</span></td>
        <td class="subject">${t.subject}</td>
        <td>${t.from}</td>
        <td>${t.assignedTo}</td>
      </tr>`
    )
    .join("");
}

function renderStats(data) {
  document.getElementById("stat-open").textContent = data.open;
  document.getElementById("stat-overdue").textContent = data.overdue;
  document.getElementById("stat-high").textContent = data.highPriority;
  document.getElementById("stat-closed").textContent = data.closedToday;
}

function renderFooter(data) {
  document.getElementById("footer-oldest").textContent = data.oldestTicket;
  document.getElementById("footer-sla").textContent = data.slaOverdue + " Overdue";
  document.getElementById("footer-updated").textContent = getCurrentTime();
}

// ── Fetch and Render ──

function renderDashboard() {
  var token = localStorage.getItem(AUTH_KEY);
  fetch(API_URL, {
    headers: { "Authorization": "Bearer " + token }
  })
    .then(function (response) {
      if (response.status === 401) {
        // Token expired (server restarted) — show login
        showLogin();
        return;
      }
      return response.json();
    })
    .then(function (data) {
      if (!data) return;
      renderStats(data.stats);
      renderTickets(data.tickets);
      renderFooter(data.meta);
    })
    .catch(function () {
      // API unavailable — use mock data
      renderStats(stats);
      renderTickets(tickets);
      renderFooter(meta);
    });
}

// ── Initialize ──

document.addEventListener("DOMContentLoaded", function () {
  checkAuth();

  document.getElementById("login-btn").addEventListener("click", handleLogin);

  // Allow pressing Enter to log in
  document.getElementById("login-pass").addEventListener("keydown", function (e) {
    if (e.key === "Enter") handleLogin();
  });
  document.getElementById("login-user").addEventListener("keydown", function (e) {
    if (e.key === "Enter") handleLogin();
  });
});
