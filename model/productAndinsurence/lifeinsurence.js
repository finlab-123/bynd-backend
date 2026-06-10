import mongoose from 'mongoose';

const LifeInsurenceSchema = new mongoose.Schema({
    productCategory: {
        type: String,
        required: true,
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
    typeofinsurence: { type: String },
    policyterm: { type: String },
    desiredamount: { type: String },
    agree: { type: Boolean, required: true },
    status: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected', 'In Progress'],
        default: 'Pending',
    },assignmentStatus: {
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
LifeInsurenceSchema.index({ productCategory: 1, createdAt: -1 });
LifeInsurenceSchema.index({ email: 1 });

export default mongoose.model('lifeinsurence', LifeInsurenceSchema, 'lifeinsurences');