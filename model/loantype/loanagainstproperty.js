import mongoose from 'mongoose';

const loanAgainstPropertySchema = new mongoose.Schema({
  productCategory: {
    type: String,
    required: true,
    default: 'loan-against-property', // 🟢 Normalizes category fields cleanly
    lowercase: true,
    trim: true
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

  // Payload structure mappings
  loanAmount: { type: Number, default: 0 },
  annualIncome: { type: Number, default: 0 },
  marketvalue: { type: String, trim: true },
  propertyDescription: { type: String, trim: true },
  loanType: { type: String, trim: true },
  agree: { type: Boolean, required: true },

  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'In Progress'],
    default: 'Pending',
  },
  
  // 🟢 CRITICAL MISSING FIELDS BELOW: Adds fields to store assignments permanently
  assignmentStatus: {
    type: String,
    enum: ['Assigned', 'Unassigned'],
    default: 'Unassigned',
  },
  assignedTo: [{ 
    type: String, 
    default: "", 
    trim: true 
  }],
  remarks: [
    {
      author: { type: String, trim: true },
      text: { type: String, trim: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

// Performance indexing arrays
loanAgainstPropertySchema.index({ productCategory: 1, createdAt: -1 });
loanAgainstPropertySchema.index({ email: 1 });
loanAgainstPropertySchema.index({ assignedTo: 1 }); // 🟢 Speeds up dashboard queries

export default mongoose.model('loanagainstproperty', loanAgainstPropertySchema, 'loanagainstproperties');