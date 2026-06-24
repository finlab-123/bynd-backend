import HomeLoanModel from '../model/loantype/homeloan.js';
import VehicleLoanModel from '../model/loantype/vehicleloan.js';
import LoanAgainstShareModel from '../model/loantype/loanagainstshare.js';
import SupplyChainModel from '../model/loantype/supplychain.js';
import educationSchema from '../model/loantype/educationloan.js';
import medicalSchema from '../model/loantype/medicalloan.js';
import LoanAgainstPropertySchema from '../model/loantype/loanagainstproperty.js';
import { assignLeadByCategory, syncUsersToTeamAssign } from '../services/assignmentService.js';
import {
  checkDedupe,
  createLead
} from "../services/ramfincorp.service.js";
const createCrudOperations = (Model, modelName) => ({
  getAll: async (req, res) => {
    try {
      const data = await Model.find().sort({ createdAt: -1 });
      return res.status(200).json({
        success: true,
        message: `All ${modelName} fetched successfully`,
        data
      });
    } catch (error) {
      console.error(`Error fetching ${modelName}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const item = await Model.findById(id);
      if (!item) {
        return res.status(404).json({
          success: false,
          message: `${modelName} not found`
        });
      }
      return res.status(200).json({
        success: true,
        message: `${modelName} fetched successfully`,
        data: item
      });
    } catch (error) {
      console.error(`Error fetching ${modelName}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  create: async (req, res) => {
    try {

      if (req.body.email) {
        const cleanEmail = req.body.email.toLowerCase().trim();

        const existingItem = await Model.findOne({
          email: cleanEmail
        }).select("_id email");

        if (existingItem) {
          return res.status(409).json({
            success: false,
            message: "Email already exists"
          });
        }
      }
      if (!req.body.pan || !req.body.phone) {
        return res.status(400).json({
          success: false,
          message: "PAN and Phone are required"
        });
      }

      const mobile = req.body.phone
        .replace(/\D/g, "")
        .slice(-10);

      const dedupeResponse = await checkDedupe(
        mobile,
        req.body.pan
      );

      console.log("Dedupe Response:", dedupeResponse);

      if (
        dedupeResponse?.message === "Dedup Fail"
      ) {
        return res.status(409).json({
          success: false,
          message: dedupeResponse.message && "Lead already exists"
        });
      }

      const ramfincorpPayload = {
        customer_email: req.body.email,
        mobile_number: mobile,
        pancard: req.body.pan,

        loan_purpose: req.body.loanPurpose || "Others",

        employee_type: req.body.employeeType,
        salary_mode: req.body.salaryMode || "Bank Transfer",
        monthly_income: Number(req.body.income || 1000),
        salary_date: 1,
        pincode: Number(req.body.pincode),
        user_ip:
          req.headers["x-forwarded-for"] ||
          req.socket.remoteAddress ||
          "127.0.0.1",
        utm_source: "BYND",
        consent: true,
        consent_date_time: new Date().toISOString()
      };

      console.log(
        "Ramfincorp Payload:",
        ramfincorpPayload
      );

      const leadResponse =
        await createLead(ramfincorpPayload);

      console.log(
        "Lead Create Response:",
        leadResponse
      );

      if (
        leadResponse?.message &&
        leadResponse.message
          .toLowerCase()
          .includes("fail")
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Ramfincorp lead creation failed"
        });
      }


      const newItem = new Model(req.body);

      if (newItem.productCategory) {
        await assignLeadByCategory(newItem);
      }

      if (typeof syncUsersToTeamAssign === "function") {
        await syncUsersToTeamAssign();
      }

      await newItem.save();

      return res.status(201).json({
        success: true,
        message: `${modelName} created successfully`,
        data: newItem
      });

    } catch (error) {

      console.error(
        `Error creating ${modelName}:`,
        error?.response?.data || error
      );

      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      return res.status(500).json({
        success: false,
        message:
          error?.response?.data?.message ||
          error.message ||
          "Internal server error"
      });
    }
  },

  update: async (req, res) => {
    try {
      const { id } = req.params;

      const currentDoc = await Model.findById(id);
      if (!currentDoc) {
        return res.status(404).json({
          success: false,
          message: `${modelName} record profile not found.`
        });
      }

      const updateData = { ...req.body };

      if (updateData.assignmentStatus === 'Assigned' && currentDoc.assignmentStatus === 'Unassigned') {
        const structuralBuffer = new Model({ ...currentDoc.toObject(), ...updateData });
        await assignLeadByCategory(structuralBuffer);
        updateData.assignedTo = structuralBuffer.assignedTo;
        updateData.assignmentStatus = structuralBuffer.assignmentStatus;
      }

      const updatedItem = await Model.findByIdAndUpdate(
        id,
        { $set: updateData },
        { returnDocument: 'after', runValidators: true }
      );

      if (typeof syncUsersToTeamAssign === 'function') {
        await syncUsersToTeamAssign();
      }

      return res.status(200).json({
        success: true,
        message: `${modelName} updated successfully`,
        data: updatedItem
      });
    } catch (error) {
      console.error(`Error updating ${modelName}:`, error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({ success: false, message: error.message });
      }
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  },

  delete: async (req, res) => {
    try {
      const { id } = req.params;
      const deletedItem = await Model.findByIdAndDelete(id);
      if (!deletedItem) {
        return res.status(404).json({
          success: false,
          message: `${modelName} not found`
        });
      }
      if (typeof syncUsersToTeamAssign === 'function') {
        await syncUsersToTeamAssign();
      }
      return res.status(200).json({
        success: true,
        message: `${modelName} deleted successfully`,
        data: deletedItem
      });
    } catch (error) {
      console.error(`Error deleting ${modelName}:`, error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
});

export const homeLoanControllers = createCrudOperations(HomeLoanModel, 'Home Loan');
export const vehicleLoanControllers = createCrudOperations(VehicleLoanModel, 'Vehicle Loan');
export const loanAgainstShareControllers = createCrudOperations(LoanAgainstShareModel, 'Loan Against Share');
export const loanAgainstPropertyControllers = createCrudOperations(LoanAgainstPropertySchema, 'Loan Against Property');
export const supplyChainControllers = createCrudOperations(SupplyChainModel, 'Supply Chain');
export const educationLoanControllers = createCrudOperations(educationSchema, 'Education Loan');
export const medicalLoanControllers = createCrudOperations(medicalSchema, 'Medical Loan');