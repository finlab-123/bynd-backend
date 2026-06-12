import express from 'express';
import { authenticate, RoleOnly } from '../middleware/Authmiddleware.js';
import {
  getEmployeeDashboard,
  getEmployeeLeads,
  updateLeadStatus,
} from '../controller/employeeController.js';
export const employeeRouter = express.Router();

employeeRouter.use(authenticate, RoleOnly('employee'));

employeeRouter.get('/dashboard', getEmployeeDashboard);
employeeRouter.get('/leads', getEmployeeLeads);
employeeRouter.patch('/leads/:id/status', updateLeadStatus);
