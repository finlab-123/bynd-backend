import express from 'express';
import { authenticate, RoleOnly } from '../middleware/Authmiddleware.js';
import {
  getEmployeeDashboard,
  getEmployeeLeads,
} from '../controller/employeeController.js';
export const employeeRouter = express.Router();

employeeRouter.use(authenticate, RoleOnly('employee'));

employeeRouter.get('/dashboard', getEmployeeDashboard);
employeeRouter.get('/leads', getEmployeeLeads);

console.log("✅ Employee Router Loaded");