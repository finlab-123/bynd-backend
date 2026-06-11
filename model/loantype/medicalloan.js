import mongoose from 'mongoose';

const medicalSchema = new mongoose.Schema({
  productCategory: {
    type: String,
    required: true,
    default: 'Medical Loan'
  },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  dob: { type: String },
  gender: { type: String, required: true },
  pincode: { type: String, trim: true },
  pan: { type: String, trim: true, uppercase: true },
  aadhar: { type: String, trim: true },
  employeeType: { type: String, required: true },
  city: { type: String, trim: true },
  state: { type: String, required: true },
  requiredLoanAmount: { type: Number, default: 0 },
  reasonLoanAmount: { type: String, trim: true },
  agree: { type: Boolean, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'In Progress'],
    default: 'Pending',
  },
  assignedTo: [{ type: String, default: "", trim: true }], assignmentStatus: {
    type: String,
    enum: ['Assigned', 'Unassigned'],
    default: 'Unassigned',
  },
  remarks: [
    {
      author: { type: String, trim: true },
      text: { type: String, trim: true },
      createdAt: { type: Date, default: Date.now },
    }]

}, { timestamps: true });

medicalSchema.index({ productCategory: 1, createdAt: -1 });
medicalSchema.index({ email: 1 });

export default mongoose.model('medicalloan', medicalSchema, 'medicalloans');