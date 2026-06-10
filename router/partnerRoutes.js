import express from 'express';
import { sendOtp, verifyOtp, submitPartnerRequest, getAllPartner } from '../controller/partnerController.js';

export const partnerRouter = express.Router();

partnerRouter.post('/otp/send', sendOtp);
partnerRouter.post('/otp/verify', verifyOtp);
partnerRouter.get('/partners', getAllPartner);
partnerRouter.post('/partner-with-us', submitPartnerRequest);
