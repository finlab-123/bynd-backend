import express from "express";
import { 
  dashboardController, 
  statsController, 
  seedController,
  getLeadsByStatus,
  getLeadsByCategory,
  getLeadsByDateRange
} from "../controller/dashboardController.js";

import {
  assignTeam,
  unassignTeam,
  getAssignedTeams
} from "../controller/teamAssignController.js";

import { getUserDetails } from "../controller/singleuserController.js";

export const dashboardrouter = express.Router();

dashboardrouter.get('/allleads', dashboardController);
dashboardrouter.get('/stats', statsController);
dashboardrouter.post('/seed', seedController);

dashboardrouter.get('/filter/status/:status', getLeadsByStatus);
dashboardrouter.get('/filter/category/:category', getLeadsByCategory);
dashboardrouter.get('/filter/date-range', getLeadsByDateRange);

// === USER DETAILS ROUTE ===
dashboardrouter.get('/user/:id', getUserDetails);

// === ASSIGNMENT ROUTES ===
dashboardrouter.post('/assign', assignTeam);
dashboardrouter.post('/unassign', unassignTeam);
dashboardrouter.get('/assigned/:leadId', getAssignedTeams); 
