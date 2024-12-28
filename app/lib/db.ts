import mongoose from "mongoose";
import { registerModels } from "./models";

let isConnected = false;

export const connectToDB = async () => {
  mongoose.set("strictQuery", true);

  if (isConnected) {
    console.log("MongoDB is already connected");
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI!, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s
      maxPoolSize: 10, // Maintain up to 10 socket connections
    });

    isConnected = true;
    console.log("MongoDB connected");
    
    // Register all models after connection
    registerModels();
  } catch (error) {
    console.log(error);
  }
}; 