import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
    trim: true,
    index: true
  },
  yearId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Year",
    required: [true, "Year is required"],
    index: true
  },
  semesterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester",
    required: [true, "Semester is required"],
    index: true
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Subject",
    required: [true, "Subject is required"],
    index: true
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Branch",
    required: [true, "Branch is required"],
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  fileId: {
    type: String,
    required: [true, "File ID is required"]
  },
  fileUrl: {
    type: String,
    required: [true, "File URL is required"]
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Uploader information is required"],
    index: true
  }
}, {
  timestamps: true
});

// Add compound indexes for common queries
noteSchema.index({ yearId: 1, semesterId: 1 });
noteSchema.index({ branch: 1, subject: 1 });
noteSchema.index({ createdAt: -1 });

const Note = mongoose.models.Note || mongoose.model("Note", noteSchema);

export { noteSchema };
export default Note; 