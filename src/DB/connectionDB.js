import mongoose from 'mongoose';
import { DB_URI } from '../../config/config.service.js';

const connectDB = async () => {
  try {
const conn = await mongoose.connect( DB_URI,{serverSelectionTimeoutMS:1000});
    console.log("MongoDB Connected");
  } catch (error) {
    console.error(`Error: ${error.message}`);
   
  }
};

export default connectDB;