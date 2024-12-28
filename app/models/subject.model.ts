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

export default subjectSchema;

// For backwards compatibility
export const Subject = mongoose.models.Subject || mongoose.model("Subject", subjectSchema);


