import mongoose from 'mongoose';

const VehicalSchema = new mongoose.Schema({
  productCategory: {
    type: String,
    required: true,
    default: 'vehicle-loan'
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
  loantype: { type: String, required: true },
  agree: { type: Boolean, required: true },
  amountrange: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'In Progress'],
    default: 'Pending',
  },
  assignmentStatus: {
    type: String,
    enum: ['Assigned', 'Unassigned'],
    default: 'Unassigned',
  },
  remarks: [
    {
      author: { type: String, trim: true },
      text: { type: String, trim: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  assignedTo: [{ type: String, default: "", trim: true }],
}, { timestamps: true });

VehicalSchema.index({ productCategory: 1, createdAt: -1 });
VehicalSchema.index({ email: 1 });

// Clean mapping to match your exact tracking list variables
export default mongoose.model('vehicle', VehicalSchema, 'vehicles');