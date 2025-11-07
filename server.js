// server.js - Enhanced Express server for Week 2 assignment

const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

const PORT = process.env.PORT || 3000;

const logger = require('./src/middleware/logger');
const booksRouter = require('./src/routes/books');
const ApiError = require('./src/errors/ApiError');

const app = express();

// Built-in and third-party middleware
app.use(bodyParser.json());
app.use(logger);

// Root
app.get('/', (req, res) => {
  res.send('Welcome to the Book API! Use /api/books for the book endpoints.');
});

// API routes - mount books router
app.use('/api/books', booksRouter);

// 404 handler for unknown routes
app.use((req, res, next) => {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} not found`));
});

// Global error handler
app.use((err, req, res, next) => {
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({
    status: 'error',
    statusCode: status,
    message
  });
});

// Connect to MongoDB if MONGODB_URI provided
const mongoUri = process.env.MONGODB_URI;
if (mongoUri) {
  mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB - falling back to in-memory store', err.message);
      app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
      });
    });
} else {
  // No MongoDB configured; start server with in-memory store
  console.log('No MONGODB_URI configured — using in-memory data store');
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;