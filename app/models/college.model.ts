import mongoose from "mongoose";

const collegeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "College name is required"],
    trim: true,
    unique: true,
  },
  place: {
    type: String,
    required: [true, "College place is required"],
    trim: true,
  }
}, {
  timestamps: true
});

// Clear existing model to prevent OverwriteModelError
mongoose.models = {};

const College = mongoose.model("College", collegeSchema);
export default College; 