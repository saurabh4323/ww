import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
  },
  ServiceId: {
    type: String,
  },
  rank: {
    type: String,
  },
  gender: {
    type: String,
  },

  number: {
    type: Number,
  },
  Password: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
