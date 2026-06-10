import TeamAssignModel from "../model/teamAssign.js";
import { findLeadById, resolveAssignedEmployee } from "../services/assignmentService.js";

export const getAllTeamAssignments = async (req, res) => {
  try {
    const employees = await TeamAssignModel.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      total: employees.length,
      data: employees,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getTeamAssignmentById = async (req, res) => {
  try {
    const employee = await TeamAssignModel.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const addnewemployee = async (req, res) => {
  try {
    console.log("\n=============================================");
    console.log("🆕 [ADD NEW EMPLOYEE] Request caught in controller!");
    console.log("📦 Incoming Payload Data:", JSON.stringify(req.body, null, 2));

    const { fullname, email, phone, status, specialization, userId } = req.body;

    // Check if specialization exists or is passed correctly
    if (!specialization) {
      console.log("⚠️ WARNING: No specialization field provided in request body.");
    }

    const existingEmployee = await TeamAssignModel.findOne({ email });
    if (existingEmployee) {
      console.log("❌ REJECTED: Email already exists in teamAssign collection:", email);
      return res.status(400).json({
        success: false,
        message: "Employee already exists",
      });
    }

    console.log("💾 Attempting to insert record into teamAssign collection...");
    const employee = await TeamAssignModel.create({
      fullname,
      email,
      phone,
      specialization: specialization || 'vehicle-loan', // Fallback default to prevent schema errors
      userId,
      status: status || "Active",
    });

    console.log("✅ SUCCESS: Employee successfully registered in teamAssign database!");
    console.log("🗃️ Saved Document Record:", JSON.stringify(employee, null, 2));
    console.log("=============================================\n");

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      data: employee,
    });
  } catch (error) {
    console.error("❌ CRITICAL ERROR IN addnewemployee ROUTE:", error.message);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateTeamAssignment = async (req, res) => {
  try {
    const employee = await TeamAssignModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee updated successfully",
      data: employee,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteTeamAssignment = async (req, res) => {
  try {
    const employee = await TeamAssignModel.findByIdAndDelete(
      req.params.id
    );

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Employee deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// LEAD ASSIGNMENT
// ==============================

export const assignTeam = async (req, res) => {
  try {
    const { teamId ,projectId} = req.body;

    if (!teamId || !projectId) {
      return res.status(400).json({
        success: false,
        message: "Lead ID and Agent ID are required",
      });
    }

    console.log("Assigning lead", { projectId, teamId });

    const lead = await findLeadById(projectId);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    lead.assignedTo = teamId;
    lead.assignmentStatus = "Assigned";

    await lead.save();

    return res.status(200).json({
      success: true,
      message: "Lead assigned successfully",
      data: lead,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const unassignTeam = async (req, res) => {
  try {
    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Lead ID is required",
      });
    }

    const lead = await findLeadById(projectId);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    lead.assignedTo = null;
    lead.assignmentStatus = "Unassigned";

    await lead.save();

    return res.status(200).json({
      success: true,
      message: "Lead unassigned successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAssignedTeams = async (req, res) => {
  try {
    const { projectId } = req.params;

    const lead = await findLeadById(projectId);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    const assignedToPayload = await resolveAssignedEmployee(lead.assignedTo);

    return res.status(200).json({
      success: true,
      data: {
        projectId: lead._id,
        assignedTo: assignedToPayload,
        assignmentStatus: lead.assignmentStatus || "Unassigned",
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};