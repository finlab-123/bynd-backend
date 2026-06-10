import mongoose from "mongoose";
import { syncUsersToTeamAssign } from '../services/assignmentService.js';

export const connectDB = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(async () => { // 👈 Added async
      console.log("connected to database");
      
      // Allow a tiny delay or await explicitly to guarantee operational stability
      await syncUsersToTeamAssign(); 
    })
    .catch((err) => {
      console.log("Database Connection failed", err);
    });
};