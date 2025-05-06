const express = require('express');
const mongoose = require('mongoose');
const app = express();
const port = 3000;
require('dotenv').config();
// Middleware to parse JSON request bodies
app.use(express.json());

// Import and use login routes
const loginRoutes = require('./routes/loginRoutes');
app.use('/api/auth', loginRoutes);

// Database connection logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // 30 seconds timeout
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1); // Exit process with failure
  }
};

// Connect to the database
connectDB();

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});