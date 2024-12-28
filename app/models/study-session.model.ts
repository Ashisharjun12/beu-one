import mongoose from "mongoose";

const studySessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  papers: [{
    paperId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'paperType'
    },
    paperType: {
      type: String,
      enum: ['UniversityPaper', 'MidsemPaper']
    },
    title: String,
    fileUrl: String
  }],
  notes: [{
    noteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note"
    },
    title: String,
    fileUrl: String
  }],
  videos: [{
    videoId: String,
    title: String,
    thumbnail: String,
    channelTitle: String,
  }],
  status: {
    type: String,
    enum: ["active", "completed", "archived"],
    default: "active",
  }
}, {
  timestamps: true
});

const StudySession = mongoose.models.StudySession || mongoose.model("StudySession", studySessionSchema);
export default StudySession; 