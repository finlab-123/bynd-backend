import express from 'express';
import { registerlead, loginlead, getuser, logoutlead } from '../controller/AuthController.js';
import { authenticate, RoleOnly } from '../middleware/Authmiddleware.js'; 

export const authrouter = express.Router();

// Public Authentication Endpoints
authrouter.post('/register', registerlead);
authrouter.post('/login', loginlead);

// Basic Authenticated Token Validation Endpoints
authrouter.get('/me', authenticate, getuser);
authrouter.post('/logout', authenticate, logoutlead);

// Role Protected API Endpoints 
authrouter.get("/ceo-dashboard", authenticate, RoleOnly("ceo"), (req, res) => {
    res.status(200).json({ success: true, message: "Welcome CEO!" });
});

authrouter.get("/crm-data", authenticate, RoleOnly("ceo", "crm"), (req, res) => {
    res.status(200).json({ success: true, message: "Welcome CRM / CEO Portal!" });
});

authrouter.get("/admin-panel", authenticate, RoleOnly("admin"), (req, res) => {
    res.status(200).json({ success: true, message: "Welcome Admin Panel!" });
});