import mongoose from "mongoose";

const voiceSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, "Content is required"],
    trim: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "User is required"],
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  status: {
    type: String,
    enum: ['active', 'archived', 'reported'],
    default: 'active'
  }
}, {
  timestamps: true
});

const Voice = mongoose.models.Voice || mongoose.model("Voice", voiceSchema);
export default Voice; 