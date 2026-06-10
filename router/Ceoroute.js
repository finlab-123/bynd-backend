import express from 'express';
import { authenticate, RoleOnly } from '../middleware/Authmiddleware.js';
import { 
    getCeoDashboardStats, 
    createCeoDirective, 
    getCeoDirectives 
} from '../controller/Ceocontroller.js';

export const ceorouter = express.Router();

// Route security layer
ceorouter.use(authenticate);
ceorouter.use(RoleOnly("ceo"));

// Core Operations
ceorouter.get('/stats', getCeoDashboardStats);
ceorouter.post('/directive', createCeoDirective);
ceorouter.get('/directives', getCeoDirectives);