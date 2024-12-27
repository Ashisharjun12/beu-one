import mongoose from "mongoose";

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Subject name is required"],
    trim: true,
  },
  code: {
    type: String,
    required: [true, "Subject code is required"],
    unique: true,
    trim: true,
    uppercase: true,
  },
  branchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: [true, "Branch is required"],
  },
  yearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Year",
    required: [true, "Year is required"],
  },
  semesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: [true, "Semester is required"],
  },
  creditId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Credit",
    required: [true, "Credit is required"],
  },
  description: {
    type: String,
    trim: true,
  }
}, {
  timestamps: true
});

// Clear existing model to prevent OverwriteModelError
mongoose.models = {};

const Subject = mongoose.model("Subject", subjectSchema);
export default Subject;


