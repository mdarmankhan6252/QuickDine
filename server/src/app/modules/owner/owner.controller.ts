import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.js";


//get owners restaurant
// GET /api/owner/restaurant
export const getOwnerRestaurant = async(req: AuthRequest,res: Response) =>{
    try {
        
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to retrieved the restaurant owners"
        })
    }
}

//create owner restaurant
// POST /api/owner/restaurant
export const createOwnerRestaurant = async(req: AuthRequest,res: Response) =>{
    try {
        
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to retrieved the restaurant owners"
        })
    }
}

//update owner restaurant
// PUT /api/owner/restaurant
export const updateOwnerRestaurant = async(req: AuthRequest,res: Response) =>{
    try {
        
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to retrieved the restaurant owners"
        })
    }
}

//get owners bookings
// PUT /api/owner/bookings
export const getOwnerBookings = async(req: AuthRequest,res: Response) =>{
    try {
        
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to retrieved the restaurant owners"
        })
    }
}

//update status of booking
// PUT /api/owner/bookings/:id/status
export const updateBookingStatus = async(req: AuthRequest,res: Response) =>{
    try {
        
    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to retrieved the restaurant owners"
        })
    }
}