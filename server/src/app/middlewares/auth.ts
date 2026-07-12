import { NextFunction, Request, Response } from "express";
import { IUser, UserRole } from "../modules/user/user.interface.js";
import jwt from 'jsonwebtoken';
import User from "../modules/user/user.model.js";


export interface AuthRequest extends Request {
    user?: IUser
};

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {

    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // verify token 
            const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN as string) as { id: string };

            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: "Unauthorized"
                })
            }

            req.user = user;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }
    }

    if (!token) {
        res.status(401).json({
            success: false,
            message: "Token not found - Unauthorized."
        })
    }
}

export const adminOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === UserRole.admin) {
        next()
    } else {
        res.status(403).json({
            success: false,
            message: "You are not permitted to access admin route."
        })
    }
}

export const ownerOnly = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === UserRole.owner || req.user && req.user.role === UserRole.admin) {
        next()
    } else {
        res.status(403).json({
            success: false,
            message: "You are not permitted to access owner route."
        })
    }
}