// server.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
  host: "feenix-mariadb.swin.edu.au",
  user: "s105075090", // e.g., 's104762100'
  password: "201205",
  database: "s105075090_db",
});
// const db = mysql.createConnection({
//   host: "feenix-mariadb.swin.edu.au",
//   user: "s104762100", // e.g., 's104762100'
//   password: "161100",
//   database: "s104762100_db",
// });
// Optional: Debug connection status
db.connect((err) => {
  if (err) {
    console.error("❌ Failed to connect to Feenix:", err.message);
  } else {
    console.log("✅ Connected to Feenix MariaDB");
  }
});

app.get("/api/archers", (req, res) => {
  db.query("SELECT * FROM Archer", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
