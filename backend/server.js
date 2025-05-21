const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const loginRoutes = require('./routes/loginRoutes');
require('dotenv').config();

const app = express();
const port = 3000;

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Simplified CORS configuration
/*app.use(cors({
  origin: 'http://127.0.0.1:5501',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'user-id'],
  optionsSuccessStatus: 204,
}));*/
app.use(cors({
  origin: '*', // Allow all origins (for development only, restrict in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'Uploads')));
 
  app.use('/api/auth', loginRoutes);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});