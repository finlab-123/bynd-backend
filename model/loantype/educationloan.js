// model/loantype/educationloan.js
import mongoose from 'mongoose';

const educationSchema = new mongoose.Schema({
  productCategory: {
    type: String,
    required: true,
    default: 'education-loan', 
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
  loanAmount: { type: Number, default: 0 },
  requiredLoanAmount: { type: Number, default: 0 },
  annualIncome: { type: Number, default: 0 },
  loanType: { type: String, trim: true },

  reasonLoanAmount: { type: String, trim: true },
  agree: { type: Boolean, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'In Progress',, 'Ringing', 'Call Back', 'Documents Verified'],
    default: 'Pending',
  },
  loanPurpose: {
  type: String,
  enum: [
    "Medical Emergency",
    "Salary Delay",
    "Personal Emergency",
    "Education",
    "Rent / Bills",
    "Others"
  ],
  default: "Others"
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
salaryMode: {
  type: String,
  enum: [
    "Bank Transfer",
    "Cash",
    "Cheque",
    "UPI"
  ],
  default: "Bank Transfer"
},
  assignedTo: [{ type: String, default: "", trim: true }],
}, { timestamps: true });

educationSchema.index({ productCategory: 1, createdAt: -1 });
educationSchema.index({ email: 1 });
educationSchema.index({ assignedTo: 1 }); 

export default mongoose.model('educationloan', educationSchema, 'educationloans');