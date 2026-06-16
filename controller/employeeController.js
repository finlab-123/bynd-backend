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

    let absoluteTotal = 0;
    const totalCounts = await Promise.all(
      targetModels.map(async (model) => {
        try {
          return await model.countDocuments({ assignedTo: { $in: assignedToValues } });
        } catch (e) {
          return 0;
        }
      })
    );
    absoluteTotal = totalCounts.reduce((acc, curr) => acc + curr, 0);

    const statusCounts = await Promise.all(
      targetModels.map(async (model) => {
        try {
          const [pending, inProgress, approved, rejected, ringing, callback, docVerified] = await Promise.all([
            model.countDocuments({ assignedTo: { $in: assignedToValues }, status: { $regex: /^pending$/i } }),
            model.countDocuments({ assignedTo: { $in: assignedToValues }, status: { $regex: /^in progress$/i } }),
            model.countDocuments({ assignedTo: { $in: assignedToValues }, status: { $regex: /^approved$/i } }),
            model.countDocuments({ assignedTo: { $in: assignedToValues }, status: { $regex: /^rejected$/i } }),
            model.countDocuments({ assignedTo: { $in: assignedToValues }, status: { $regex: /^ringing$/i } }),
            model.countDocuments({ assignedTo: { $in: assignedToValues }, status: { $regex: /^call back$/i } }),
            model.countDocuments({ assignedTo: { $in: assignedToValues }, status: { $regex: /^documents verified$/i } }),
          ]);
          return [pending, inProgress, approved, rejected, ringing, callback, docVerified];
        } catch (e) {
          console.error(`Error counting stats on model: ${model.modelName}`, e);
          return [0, 0, 0, 0, 0, 0, 0];
        }
      })
    );

    const totals = statusCounts.reduce(
      (acc, [pending, inProgress, approved, rejected, ringing, callback, docVerified]) => ({
        pending: acc.pending + (pending || 0),
        inProgress: acc.inProgress + (inProgress || 0),
        approved: acc.approved + (approved || 0),
        rejected: acc.rejected + (rejected || 0),
        ringing: acc.ringing + (ringing || 0),
        callback: acc.callback + (callback || 0),
        documentsVerified: acc.documentsVerified + (docVerified || 0),
      }),
      { pending: 0, inProgress: 0, approved: 0, rejected: 0, ringing: 0, callback: 0, documentsVerified: 0 }
    );

    return res.status(200).json({
      success: true,
      data: {
        total: absoluteTotal, 
        pending: totals.pending,
        inProgress: totals.inProgress,
        ringing: totals.ringing,
        callback: totals.callback,
        documentsVerified: totals.documentsVerified,
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

    const originalStatus = lead.status || 'Pending';

    targetModel.schema.path('status').validators = []; 
    lead.status = cleanStatus;

    if (!Array.isArray(lead.remarks)) {
      lead.remarks = [];
    }

    const updaterName = req.user.fullname || 'Employee';

    if (remark && remark.trim() !== "") {
      lead.remarks.push({
        author: updaterName,
        text: remark.trim(),
        createdAt: new Date()
      });
    } else if (originalStatus !== cleanStatus) {
      lead.remarks.push({
        author: updaterName,
        text: `"${originalStatus}" -> "${cleanStatus}"`,
        createdAt: new Date()
      });
    }

    await lead.save();

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