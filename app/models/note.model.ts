import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
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
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: [true, "Subject is required"],
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: [true, "Branch is required"],
  },
  description: {
    type: String,
    trim: true,
    default: ""
  },
  fileId: {
    type: String,
    required: [true, "File ID is required"]
  },
  fileUrl: {
    type: String,
    default: null
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Uploader is required"]
  }
}, {
  timestamps: true
});

// Clear existing model to prevent OverwriteModelError
mongoose.models = {};

const Note = mongoose.model("Note", noteSchema);
export default Note; 