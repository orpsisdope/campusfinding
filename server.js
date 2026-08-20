require("dotenv").config();


const express = require("express");
const path = require("path");
const pool = require("./db");


const app = express();
const PORT = process.env.PORT || 3000;


app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));


function isValidDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}


app.get("/api/items", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, type, category, location, item_date,
              description, contact, resolved, created_at
       FROM items
       ORDER BY resolved ASC, created_at DESC`
    );


    res.json(result.rows);
  } catch (error) {
    console.error("Could not load items:", error.message);
    res.status(500).json({ message: "Could not load items." });
  }
});


app.post("/api/items", async (req, res) => {
  const {
    title,
    type,
    category,
    location,
    item_date,
    description,
    contact
  } = req.body;


  const values = {
    title: typeof title === "string" ? title.trim() : "",
    type: typeof type === "string" ? type.trim().toLowerCase() : "",
    category: typeof category === "string" ? category.trim() : "",
    location: typeof location === "string" ? location.trim() : "",
    item_date: typeof item_date === "string" ? item_date.trim() : "",
    description: typeof description === "string" ? description.trim() : "",
    contact: typeof contact === "string" ? contact.trim() : ""
  };


  if (
    !values.title ||
    !values.type ||
    !values.category ||
    !values.location ||
    !values.item_date ||
    !values.description ||
    !values.contact
  ) {
    return res.status(400).json({ message: "Please fill in all fields." });
  }


  if (!['lost', 'found'].includes(values.type)) {
    return res.status(400).json({ message: "Type must be lost or found." });
  }


  if (!isValidDate(values.item_date)) {
    return res.status(400).json({ message: "Please enter a valid date." });
  }


  if (values.title.length > 100 || values.location.length > 100 || values.contact.length > 120) {
    return res.status(400).json({ message: "One or more fields are too long." });
  }


  try {
    const result = await pool.query(
      `INSERT INTO items
       (title, type, category, location, item_date, description, contact)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        values.title,
        values.type,
        values.category,
        values.location,
        values.item_date,
        values.description,
        values.contact
      ]
    );


    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Could not create item:", error.message);
    res.status(500).json({ message: "Could not create item." });
  }
});


app.patch("/api/items/:id/resolve", async (req, res) => {
  const id = Number(req.params.id);


  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid item id." });
  }


  try {
    const result = await pool.query(
      `UPDATE items
       SET resolved = TRUE
       WHERE id = $1
       RETURNING *`,
      [id]
    );


    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Item not found." });
    }


    res.json(result.rows[0]);
  } catch (error) {
    console.error("Could not resolve item:", error.message);
    res.status(500).json({ message: "Could not update item." });
  }
});


app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok" });
  } catch (error) {
    res.status(500).json({ status: "database unavailable" });
  }
});


app.use("/api", (req, res) => {
  res.status(404).json({ message: "API route not found." });
});


app.listen(PORT, () => {
  console.log(`CampusFind is running on http://localhost:${PORT}`);
});


