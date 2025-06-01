// server.js
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// For simple connection (without pooling)
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "s105075090_db",
});

db.getConnection()
  .then(() => console.log("✅ Connected to Feenix MariaDB"))
  .catch((err) =>
    console.error("❌ Failed to connect to Feenix:", err.message)
  );

app.get("/api/archers", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM Archer");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/rounds", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM Round");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/divisions", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM Division");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/roundDefinition/:roundID", async (req, res) => {
  const roundID = req.params.roundID;
  try {
    const [results] = await db.query(
      "SELECT * FROM RoundDefinition WHERE RoundID = ?",
      [roundID]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/targetFaces/:roundID", async (req, res) => {
  const roundID = req.params.roundID;
  try {
    const [results] = await db.query(
      "SELECT * FROM TargetFace WHERE RoundID = ?",
      [roundID]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/roundRanges", async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM RoundRange");
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/clubcompetitionparticipation", async (req, res) => {
  const { ArcherID, ClubCompetitionID, CategoryID, Date, Time } = req.body;
  console.log("Received data:", req.body);

  if (!ArcherID || !ClubCompetitionID || !CategoryID || !Date || !Time) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const insertQuery = `
    INSERT INTO clubcompetitionparticipation 
    (ArcherID, ClubCompetitionID, CategoryID, Date, Time)
    VALUES (?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await db.query(insertQuery, [
      ArcherID,
      ClubCompetitionID,
      CategoryID,
      Date,
      Time,
    ]);

    return res.status(201).json({
      message: "Participation recorded successfully",
      ParticipationID: result.insertId,
    });
  } catch (err) {
    console.error("❌ Insert error:", err);
    return res.status(500).json({ error: "Failed to insert participation" });
  }
});

app.post("/api/score", async (req, res) => {
  const {
    ParticipationID,
    RoundID,
    RoundRange,
    EndNum,
    Arrow1,
    Arrow2,
    Arrow3,
    Arrow4,
    Arrow5,
    Arrow6,
  } = req.body;

  if (!ParticipationID || !RoundID || !RoundRange || !EndNum) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const query = `
      INSERT INTO Score (
        ParticipationID, RoundID, RoundRange, EndNum,
        Arrow1, Arrow2, Arrow3, Arrow4, Arrow5, Arrow6
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await db.query(query, [
      ParticipationID,
      RoundID,
      RoundRange,
      EndNum,
      Arrow1,
      Arrow2,
      Arrow3,
      Arrow4,
      Arrow5,
      Arrow6,
    ]);

    res
      .status(201)
      .json({ message: "Score submitted", insertId: result.insertId });
  } catch (err) {
    console.error("DB error on inserting score:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/getallscores", async (req, res) => {
  const { ParticipationID, RoundID, RoundRange } = req.query;

  if (!ParticipationID || !RoundID || !RoundRange) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  const sql = `
    SELECT * FROM Score 
    WHERE ParticipationID = ? AND RoundID = ? AND RoundRange = ? 
  `;

  try {
    const [rows] = await db.query(sql, [ParticipationID, RoundID, RoundRange]);
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching scores:", err);
    res.status(500).json({ error: "Database query failed" });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
