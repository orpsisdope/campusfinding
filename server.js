require("dotenv").config();

const express = require("express");
const path = require("path");
const pool = require("./db");

const authRoutes = require("./routes/authRoutes");
const itemRoutes = require("./routes/itemRoutes");

if (!process.env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is missing. Add it to your .env file."
  );
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(
  express.json({
    limit: "100kb"
  })
);

app.use(
  express.urlencoded({
    extended: false
  })
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/items",
  itemRoutes
);

app.get(
  "/api/health",
  async (req, res) => {
    try {
      await pool.query("SELECT 1");

      return res.json({
        status: "ok"
      });
    } catch (error) {
      console.error(
        "Health check failed:",
        error.message
      );

      return res.status(500).json({
        status: "database unavailable"
      });
    }
  }
);

app.use(
  "/api",
  (req, res) => {
    return res.status(404).json({
      message: "API route not found."
    });
  }
);

app.use(
  express.static(
    path.join(__dirname, "public")
  )
);

app.get(
  "/",
  (req, res) => {
    return res.sendFile(
      path.join(
        __dirname,
        "public",
        "index.html"
      )
    );
  }
);

app.use(
  (err, req, res, next) => {
    console.error(
      "Unhandled server error:",
      err
    );

    return res.status(500).json({
      message: "Unexpected server error."
    });
  }
);

app.listen(
  PORT,
  () => {
    console.log(
      `CampusFind is running on http://localhost:${PORT}`
    );
  }
);