import mongoose from "mongoose";

const midsemPaperSchema = new mongoose.Schema({
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
  college: {
    type: String,
    required: [true, "College name is required"],
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

const MidsemPaper = mongoose.models.MidsemPaper || mongoose.model("MidsemPaper", midsemPaperSchema);

export default MidsemPaper; 