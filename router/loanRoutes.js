// router/loanRoutes.js
import express from 'express';
import axios from 'axios';
import {
  homeLoanControllers,
  vehicleLoanControllers,
  loanAgainstShareControllers,
  supplyChainControllers,
  educationLoanControllers,
  medicalLoanControllers,
  loanAgainstPropertyControllers
} from '../controller/loanControllers.js';
import { validateLead } from '../middleware/validateLead.js';
import { authenticate } from '../middleware/Authmiddleware.js';

export const loanRouter = express.Router();
loanRouter.get('/home-loan', homeLoanControllers.getAll);
loanRouter.get('/home-loan/:id', homeLoanControllers.getById);
loanRouter.post('/home-loan', homeLoanControllers.create);
loanRouter.put('/home-loan/:id', homeLoanControllers.update);
loanRouter.delete('/home-loan/:id', homeLoanControllers.delete);

// Vehicle Loan
loanRouter.get('/vehicle-loan', vehicleLoanControllers.getAll);
loanRouter.get('/vehicle-loan/:id', vehicleLoanControllers.getById);
loanRouter.post('/vehicle-loan', vehicleLoanControllers.create);
loanRouter.put('/vehicle-loan/:id', vehicleLoanControllers.update);
loanRouter.delete('/vehicle-loan/:id', vehicleLoanControllers.delete);

// Loan Against Share
loanRouter.get('/loan-against-share', loanAgainstShareControllers.getAll);
loanRouter.get('/loan-against-share/:id', loanAgainstShareControllers.getById);
loanRouter.post('/loan-against-share', loanAgainstShareControllers.create);
loanRouter.put('/loan-against-share/:id', loanAgainstShareControllers.update);
loanRouter.delete('/loan-against-share/:id', loanAgainstShareControllers.delete);

// Supply Chain
loanRouter.get('/supply-chain', supplyChainControllers.getAll);
loanRouter.get('/supply-chain/:id', supplyChainControllers.getById);
loanRouter.post('/supply-chain', supplyChainControllers.create);
loanRouter.put('/supply-chain/:id', supplyChainControllers.update);
loanRouter.delete('/supply-chain/:id', supplyChainControllers.delete);

// Education Loan
loanRouter.get('/education-loan', educationLoanControllers.getAll);
loanRouter.get('/education-loan/:id', educationLoanControllers.getById);
loanRouter.post('/education-loan', educationLoanControllers.create);
loanRouter.put('/education-loan/:id', educationLoanControllers.update);
loanRouter.delete('/education-loan/:id', educationLoanControllers.delete);

// Medical Loan
loanRouter.get('/medical-loan', medicalLoanControllers.getAll);
loanRouter.get('/medical-loan/:id', medicalLoanControllers.getById);
loanRouter.post('/medical-loan', medicalLoanControllers.create);
loanRouter.put('/medical-loan/:id', medicalLoanControllers.update);
loanRouter.delete('/medical-loan/:id', medicalLoanControllers.delete);

// Loan Against Property
loanRouter.get('/loan-against-property', loanAgainstPropertyControllers.getAll);
loanRouter.get('/loan-against-property/:id', loanAgainstPropertyControllers.getById);
loanRouter.post('/loan-against-property', loanAgainstPropertyControllers.create);
loanRouter.put('/loan-against-property/:id', loanAgainstPropertyControllers.update);
loanRouter.delete('/loan-against-property/:id', loanAgainstPropertyControllers.delete);

loanRouter.post('/submit-lead', authenticate, validateLead, async (req, res) => {
    try {
        const { name, dob, email, loanAmount, employeeType, mobile, pancard } = req.body;

        console.log(`-> Authorized request by User: ${req.user.fullname}. Form data validated.`);
        const ramfincorpUrl = 'https://preprod.ramfincorp.co.in/loanapply/ramfincorp_api/lead_gen/api/v1/create_lead';
        const payload = {
            Name: name,         
            Dob: dob,           
            Email: email,       
            LoanAmount: loanAmount,   
            EmployeeType: employeeType,
            Mobile: mobile,
            Pancard: pancard
        };

        // Forward request securely using .env parameters
        const response = await axios.post(ramfincorpUrl, payload, {
            headers: {
                'api-key': process.env.RAMFINCORP_API_KEY, 
                'api-user': process.env.RAMFINCORP_API_USER,    
                'Content-Type': 'application/json'
            }
        });

        return res.status(200).json({
            success: true,
            message: "Application processed perfectly and forwarded to Ramfincorp.",
            partnerResponse: response.data
        });

    } catch (error) {
        console.error("Error inside proxy integration route:", error.message);

        if (error.response) {
            return res.status(error.response.status).json({
                success: false,
                message: error.response.data.message,
                details: error.response.data
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error occurred handling the third-party proxy request."
        });
    }
});
