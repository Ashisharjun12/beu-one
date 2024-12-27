import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  sessionToken: { type: String, unique: true },
  expires: Date,
});

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

export default Session; 