const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const cors = require("cors");
require("dotenv").config();

const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running on http://localhost:${PORT}`));
