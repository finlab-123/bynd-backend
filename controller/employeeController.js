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