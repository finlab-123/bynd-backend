import mongoose from 'mongoose';

const MutualFundSchema = new mongoose.Schema({
    productCategory: {
        type: String,
        required: true,
        default: 'mutual-fund'
    },
    firstName: { type: String, required: true, trim: true }, // Fixed from name
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true }, // Fixed from mobile
    dob: { type: String },
    gender: { type: String, required: true },
    pincode: { type: String, trim: true },
    pan: { type: String, trim: true, uppercase: true },
    aadhar: { type: String, trim: true },
    employeeType: { type: String, required: true },
    city: { type: String, trim: true },
    state: { type: String, required: true },
    investIn: { type: String },
    tenure: { type: String },
    amountrange: { type: String },
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
    assignedTo: [{ type: String, default: "", trim: true }],
}, { timestamps: true });

MutualFundSchema.index({ productCategory: 1, createdAt: -1 });
MutualFundSchema.index({ email: 1 });

// Third argument forces mongoose to query your exact database name format safely
export default mongoose.model('mutualfund', MutualFundSchema, 'mutualfunds');