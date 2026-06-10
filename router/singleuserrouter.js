import express from 'express';
import { getUserDetails } from '../controller/singleuserController.js';
export const singlerouter = express.Router();

// Route to get single user/lead details
singlerouter.get('/:id', getUserDetails);