// src/scripts/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/product');

const products = [
    {
        name: 'Laptop',
        description: 'High-performance laptop with 16GB RAM',
        price: 1200,
        category: 'electronics',
        inStock: true
    },
    {
        name: 'Smartphone',
        description: 'Latest model with 128GB storage',
        price: 800,
        category: 'electronics',
        inStock: true
    },
    {
        name: 'Coffee Maker',
        description: 'Programmable coffee maker with timer',
        price: 50,
        category: 'kitchen',
        inStock: false
    },
    {
        name: 'Book - MongoDB Guide',
        description: 'Complete guide to MongoDB development',
        price: 35,
        category: 'books',
        inStock: true
    },
    {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with long battery life',
        price: 25,
        category: 'electronics',
        inStock: true
    }
];

async function seedDatabase() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing products
        await Product.deleteMany({});
        console.log('Cleared existing products');

        // Insert new products
        const inserted = await Product.insertMany(products);
        console.log(`Seeded ${inserted.length} products`);

        console.log('Sample product ids:');
        inserted.forEach(p => console.log(`${p.name}: ${p._id}`));

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

seedDatabase();