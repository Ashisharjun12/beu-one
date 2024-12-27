import mongoose from "mongoose";

const universityPaperSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Paper title is required"],
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, "Subject is required"],
  },
  year: {
    type: Number,
    required: [true, "Year is required"],
  },
  description: {
    type: String,
    default: ""
  },
  fileId: {
    type: String,
    required: [true, "File ID is required"],
  },
  fileUrl: {
    type: String,
    default: null,
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Uploader information is required"],
  },
}, {
  timestamps: true
});

const UniversityPaper = mongoose.models.UniversityPaper || mongoose.model("UniversityPaper", universityPaperSchema);

export default UniversityPaper; 