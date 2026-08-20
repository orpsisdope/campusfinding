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
