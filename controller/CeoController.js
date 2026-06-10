import { CeoAction } from '../model/Ceomodel.js';
import { Userschema } from '../model/Authmodel.js';

// 1. Fetch live metrics from data tables for the CEO workspace
export const getCeoDashboardStats = async (req, res) => {
    try {
        const [totalUsers, totalCrms, activeTasks] = await Promise.all([
            Userschema.countDocuments({ role: 'user' }),
            Userschema.countDocuments({ role: 'crm' }),
            CeoAction.countDocuments({ status: 'in-progress' })
        ]);

        res.status(200).json({
            success: true,
            metrics: {
                totalClients: totalUsers,
                activeStaffCRM: totalCrms,
                pendingDirectives: activeTasks,
                platformStatus: "Healthy",
                lastUpdated: new Date()
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. CEO Action: Create and assign a task/directive to a CRM manager
export const createCeoDirective = async (req, res) => {
    try {
        const { actionType, title, description, assignedTo, priority } = req.body;

        if (!actionType || !title || !description) {
            return res.status(400).json({ success: false, message: "Missing required directive fields." });
        }

        if (assignedTo) {
            const targetStaff = await Userschema.findById(assignedTo);
            if (!targetStaff || targetStaff.role !== 'crm') {
                return res.status(404).json({ success: false, message: "Target CRM staff member not found." });
            }
        }

        const newDirective = new CeoAction({
            actionType,
            title,
            description,
            assignedTo,
            priority,
            createdBy: req.user._id // Provided via your authmiddleware configuration
        });

        await newDirective.save();
        res.status(201).json({ success: true, message: "Directive issued successfully", data: newDirective });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. Fetch past directives history
export const getCeoDirectives = async (req, res) => {
    try {
        const directives = await CeoAction.find()
            .populate('assignedTo', 'fullname email role')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: directives });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};