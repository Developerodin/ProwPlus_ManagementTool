const mongoose = require('mongoose');

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/prowplus';
  mongoose.set('strictQuery', true);
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
    });
    console.log(`[db] connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('[db] connection error:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
