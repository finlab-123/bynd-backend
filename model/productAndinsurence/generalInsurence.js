import mongoose from 'mongoose';

const GeneralInsurenceSchema = new mongoose.Schema({
    productCategory: {
        type: String,
        required: true,
        default: 'general-insurance'
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
    amount: { type: Number, required: true },
    city: { type: String, trim: true },
    state: { type: String, required: true },
    typeofinsurence: { type: String },
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
    assignedTo: { type: String, default:"", trim: true },
}, { timestamps: true });

GeneralInsurenceSchema.index({ productCategory: 1, createdAt: -1 });
GeneralInsurenceSchema.index({ email: 1 });

// Points directly to the collection name currently active in your database
export default mongoose.model('generalinsurance', GeneralInsurenceSchema, 'generalinsurences');