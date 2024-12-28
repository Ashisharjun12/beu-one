import mongoose from "mongoose";

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Branch name is required"],
    unique: true,
    trim: true,
  },
  code: {
    type: String,
    required: [true, "Branch code is required"],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, "Branch description is required"],
  },
}, {
  timestamps: true
});

export default branchSchema;

// For backwards compatibility
export const Branch = mongoose.models.Branch || mongoose.model("Branch", branchSchema); 