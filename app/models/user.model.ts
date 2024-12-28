import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  image: String,
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User; 