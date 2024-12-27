import mongoose from "mongoose";

// Check if model exists before creating a new one
const Semester = mongoose.models.Semester || mongoose.model("Semester", new mongoose.Schema({
  value: {
    type: Number,
    required: [true, "Semester value is required"],
    min: 1,
    max: 8,
    unique: true,
  },
  label: {
    type: String,
    required: [true, "Semester label is required"],
    unique: true,
  }
}, {
  timestamps: true
}));

export default Semester; 