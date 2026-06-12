import TeamAssignModel from "../model/teamAssign.js";
import { 
  findLeadById, 
  resolveAssignedEmployee, 
  getModelsForEmployee, 
  getAssignedToValuesForEmployee 
} from "../services/assignmentService.js";

export const getEmployeeDashboard = async (req, res) => {
  try {
    const assignedToValues = await getAssignedToValuesForEmployee(req.user);
    const targetModels = getModelsForEmployee(req.user);

    const statusCounts = await Promise.all(
      targetModels.map(async (model) => {
        try {
          const [pending, inProgress, approved, rejected] = await Promise.all([
            model.countDocuments({ assignedTo: { $in: assignedToValues }, status: { $regex: /^pending$/i } }),
            model.countDocuments({ assignedTo: { $in: assignedToValues }, status: { $regex: /^in progress$/i } }),
            model.countDocuments({ assignedTo: { $in: assignedToValues }, status: { $regex: /^approved$/i } }),
            model.countDocuments({ assignedTo: { $in: assignedToValues }, status: { $regex: /^rejected$/i } }),
          ]);
          return [pending, inProgress, approved, rejected];
        } catch (e) {
          console.error(`Error counting stats on model: ${model.modelName}`, e);
          return [0, 0, 0, 0];
        }
      })
    );

    const totals = statusCounts.reduce(
      (acc, [pending, inProgress, approved, rejected]) => ({
        pending: acc.pending + (pending || 0),
        inProgress: acc.inProgress + (inProgress || 0),
        approved: acc.approved + (approved || 0),
        rejected: acc.rejected + (rejected || 0),
      }),
      { pending: 0, inProgress: 0, approved: 0, rejected: 0 }
    );

    return res.status(200).json({
      success: true,
      data: {
        total: totals.pending + totals.inProgress + totals.approved + totals.rejected,
        pending: totals.pending,
        inProgress: totals.inProgress,
        approved: totals.approved,
        rejected: totals.rejected,
      },
    });
  } catch (error) {
    console.error('Employee dashboard error:', error);
    return res.status(500).json({ success: false, message: 'Unable to fetch dashboard data' });
  }
};

export const getEmployeeLeads = async (req, res) => {
  try {
    console.log("\n=============================================");
    console.log("🔄 [DASHBOARD RELOAD] Employee reloading leads page...");

    let { status, page = 1, limit = 10 } = req.query;
    const skip = Math.max(0, Number(page) - 1) * Number(limit);

    const assignedToValues = await getAssignedToValuesForEmployee(req.user);
    const targetModels = getModelsForEmployee(req.user);

    if (!assignedToValues.length) {
      return res.status(200).json({ success: true, total: 0, data: [] });
    }

    const stringIds = assignedToValues.map(id => id.toString());
    const query = {
      $or: [
        { assignedTo: { $in: stringIds } },
        { assignedTo: { $in: assignedToValues } }
      ]
    };

    if (status) {
      let cleanStatus = status.trim();
      if (cleanStatus === 'inProgress' || cleanStatus === 'in-progress') {
        cleanStatus = 'in progress';
      }
      query.status = { $regex: new RegExp(`^${cleanStatus}$`, 'i') };
    }

    const modelsResults = await Promise.all(
      targetModels.map(async (model) => {
        try {
          return await model.find(query).sort({ createdAt: -1 }).lean();
        } catch (err) {
          console.error(`❌ Error querying model ${model.modelName}:`, err.message);
          return [];
        }
      })
    );

    const allLeads = modelsResults.flat().filter(Boolean)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const total = allLeads.length;
    const pageItems = allLeads.slice(skip, skip + Number(limit));

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      limit: Number(limit),
      data: pageItems,
    });
  } catch (error) {
    console.error("❌ CRITICAL EXCEPTION IN getEmployeeLeads:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const updateLeadStatus = async (req, res) => {
  try {
    const { id } = req.params;
    let { status, remark } = req.body; 

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    let cleanStatus = status.trim();
    if (/^in[- ]?progress$/i.test(cleanStatus)) {
      cleanStatus = 'In Progress';
    } else {
      cleanStatus = cleanStatus.replace(/\b\w/g, char => char.toUpperCase());
    }

    const assignedToValues = await getAssignedToValuesForEmployee(req.user);
    const targetModels = getModelsForEmployee(req.user);

    let lead = null;
    let targetModel = null;

    // Find the lead across the employee's assigned models
    for (const model of targetModels) {
      lead = await model.findOne({
        _id: id,
        assignedTo: { $in: assignedToValues }
      });
      if (lead) {
        targetModel = model;
        break;
      }
    }

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found or access denied' });
    }

    // 🟢 STEP 2: Clear validators dynamically in memory so you don't have to edit all schemas
    targetModel.schema.path('status').validators = []; 

    // Apply the standardized status string
    lead.status = cleanStatus;

    // 🟢 STEP 3: Handle the remarks array safely
    if (remark) {
      if (!Array.isArray(lead.remarks)) {
        lead.remarks = [];
      }
      lead.remarks.push({
        author: req.user.fullname || 'Employee',
        text: remark.trim(),
        createdAt: new Date()
      });
    }

    await lead.save();

    // 🟢 STEP 4: Instantly sync dashboard counter states
    if (typeof syncUsersToTeamAssign === 'function') {
      await syncUsersToTeamAssign();
    }

    return res.status(200).json({
      success: true,
      message: 'Lead status updated and dashboard counters synchronized successfully.',
      data: lead,
      modelName: targetModel.modelName,
    });
  } catch (error) {
    console.error('Error updating lead status:', error);
    return res.status(500).json({ success: false, message: 'Unable to update lead status' });
  }
};