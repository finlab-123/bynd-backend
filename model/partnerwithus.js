import mongoose from 'mongoose';

const partnerSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  otp: String, 
  otpVerified: { type: Boolean, default: false },
  firstName: String,
  middleName: String,
  lastName: String,
  email: String,
  businessType: String,
  industryType: String,
  businessRevenue: String,
  yearsInBusiness: String,
  geoArea: String,
  dataflowMode: { type: Boolean, default: false },
  status: { type: String, default: 'In-Progress' }
}, { timestamps: true });

export const Partner = mongoose.model('Partner', partnerSchema);
