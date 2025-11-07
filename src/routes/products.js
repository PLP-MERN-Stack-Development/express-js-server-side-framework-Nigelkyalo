// src/routes/products.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('../utils/asyncHandler');
const auth = require('../middleware/auth');
const validateProduct = require('../middleware/validateProduct');
const ApiError = require('../errors/ApiError');
const mongoose = require('mongoose');
let Product;
try {
  Product = require('../models/product');
} catch (e) {
  Product = null;
}

const router = express.Router();

// In-memory store for products (fallback)
let products = [
  { id: '1', name: 'Laptop', description: 'High-performance laptop with 16GB RAM', price: 1200, category: 'electronics', inStock: true },
  { id: '2', name: 'Smartphone', description: 'Latest model with 128GB storage', price: 800, category: 'electronics', inStock: true },
  { id: '3', name: 'Coffee Maker', description: 'Programmable coffee maker with timer', price: 50, category: 'kitchen', inStock: false }
];

const usingDb = () => mongoose.connection && mongoose.connection.readyState === 1 && Product;

// helper to map mongoose product to plain object
const toPlain = p => ({ id: p._id.toString(), name: p.name, description: p.description, price: p.price, category: p.category, inStock: p.inStock });

// GET /api/products
// Supports: ?category=electronics, ?q=searchText, ?page=1&limit=10
router.get('/', asyncHandler(async (req, res) => {
  const { category, q, page = 1, limit = 10 } = req.query;
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, parseInt(limit, 10) || 10);

  if (usingDb()) {
    const filter = {};
    if (category) filter.category = new RegExp(`^${String(category)}$`, 'i');
    if (q) filter.$or = [{ name: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }];
    const total = await Product.countDocuments(filter);
    const docs = await Product.find(filter).skip((p - 1) * l).limit(l).exec();
    res.json({ total, page: p, limit: l, data: docs.map(toPlain) });
    return;
  }

  let results = products.slice();
  if (category) results = results.filter(x => x.category.toLowerCase() === String(category).toLowerCase());
  if (q) {
    const term = String(q).toLowerCase();
    results = results.filter(x => x.name.toLowerCase().includes(term) || x.description.toLowerCase().includes(term));
  }
  const start = (p - 1) * l;
  const paged = results.slice(start, start + l);
  res.json({ total: results.length, page: p, limit: l, data: paged });
}));

// GET /api/products/search?q=name
router.get('/search', asyncHandler(async (req, res) => {
  const q = (req.query.q || '').toString();
  if (!q) return res.json([]);
  if (usingDb()) {
    const docs = await Product.find({ $or: [{ name: new RegExp(q, 'i') }, { description: new RegExp(q, 'i') }] }).exec();
    return res.json(docs.map(toPlain));
  }
  const term = q.toLowerCase();
  const found = products.filter(p => p.name.toLowerCase().includes(term) || p.description.toLowerCase().includes(term));
  res.json(found);
}));

// GET /api/products/stats - product statistics (count by category)
router.get('/stats', asyncHandler(async (req, res) => {
  if (usingDb()) {
    const agg = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
    const counts = agg.reduce((acc, item) => { acc[item._id] = item.count; return acc; }, {});
    const total = await Product.countDocuments({});
    return res.json({ total, counts });
  }
  const counts = products.reduce((acc, p) => { acc[p.category] = (acc[p.category] || 0) + 1; return acc; }, {});
  res.json({ total: products.length, counts });
}));

// GET /api/products/:id
router.get('/:id', asyncHandler(async (req, res, next) => {
  if (usingDb()) {
    const doc = await Product.findById(req.params.id).exec();
    if (!doc) return next(new ApiError(404, 'Product not found'));
    return res.json(toPlain(doc));
  }
  const product = products.find(p => p.id === req.params.id);
  if (!product) return next(new ApiError(404, 'Product not found'));
  res.json(product);
}));

// POST /api/products - create product (auth + validation)
router.post('/', auth, validateProduct, asyncHandler(async (req, res) => {
  const { name, description, price, category, inStock } = req.body;
  if (usingDb()) {
    const created = await Product.create({ name, description, price, category, inStock });
    return res.status(201).json(toPlain(created));
  }
  const newProduct = { id: uuidv4(), name, description, price, category, inStock };
  products.push(newProduct);
  res.status(201).json(newProduct);
}));

// PUT /api/products/:id - update product (auth + validation)
router.put('/:id', auth, validateProduct, asyncHandler(async (req, res, next) => {
  const { name, description, price, category, inStock } = req.body;
  if (usingDb()) {
    const updated = await Product.findByIdAndUpdate(req.params.id, { name, description, price, category, inStock }, { new: true }).exec();
    if (!updated) return next(new ApiError(404, 'Product not found'));
    return res.json(toPlain(updated));
  }
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return next(new ApiError(404, 'Product not found'));
  products[idx] = { id: products[idx].id, name, description, price, category, inStock };
  res.json(products[idx]);
}));

// DELETE /api/products/:id (auth)
router.delete('/:id', auth, asyncHandler(async (req, res, next) => {
  if (usingDb()) {
    const removed = await Product.findByIdAndDelete(req.params.id).exec();
    if (!removed) return next(new ApiError(404, 'Product not found'));
    return res.json({ deleted: toPlain(removed) });
  }
  const idx = products.findIndex(p => p.id === req.params.id);
  if (idx === -1) return next(new ApiError(404, 'Product not found'));
  const removed = products.splice(idx, 1)[0];
  res.json({ deleted: removed });
}));

module.exports = router;
