import mongoose from "mongoose";

const User = new mongoose.Schema({
    fullname: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["admin", "employee", "user", "ceo", "crm"],
        default: "user"
    },
    specialization: [{
        type: String,
        enum: [
            "home-loan", "vehicle-loan", "medical-loan", "loan-against-property",
            "loan-against-share", "education-loan", "supply-chain", "credit-card",
            "equity", "mutual-fund", "general-insurance", "life-insurance",
        ]
    }],
    createdAt: { type: Date, default: Date.now }
});

export const Userschema = mongoose.model("user", User);