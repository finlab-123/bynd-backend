import mongoose from 'mongoose';

const homeloanSchema = new mongoose.Schema({
  productCategory: {
    type: String,
    required: true,
    default: 'home-loan', // 🟢 CHANGED: Set default to lowercase hyphenated format to match employee specialization exactly
    lowercase: true,       // 🟢 ADDED: Forces string values to lowercase automatically
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

  // 🟢 CHANGED: Aligning keys to capture frontend payload fields gracefully
  requiredAmount: { type: Number, default: 0 },         // Maps directly to frontend payload
  requiredLoanAmount: { type: Number, default: 0 },     // Kept for backward compatibility fallback
  income: { type: Number, default: 0 },                 // Annual Income
  propertyDescription: { type: String, trim: true },    // Maps directly to frontend payload
  propertytype: { type: String, trim: true },           // Kept for backward compatibility fallback
  marketValue: { type: String, trim: true },            // 🟢 CHANGED: Fixed casing to camelCase to match payload key 'marketValue'
  marketvalue: { type: String, trim: true },            // Kept for backward compatibility fallback

  agree: { type: Boolean, required: true },

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
  assignedTo: { type: String, default: "", trim: true },

}, { timestamps: true });

// Indexes for better performance
homeloanSchema.index({ productCategory: 1, createdAt: -1 });
homeloanSchema.index({ email: 1 });
homeloanSchema.index({ assignedTo: 1 }); // 🟢 ADDED: Speeds up your employee dashboard lookups significantly

export default mongoose.model('homeloan', homeloanSchema, 'homeloans');