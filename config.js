// ── Dashboard Configuration ──
// Replace these placeholder values with your actual osTicket server details

const CONFIG = {
  // The URL to the PHP script that queries the database
  // Your supervisor will upload this file to the osTicket server
  apiUrl: "https://helpdesk.clintoncountygov.com/api/dashboard.php",

  // Refresh interval in milliseconds (60000 = 60 seconds)
  refreshInterval: 60000,
};
