const pool = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeEmail(value) {
  return cleanText(value).toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

exports.signup = async (req, res) => {
  const username = cleanText(req.body.username);
  const email = normalizeEmail(req.body.email);
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!username || !email || !password) {
    return res.status(400).json({
      message: "Username, email, and password are required."
    });
  }

  if (username.length < 3 || username.length > 50) {
    return res.status(400).json({
      message: "Username must be between 3 and 50 characters."
    });
  }

  if (!isValidEmail(email) || email.length > 120) {
    return res.status(400).json({
      message: "Please enter a valid email address."
    });
  }

  if (password.length < 6 || password.length > 100) {
    return res.status(400).json({
      message: "Password must be between 6 and 100 characters."
    });
  }

  try {
    const existingUser = await pool.query(
      `SELECT id
       FROM users
       WHERE LOWER(email) = LOWER($1)
          OR LOWER(username) = LOWER($2)
       LIMIT 1`,
      [email, username]
    );

    if (existingUser.rowCount > 0) {
      return res.status(409).json({
        message: "Username or email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (username, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, username, email`,
      [username, email, hashedPassword]
    );

    const user = result.rows[0];
    const token = createToken(user);

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      username: user.username,
      user
    });
  } catch (error) {
    console.error("Signup failed:", error.message);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Username or email already exists."
      });
    }

    return res.status(500).json({
      message: "Signup failed. Please try again."
    });
  }
};

exports.login = async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required."
    });
  }

  try {
    const result = await pool.query(
      `SELECT id, username, email, password
       FROM users
       WHERE LOWER(email) = LOWER($1)
       LIMIT 1`,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        message: "Wrong email or password."
      });
    }

    const user = result.rows[0];

    if (
      typeof user.password !== "string" ||
      !/^\$2[aby]\$/.test(user.password)
    ) {
      console.error(`User ${user.id} has an invalid stored password hash.`);

      return res.status(401).json({
        message: "Wrong email or password."
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Wrong email or password."
      });
    }

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email
    };

    const token = createToken(safeUser);

    return res.json({
      message: "Login successful.",
      token,
      username: safeUser.username,
      user: safeUser
    });
  } catch (error) {
    console.error("Login failed:", error.message);

    return res.status(500).json({
      message: "Login failed. Please try again."
    });
  }
};

exports.me = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email
       FROM users
       WHERE id = $1
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        message: "Invalid session."
      });
    }

    return res.json({
      user: result.rows[0]
    });
  } catch (error) {
    console.error(
      "Could not load current user:",
      error.message
    );

    return res.status(500).json({
      message: "Could not validate session."
    });
  }
};