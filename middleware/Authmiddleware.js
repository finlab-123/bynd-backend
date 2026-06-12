import jwt from 'jsonwebtoken';
import { Userschema } from '../model/Authmodel.js';

export const authenticate = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Authentication required. Missing token cookie.' 
            });
        }
        
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret_key");
        const user = await Userschema.findById(decodedToken.id).select('-password');
        
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'User session invalid or user not found' 
            });
        }
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Session expired or invalid token.' 
        });
    }
};

export const RoleOnly = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false, 
                message: "Authentication required" 
            });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Requires one of the following roles: ${allowedRoles.join(", ")}`
            });
        }

        next();
    };
};