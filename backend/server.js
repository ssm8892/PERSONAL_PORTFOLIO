const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Extract database name from MongoDB URI
const dbName = "portfolioDB";  // Ensure this matches your MongoDB Compass DB name
  
mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      dbName: dbName  // Explicitly select the database
  })
  .then(() => console.log(`MongoDB Connected to ${dbName}`))
  .catch(err => console.log("MongoDB Connection Error:", err));

app.use("/api/projects", require("./routes/projectRoutes"));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
