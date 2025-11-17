// src/config/mongo.js
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ev_rental';

async function connectMongo() {
  try {
    await mongoose.connect(MONGODB_URI, {
      // các option mới của mongoose 7 đã tối giản, có thể để trống
    });
    console.log('[Mongo] Connected:', MONGODB_URI);
  } catch (err) {
    console.error('[Mongo] Connection error:', err.message);
    process.exit(1);
  }
}

module.exports = { connectMongo };
