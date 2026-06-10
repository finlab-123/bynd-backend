import express from 'express';
import {
  getAllTeamAssignments,
  getTeamAssignmentById,
  addnewemployee,
  updateTeamAssignment,
  deleteTeamAssignment,
  assignTeam,
  unassignTeam,
  getAssignedTeams,
} from '../controller/teamAssignController.js';

export const teamAssignRouter = express.Router();

// Team Member Management
teamAssignRouter.get('/', getAllTeamAssignments);
teamAssignRouter.post('/', addnewemployee);

// Lead assignment routes
teamAssignRouter.get('/assigned/:projectId', getAssignedTeams);
teamAssignRouter.post('/assign', assignTeam);
teamAssignRouter.post('/unassign', unassignTeam);

teamAssignRouter.get('/:id', getTeamAssignmentById);
teamAssignRouter.put('/:id', updateTeamAssignment);
teamAssignRouter.delete('/:id', deleteTeamAssignment);