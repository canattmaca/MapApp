const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
const dbPath = "./db.json";

app.use(cors());
app.use(express.json());
app.use(express.static("build"));

app.get("/api/data", (req, res) => {
  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Data not received." });
    }
    res.json(JSON.parse(data));
  });
});

app.post("/api/data", (req, res) => {
  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Data not received." });
    }
    const jsonData = JSON.parse(data);
    const newItem = {
      id: jsonData.length,
      lat: req.body.lat,
      lng: req.body.lng,
      datetime: new Date().toISOString(),
    };
    jsonData.push(newItem);

    fs.writeFile(dbPath, JSON.stringify(jsonData), (err) => {
      if (err) {
        return res.status(500).json({ error: "Data not loaded." });
      }
      res.json(newItem);
    });
  });
});

app.delete("/api/data/:id", (req, res) => {
  const idToDelete = parseInt(req.params.id);
  fs.readFile(dbPath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Data not received." });
    }
    const jsonData = JSON.parse(data);
    const updatedData = jsonData.filter((point) => point.id !== idToDelete);

    fs.writeFile(dbPath, JSON.stringify(updatedData), (err) => {
      if (err) {
        return res.status(500).json({ error: "Data not updated." });
      }
      res.json({ message: "Point deleted successfully." });
    });
  });
});

const port = 3001;
app.listen(port, () => {
  console.log(`Map App listening on port ${port}`);
});
