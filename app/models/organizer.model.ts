import mongoose from "mongoose";

const organizerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: [true, "Branch is required"],
  },
  yearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Year",
    required: [true, "Year is required"],
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

const Organizer = mongoose.model("Organizer", organizerSchema);
export default Organizer; 