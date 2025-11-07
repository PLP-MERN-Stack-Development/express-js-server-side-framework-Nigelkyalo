// src/routes/books.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../middleware/auth');
const validateBook = require('../middleware/validateBook');
const ApiError = require('../errors/ApiError');
const mongoose = require('mongoose');
let Book;
try {
  Book = require('../models/book');
} catch (e) {
  Book = null;
}

const router = express.Router();

// In-memory store for books (fallback)
let books = [
  {
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    genre: 'Fiction',
    published_year: 1960,
    price: 12.99,
    in_stock: true,
    pages: 336,
    publisher: 'J. B. Lippincott & Co.'
  },
  // ... other books will be loaded from seed script
];

const usingDb = () => mongoose.connection && mongoose.connection.readyState === 1 && Book;

// GET /api/books
// Supports: ?genre=Fiction, ?q=searchText, ?page=1&limit=10
router.get('/', asyncHandler(async (req, res) => {
  const { genre, q, page = 1, limit = 10 } = req.query;
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, parseInt(limit, 10) || 10);

  if (usingDb()) {
    const filter = {};
    if (genre) filter.genre = new RegExp(`^${String(genre)}$`, 'i');
    if (q) {
      filter.$or = [
        { title: new RegExp(q, 'i') },
        { author: new RegExp(q, 'i') },
        { publisher: new RegExp(q, 'i') }
      ];
    }
    const total = await Book.countDocuments(filter);
    const docs = await Book.find(filter).skip((p - 1) * l).limit(l).exec();
    res.json({ total, page: p, limit: l, data: docs });
    return;
  }

  let results = books;
  if (genre) {
    results = results.filter(b => b.genre.toLowerCase() === String(genre).toLowerCase());
  }
  if (q) {
    const term = String(q).toLowerCase();
    results = results.filter(b => 
      b.title.toLowerCase().includes(term) || 
      b.author.toLowerCase().includes(term) ||
      b.publisher.toLowerCase().includes(term)
    );
  }
  
  const start = (p - 1) * l;
  const paged = results.slice(start, start + l);
  res.json({ total: results.length, page: p, limit: l, data: paged });
}));

// GET /api/books/search?q=term
router.get('/search', asyncHandler(async (req, res) => {
  const q = (req.query.q || '').toString();
  if (!q) return res.json([]);

  if (usingDb()) {
    const docs = await Book.find({
      $or: [
        { title: new RegExp(q, 'i') },
        { author: new RegExp(q, 'i') },
        { publisher: new RegExp(q, 'i') }
      ]
    }).exec();
    return res.json(docs);
  }

  const term = q.toLowerCase();
  const found = books.filter(b => 
    b.title.toLowerCase().includes(term) || 
    b.author.toLowerCase().includes(term) ||
    b.publisher.toLowerCase().includes(term)
  );
  res.json(found);
}));

// GET /api/books/stats
router.get('/stats', asyncHandler(async (req, res) => {
  if (usingDb()) {
    const [genreCounts, yearCounts] = await Promise.all([
      Book.aggregate([
        { $group: { _id: '$genre', count: { $sum: 1 } } }
      ]),
      Book.aggregate([
        { $group: { _id: '$published_year', count: { $sum: 1 } } }
      ])
    ]);

    const stats = {
      total: await Book.countDocuments(),
      byGenre: genreCounts.reduce((acc, {_id, count}) => ({ ...acc, [_id]: count }), {}),
      byYear: yearCounts.reduce((acc, {_id, count}) => ({ ...acc, [_id]: count }), {}),
      inStock: await Book.countDocuments({ in_stock: true }),
      outOfStock: await Book.countDocuments({ in_stock: false })
    };
    return res.json(stats);
  }

  const stats = {
    total: books.length,
    byGenre: books.reduce((acc, b) => {
      acc[b.genre] = (acc[b.genre] || 0) + 1;
      return acc;
    }, {}),
    byYear: books.reduce((acc, b) => {
      acc[b.published_year] = (acc[b.published_year] || 0) + 1;
      return acc;
    }, {}),
    inStock: books.filter(b => b.in_stock).length,
    outOfStock: books.filter(b => !b.in_stock).length
  };
  res.json(stats);
}));

// GET /api/books/:id
router.get('/:id', asyncHandler(async (req, res, next) => {
  if (usingDb()) {
    const doc = await Book.findById(req.params.id).exec();
    if (!doc) return next(new ApiError(404, 'Book not found'));
    return res.json(doc);
  }

  const book = books.find(b => b.id === req.params.id);
  if (!book) return next(new ApiError(404, 'Book not found'));
  res.json(book);
}));

// POST /api/books
router.post('/', auth, validateBook, asyncHandler(async (req, res) => {
  const bookData = {
    title: req.body.title,
    author: req.body.author,
    genre: req.body.genre,
    published_year: req.body.published_year,
    price: req.body.price,
    in_stock: req.body.in_stock,
    pages: req.body.pages,
    publisher: req.body.publisher
  };

  if (usingDb()) {
    const created = await Book.create(bookData);
    return res.status(201).json(created);
  }

  const newBook = { id: uuidv4(), ...bookData };
  books.push(newBook);
  res.status(201).json(newBook);
}));

// PUT /api/books/:id
router.put('/:id', auth, validateBook, asyncHandler(async (req, res, next) => {
  const updates = {
    title: req.body.title,
    author: req.body.author,
    genre: req.body.genre,
    published_year: req.body.published_year,
    price: req.body.price,
    in_stock: req.body.in_stock,
    pages: req.body.pages,
    publisher: req.body.publisher
  };

  if (usingDb()) {
    const updated = await Book.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    ).exec();
    if (!updated) return next(new ApiError(404, 'Book not found'));
    return res.json(updated);
  }

  const idx = books.findIndex(b => b.id === req.params.id);
  if (idx === -1) return next(new ApiError(404, 'Book not found'));
  books[idx] = { id: books[idx].id, ...updates };
  res.json(books[idx]);
}));

// DELETE /api/books/:id
router.delete('/:id', auth, asyncHandler(async (req, res, next) => {
  if (usingDb()) {
    const deleted = await Book.findByIdAndDelete(req.params.id).exec();
    if (!deleted) return next(new ApiError(404, 'Book not found'));
    return res.json({ deleted });
  }

  const idx = books.findIndex(b => b.id === req.params.id);
  if (idx === -1) return next(new ApiError(404, 'Book not found'));
  const deleted = books.splice(idx, 1)[0];
  res.json({ deleted });
}));

module.exports = router;