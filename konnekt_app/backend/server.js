const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const clubRoutes = require("./routes/clubs");
const cors = require("cors");
require("dotenv").config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/clubs", clubRoutes);

const PORT = process.env.PORT || 5000;
const IP = process.env.IP_ADDRESS || "localhost";

const checkinRoutes = require("./routes/checkin");
app.use("/api/checkin", checkinRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://${IP}:${PORT}`);
});
