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
      serverSelectionTimeoutMS: 3000, // Reduce to 3s
      socketTimeoutMS: 8000, // Reduce to 8s for Hobby plan
      maxPoolSize: 5, // Reduce pool size for Hobby plan
    });

    isConnected = true;
    console.log("MongoDB connected");
    
    // Register all models after connection
    registerModels();
  } catch (error) {
    console.log(error);
  }
}; 