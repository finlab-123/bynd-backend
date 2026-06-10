import mongoose from 'mongoose';

const CEOActionSchema = new mongoose.Schema({
    actionType: {
        type: String,
        required: true,
        enum: ['ASSIGN_TASK', 'UPDATE_KPI', 'REALLOCATE_RESOURCE', 'SYSTEM_CONFIG']
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: false
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['pending', 'in-progress', 'completed'],
        default: 'pending'
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    }
}, { timestamps: true });

export const CeoAction = mongoose.model('CeoAction', CEOActionSchema);