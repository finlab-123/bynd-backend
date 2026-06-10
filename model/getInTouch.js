import mongoose from 'mongoose';

const GetInTouchSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  city: { type: String },
  message: { type: String },
}, { timestamps: true });

export default mongoose.model('GetInTouch', GetInTouchSchema);

