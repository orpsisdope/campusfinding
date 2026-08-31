const pool = require("../db");

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00Z`);

  return (
    !Number.isNaN(date.getTime()) &&
    date.toISOString().slice(0, 10) === value
  );
}

exports.getItems = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, user_id, title, type, category,
              location, item_date, description,
              contact, resolved, created_at
       FROM items
       ORDER BY resolved ASC, created_at DESC`
    );

    return res.json(result.rows);
  } catch (error) {
    console.error(
      "Could not load items:",
      error.message
    );

    return res.status(500).json({
      message: "Could not load items."
    });
  }
};

exports.createItem = async (req, res) => {
  const values = {
    title:
      typeof req.body.title === "string"
        ? req.body.title.trim()
        : "",

    type:
      typeof req.body.type === "string"
        ? req.body.type.trim().toLowerCase()
        : "",

    category:
      typeof req.body.category === "string"
        ? req.body.category.trim()
        : "",

    location:
      typeof req.body.location === "string"
        ? req.body.location.trim()
        : "",

    item_date:
      typeof req.body.item_date === "string"
        ? req.body.item_date.trim()
        : "",

    description:
      typeof req.body.description === "string"
        ? req.body.description.trim()
        : "",

    contact:
      typeof req.body.contact === "string"
        ? req.body.contact.trim()
        : ""
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
    return res.status(400).json({
      message: "Please fill in all fields."
    });
  }

  if (!["lost", "found"].includes(values.type)) {
    return res.status(400).json({
      message: "Type must be lost or found."
    });
  }

  if (!isValidDate(values.item_date)) {
    return res.status(400).json({
      message: "Please enter a valid date."
    });
  }

  if (
    values.title.length > 100 ||
    values.category.length > 50 ||
    values.location.length > 100 ||
    values.contact.length > 120
  ) {
    return res.status(400).json({
      message: "One or more fields are too long."
    });
  }

  try {
    const result = await pool.query(
      `INSERT INTO items
       (
         user_id,
         title,
         type,
         category,
         location,
         item_date,
         description,
         contact
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, user_id, title, type, category,
                 location, item_date, description,
                 contact, resolved, created_at`,
      [
        req.user.id,
        values.title,
        values.type,
        values.category,
        values.location,
        values.item_date,
        values.description,
        values.contact
      ]
    );

    return res.status(201).json(
      result.rows[0]
    );
  } catch (error) {
    console.error(
      "Could not create item:",
      error.message
    );

    return res.status(500).json({
      message: "Could not create item."
    });
  }
};

exports.resolveItem = async (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({
      message: "Invalid item id."
    });
  }

  try {
    const result = await pool.query(
      `UPDATE items
       SET resolved = TRUE
       WHERE id = $1
       RETURNING id, user_id, title, type, category,
                 location, item_date, description,
                 contact, resolved, created_at`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Item not found."
      });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error(
      "Could not resolve item:",
      error.message
    );

    return res.status(500).json({
      message: "Could not update item."
    });
  }
};