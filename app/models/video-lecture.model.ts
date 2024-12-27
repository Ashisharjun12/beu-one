import mongoose from "mongoose";

const videoLectureSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Title is required"],
  },
  subject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject',
    required: [true, "Subject is required"],
  },
  type: {
    type: String,
    enum: ['single', 'playlist'],
    required: [true, "Video type is required"],
  },
  videoUrl: {
    type: String,
    required: [true, "Video URL is required"],
  },
  description: {
    type: String,
    default: "",
  },
  uploader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, "Uploader information is required"],
  },
}, {
  timestamps: true
});

const VideoLecture = mongoose.models.VideoLecture || mongoose.model("VideoLecture", videoLectureSchema);

export default VideoLecture; 