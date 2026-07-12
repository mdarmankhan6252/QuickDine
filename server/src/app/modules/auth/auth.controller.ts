import { Request, Response } from "express";
import jwt from 'jsonwebtoken';
import User from "../user/user.model.js";
import bcrypt from "bcryptjs";
import { AuthRequest } from "../../middlewares/auth.js";

const generateToken = (id: string) => {
    return jwt.sign(id, process.env.JWT_ACCESS_TOKEN as string, { expiresIn: '30d' })
}


//Register a new user
//POST /api/auth/register
export const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, phone, role } = req.body;

        if (!name || !email || !password || !phone || !role) {
            return res.status(400).json({
                success: false,
                message: "Please enter all required fields"
            })
        }

        const userExist = await User.findOne({ email });

        if (userExist) {
            return res.status(400).json({
                success: false,
                message: "User already exist."
            })
        }

        //hash password
        const hashedPassword = await bcrypt.hash(password, 10);


        //create user 
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            phone,
            role
        });

        if (user) {
            res.status(201).json({
                success: true,
                message: "Register successful!",
                data: user,
                token: generateToken(user._id.toString())
            })
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid user data"
            })
        }

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to register."
        })
    }
}

//login user
//POST /api/auth/login
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide email and password"
            })
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            })
        }

        //check password

        const isMatched = await bcrypt.compare(password, user.password || '');

        if (!isMatched) {
            return res.status(401).json({
                success: false,
                message: "Invalid password"
            })
        }


        if (user) {
            res.status(200).json({
                success: true,
                message: "Login successful!",
                data: user,
                token: generateToken(user._id.toString())
            })
        } else {
            res.status(400).json({
                success: false,
                message: "Invalid user data"
            })
        }
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to login."
        })
    }

}


//get user profile
//POST /api/auth/me
//@access Private
export const getMe = async (req: AuthRequest, res: Response) => {
    try {

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized."
            })
        }
        res.status(200).json({
            success: true,
            message: "Profile retrieved successfully",
            data: req.user
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to retrieved user profile."
        })
    }

}