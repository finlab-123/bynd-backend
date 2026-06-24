import dotenv from "dotenv";
dotenv.config();

import { connectDB } from "./config/db.js";
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";

import { dashboardrouter } from "./router/dashboard.js";
import { bookConsultantRouter } from "./router/bookConsultantRoutes.js";
import { getInTouchRouter } from "./router/getInTouchRoutes.js";
import { teamAssignRouter } from "./router/teamAssignRoutes.js";
import { loanRouter } from "./router/loanRoutes.js";
import { productRouter } from "./router/productRoutes.js";
import { partnerRouter } from "./router/partnerRoutes.js";
import { singlerouter } from "./router/singleuserrouter.js";
import { authrouter } from "./router/Authuser.js";
import { ceorouter } from './router/Ceoroute.js';
import { employeeRouter } from './router/employeeRoutes.js';
const app = express();

const allowedOrigins = [
  "https://bynd-main.vercel.app",
  "https://bynd-form.vercel.app",
  "https://frontend-dashboard-one-ashen.vercel.app",
  "https://employee-dashboard-seven-omega.vercel.app",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5176",
  "http://localhost:5175",
  "http://localhost:5177",
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Blocked by CORS policy policy configuration"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"]
}));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/api/dashboard', dashboardrouter);

app.use('/api/book-consultant', bookConsultantRouter);
app.use('/api/get-in-touch', getInTouchRouter);
app.use('/api/team-assign', teamAssignRouter);
app.use('/api/employee', employeeRouter);
app.use('/api/partner', partnerRouter);
app.use('/api/loans', loanRouter);
app.use('/api/products', productRouter);
app.use('/api/user', singlerouter);
app.use('/api/auth', authrouter);
app.use('/api/ceo', ceorouter);
connectDB();
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server successfully connected to port ${PORT}`);
});


process.on("unhandledRejection", (err) => {
  console.log(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.log(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
