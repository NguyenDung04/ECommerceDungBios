// Using ES6 imports
import mongoose from 'mongoose';

// Connect to MongoDB   
async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/project_one');
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
  }
}

// Export the connectDB function
export default connectDB;
