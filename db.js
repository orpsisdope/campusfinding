const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Add it to your .env file.");
}

const poolConfig = {
  connectionString: process.env.DATABASE_URL
};

if (process.env.NODE_ENV === "production") {
  poolConfig.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(poolConfig);

module.exports = pool;