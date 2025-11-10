// src/app.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const routes = require("./routes");
const app = express();

app.use(express.json());
app.use(cookieParser()); // 👈 cần cho refresh token dạng cookie

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "*",
  credentials: true, // 👈 để browser gửi cookie
}));
app.use(helmet());
app.use(morgan("dev"));

app.use("/api", routes);
app.get("/", (_, res) => res.send("EV Rental API 🚗⚡"));

module.exports = app;
