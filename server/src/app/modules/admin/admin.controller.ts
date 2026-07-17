import { Request, Response } from "express";
import Restaurant from "../restaurant/restaurant.model.js";
import { RestaurantStatus } from "../restaurant/restaurant.interface.js";
import User from "../user/user.model.js";
import { UserRole } from "../user/user.interface.js";
import Booking from "../booking/booking.model.js";

//get all restaurants fro admin management
// GET /api/admin/restaurants

export const getAllRestaurants = async (req: Request, res: Response): Promise<void> => {
    try {
        const restaurants = await Restaurant
            .find({})
            .populate("owner", "name email phone")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Restaurants retrieved successfully",
            data: restaurants
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Failed to retrieved the restaurants"
        })
    }

}

//approve or reject restaurant for admin management
// PUT /api/admin/restaurants/:id/approve

export const approvedRestaurants = async (req: Request, res: Response): Promise<void> => {
    try {

        const { status } = req.body;
        if (!status || !Object.values(RestaurantStatus).includes(status)) {
            res.status(400).json({
                success: false,
                message: "Invalid status value"
            })
            return;
        }

        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            res.status(404).json({
                success: false,
                message: "Restaurant not found"
            })
            return;
        }

        restaurant.status = status;
        await restaurant.save();

        res.status(200).json({
            success: true,
            message: `Restaurant ${status} successfully`,
            data: restaurant
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong."
        })
    }

}


//get system statistics for admin management
// GET /api/admin/stats

export const getAdminStats = async (req: Request, res: Response): Promise<void> => {
    try {

        const totalUsers = await User.countDocuments();
        const totalOwners = await User.countDocuments({ role: UserRole.owner });
        const totalBookings = await Booking.countDocuments();
        const totalRestaurants = await Restaurant.countDocuments();


        //get latest 10 bookings 
        const latestBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .populate("user", "name email")
            .populate("restaurant", "name")
            .limit(10);


        res.status(200).json({
            success: true,
            message: "Admin statistics retrieved successfully",
            users: {
                users: totalUsers,
                owners: totalOwners,
                total: totalUsers + totalOwners,
            },
            restaurants: {
                total: totalRestaurants,
            },
            bookings: {
                total: totalBookings,
                latest: latestBookings
            }
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: "Something went wrong."
        })
    }

}
