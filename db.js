const { Pool } = require("pg");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing. Add it to your .env file.");
}

const poolConfig = {
  connectionString: process.env.DATABASE_URL
};
