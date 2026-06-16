import mongoose from 'mongoose';

const teamAssignSchema = new mongoose.Schema({
    fullname: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    phone: { type: String, required: true, trim: true },
    specialization: [{
        type: String,
        enum: [
            'home-loan', 'vehicle-loan', 'medical-loan', 'loan-against-property',
            'loan-against-share', 'education-loan', 'supply-chain', 'credit-card',
            'equity', 'mutual-fund', 'general-insurance', 'life-insurance'
        ]
    }],
    leadCount: { type: Number, default: 0 },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
}, { timestamps: true });
teamAssignSchema.index({ status: 1 }); 

export default mongoose.model('teamAssign', teamAssignSchema);