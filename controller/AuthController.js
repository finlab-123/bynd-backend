import { Userschema } from '../model/Authmodel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export const registerlead = async (req, res) => {
    try {
        const { fullname, email, phone, password, role, specialization } = req.body;
        if (!fullname || !email || !phone || !password || !role) {
            return res.status(400).json({ success: false, message: 'All fields are required' });
        }
        if (role === 'employee') {
            if (!specialization || (Array.isArray(specialization) ? specialization.length === 0 : !specialization.trim())) {
                return res.status(400).json({ success: false, message: 'Specialization is required for employee role' });
            }
        }
        const existingUser = await Userschema.findOne({ email, phone });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }
        const userData = { fullname, email, phone, password: bcrypt.hashSync(password, 10), role };
        if (role === 'employee') {
            userData.specialization = specialization;
        }
        const newUser = new Userschema(userData);
        await newUser.save();
        res.status(201).json({ success: true, message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const loginlead = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required' });
        }

        const user = await Userschema.findOne({ email });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password' });
        }

        const comparePassword = bcrypt.compareSync(password, user.password);
        if (!comparePassword) {
            return res.status(401).json({ success: false, message: 'Invalid password' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET || "fallback_secret_key",
            { expiresIn: '1d' }
        );

        const isProduction = process.env.NODE_ENV === "production";

        const cookieOptions = {
            httpOnly: true,
            secure: isProduction ? true : false, 
            sameSite: isProduction ? "none" : "lax", 
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        };
        res.cookie('token', token, cookieOptions);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: { id: user._id, fullname: user.fullname, email: user.email, role: user.role ,Specialization: user.specialization,assignedTo: user.assignedTo }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const getuser = async (req, res) => {
    try {
        console.log("Authenticated user:", req.user);
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        res.status(200).json({ success: true, data: req.user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

export const logoutlead = (req, res) => {
    const isProduction = process.env.NODE_ENV === "production";
    
    res.clearCookie('token', {
        httpOnly: true,
        secure: isProduction ? true : false,
        sameSite: isProduction ? "none" : "lax"
    });
    res.status(200).json({ success: true, message: 'Logout successful' });
};