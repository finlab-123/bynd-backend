import {
  allLeadModels, getModelsForEmployee,
  getAssignedToValuesForEmployee,
  resolveAssignedEmployee
} from '../services/assignmentService.js';
export const getEmployeeDashboard = async (req, res) => {
  try {
    const assignedToValues = await getAssignedToValuesForEmployee(req.user);

    // CHANGE THIS LINE: Use the filter function instead of hardcoding allLeadModels
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
    console.log("👤 Logged-in User Session (req.user):", JSON.stringify(req.user, null, 2));

    let { status, search, page = 1, limit = 10 } = req.query;
    const skip = Math.max(0, Number(page) - 1) * Number(limit);

    console.log("🔍 Fetching assignment mapping IDs for this employee...");
    const assignedToValues = await getAssignedToValuesForEmployee(req.user);
    console.log("🆔 Combined Assignment lookup keys found for query:", assignedToValues);

    console.log("📂 Determining target database models for employee specialization...");
    const targetModels = getModelsForEmployee(req.user);
    console.log("📚 collections array to be queried:", targetModels.map(m => m.modelName));

    if (!assignedToValues.length) {
      console.log("⚠️ No assignment IDs found linked to this profile. Returning early with 0 results.");
      console.log("=============================================\n");
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

    console.log("⚙️ Final MongoDB filter object generated:", JSON.stringify(query, null, 2));

    const modelsResults = await Promise.all(
      targetModels.map(async (model) => {
        try {
          const leads = await model.find(query).sort({ createdAt: -1 }).lean();
          console.log(`📊 Collection [${model.modelName}] returned ${leads.length} matching leads.`);
          return leads;
        } catch (err) {
          console.error(`❌ Error querying model ${model.modelName}:`, err.message);
          return [];
        }
      })
    );

    const allLeads = modelsResults.flat().filter(Boolean)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    console.log("📈 Total aggregated leads found across all targets:", allLeads.length);
    console.log("=============================================\n");

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