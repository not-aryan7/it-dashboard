// ── Config ──

const REFRESH_INTERVAL = 60000; // 60 seconds
const API_URL = "http://localhost:5045/api/tickets";
const AUTH_USER = "dashboard";
const AUTH_PASS = "Clinton518???";
const COOKIE_NAME = "dashboard_auth";
const COOKIE_DAYS = 30;

// ── Cookie Helpers ──

function setCookie(name, value, days) {
  var expires = "";
  if (days) {
    var date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}

function getCookie(name) {
  var match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

// ── Auth ──

function checkAuth() {
  if (getCookie(COOKIE_NAME) === "true") {
    showDashboard();
  } else {
    document.getElementById("login-screen").style.display = "flex";
    document.getElementById("dashboard").style.display = "none";
  }
}

function handleLogin() {
  var user = document.getElementById("login-user").value;
  var pass = document.getElementById("login-pass").value;
  var error = document.getElementById("login-error");

  if (user === AUTH_USER && pass === AUTH_PASS) {
    setCookie(COOKIE_NAME, "true", COOKIE_DAYS);
    showDashboard();
  } else {
    error.textContent = "Invalid credentials";
  }
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
  fetch(API_URL)
    .then(function (response) {
      return response.json();
    })
    .then(function (data) {
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
