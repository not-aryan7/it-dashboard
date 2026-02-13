// ── Config ──

const REFRESH_INTERVAL = 60000; // 60 seconds
const API_URL = "https://helpdesk.clintoncountygov.com/api/dashboard.php";

// ── Mock Data (fallback if API is unavailable) ──

const mockTickets = [
  { id: "#1112239", age: "59m",    priority: "Normal",  priorityClass: "normal",       subject: "Please post in Partner Nurse Q1 2026...",    assignedTo: "Karen Ploats-McGrath" },
  { id: "#1112237", age: "2h 30m", priority: "High",    priorityClass: "high",         subject: "Camera Equipment and footage help",          assignedTo: "Catherine LaFountain" },
  { id: "#1112207", age: "10h",    priority: "Normal",  priorityClass: "normal",       subject: "Nessus Scan Results: Server Scan - Re...",   assignedTo: "David Randall" },
  { id: "#1112203", age: "19h 2m", priority: "Normal",  priorityClass: "normal-alert", subject: "External Drive Missing and Error",            assignedTo: "Tammy Lacey" },
  { id: "#1112200", age: "1d 21h", priority: "Overdue", priorityClass: "overdue",      subject: "Google account for subpoenas",               assignedTo: "Adriena Sadler" },
  { id: "#1112108", age: "2d 4h",  priority: "Normal",  priorityClass: "normal-alert", subject: "Slow printing",                              assignedTo: "John Gaver" },
  { id: "#1112107", age: "3d 7h",  priority: "High",    priorityClass: "high",         subject: "Missing apps",                               assignedTo: "John Gaver" },
  { id: "#1112225", age: "7d 22h", priority: "Overdue", priorityClass: "overdue",      subject: "FW: Operator client?",                       assignedTo: "Peggy Rey" },
  { id: "#1112236", age: "9d 7h",  priority: "Overdue", priorityClass: "overdue",      subject: "Sharepoint - Airport Landing Page ...",       assignedTo: "Luis Oquendo" },
];

const mockStats = {
  open: 19,
  overdue: 4,
  highPriority: 3,
  closedToday: 22,
};

const mockMeta = {
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
      renderStats(mockStats);
      renderTickets(mockTickets);
      renderFooter(mockMeta);
    });
}

// ── Initialize ──

document.addEventListener("DOMContentLoaded", function () {
  renderDashboard();
  setInterval(renderDashboard, REFRESH_INTERVAL);
});
