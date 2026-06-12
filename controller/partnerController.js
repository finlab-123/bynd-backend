import { Partner } from "../model/partnerwithus.js";
export const sendOtp = async (req, res) => {
  
  const mockOtp = "123456"; 
  res.status(200).json({ otp: mockOtp });
};
export const verifyOtp = async (req, res) => {
  const { otp } = req.body;
  if (otp === "123456") {
    res.status(200).json({ verified: true });
  } else {
    res.status(400).json({ message: "Invalid OTP" });
  }
};
export const submitPartnerRequest = async (req, res) => {
  try {
    const { phone, ...updateData } = req.body;
    
    const partner = await Partner.findOneAndUpdate(
      { phone },
      { $set: updateData },
      { upsert: true, new: true }
    );
    res.status(200).json({ message: "Success", data: partner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const getAllPartner = async (req, res) => {
  try {
    const partners = await Partner.find({});  
    res.status(200).json({ data: partners });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
};