import mongoose from 'mongoose';

const SupplyChainSchema = new mongoose.Schema({
  productCategory: {
    type: String,
    required: true,
    default: 'supply-chain'
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
  propertytype: { type: String, trim: true },
  marketvalue: { type: String, required: true },
  agree: { type: Boolean, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'In Progress', 'Ringing', 'Call Back', 'Documents Verified'],
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
    }
  ],
  assignedTo: [{ type: String, default: "", trim: true }],
}, { timestamps: true });

SupplyChainSchema.index({ productCategory: 1, createdAt: -1 });
SupplyChainSchema.index({ email: 1 });

export default mongoose.model('supplychain', SupplyChainSchema, 'supplychains');