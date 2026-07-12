import { Request, Response } from "express";
import { RestaurantStatus } from "./restaurant.interface.js";
import Restaurant from "./restaurant.model.js";
import jwt from 'jsonwebtoken';
import User from "../user/user.model.js";
import { UserRole } from "../user/user.interface.js";
import Booking from "../booking/booking.model.js";
import { BookingStatus } from "../booking/booking.interface.js";

//get all restaurants with search and filers
// GET /api/restaurants
export const getRestaurants = async (req: Request, res: Response) => {
    try {
        const { search, priceRange, rating, location, sort } = req.query;

        //build query object

        const queryObj: any = { status: RestaurantStatus.approved };

        if (search) {
            queryObj.$or = [
                { name: { $regex: search, $options: 'i' } },
                { tags: { $regex: search, $options: 'i' } },
                { location: { $regex: search, $options: 'i' } },
            ]
        };

        if (priceRange) {
            const prices = Array.isArray(priceRange) ? priceRange : [priceRange];
            queryObj.priceRange = { $in: prices }
        }

        if (rating) {
            queryObj.rating = { $gte: parseFloat(rating as string) }
        }

        if (location) {
            queryObj.location = { $regex: location as string, $options: 'i' }
        }

        //sorting

        let sortOption: any = { createdAt: -1 };

        if (sort === 'rating') {
            sortOption = { rating: -1 }
        } else if (sort === 'price_low') {
            sortOption = { priceRange: 1 }
        } else if (sort === 'price_high') {
            sortOption = { priceRange: -1 }
        }

        const restaurant = await Restaurant.find(queryObj).sort(sortOption);

        res.status(200).json({
            success: true,
            message: "Restaurants retrieve successfully",
            data: restaurant
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to retrieve restaurants data."
        })
    }
}

//get all featured restaurants 
// GET /api/restaurants/featured
export const getFeaturedRestaurants = async (req: Request, res: Response) => {
    try {
        const featured = await Restaurant.find({
            status: RestaurantStatus.approved,
            $or: [{ featured: true }, { exclusive: true }]
        }).limit(6);

        res.status(200).json({
            success: true,
            message: "Featured data retrieved successfully.",
            data: featured
        })

    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success: false,
            message: "Failed to retrieve data"
        })
    }
}

//get singe restaurant by slug 
// GET /api/restaurants/:slug
export const getRestaurantBySlug = async (req: Request, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ slug: req.params.slug });

        if (!restaurant) {
            return res.status(400).json({
                success: false,
                message: "Restaurant not found"
            })
        }

        if (restaurant.status !== RestaurantStatus.approved) {
            let isAuthorized = false;
            if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
                try {
                    const token = req.headers.authorization.split(" ")[1];
                    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN as string) as { id: string };

                    const user = await User.findById(decoded.id);


                    if (user && (user.role === UserRole.admin || (user.role === UserRole.owner && restaurant.owner.toString() === user._id.toString()))) {
                        isAuthorized = true;
                    }
                } catch (error) {
                    res.status(400).json({
                        success: false,
                        message: "Ignore token verify error"
                    })

                }
            } if (!isAuthorized) {
                res.status(400).json({
                    success: false,
                    message: "Restaurants not found or pending approval"
                })
            }
        }

        res.status(200).json({
            success: true,
            message: "Restaurant retrieved successfully",
            data: restaurant
        })


    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Restaurants not found or pending approval"
        })
    }

}


//get dynamic seat availability for slots
// GET /api/restaurants/:slug
export const getRestaurantAvailability = async (req: Request, res: Response) => {
    try {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({
                success: false,
                message: "Date is required"
            })
        }

        const restaurant = await Restaurant.findById(req.params.id);

        if (!restaurant) {
            return res.status(400).json({
                success: false,
                message: "Restaurant not found"
            })
        }

        const bookingDate = new Date(date as string);

        const bookings = await Booking.find({
            restaurant: restaurant._id,
            date: bookingDate,
            status: BookingStatus.confirmed
        });

        //map slots with available capacity

        const availability = restaurant.availableSlots.map((slot) => {
            const bookedSeats = bookings.filter((b) => b.time === slot).reduce((sum, b) => (sum + b.guests), 0);

            const totalSeats = restaurant.totalSeats || 20;
            const availableSeats = Math.max(0, totalSeats - bookedSeats);
            return {
                time: slot,
                availableSeats,
                isAvailable: availableSeats > 0
            };
        })

        res.status(200).json({
            success: true,
            message: "get the available restaurants",
            data: availability
        })

    } catch (error) {
       return res.status(400).json({
            success: false,
            message: "Restaurants not found or pending approval"
        })
    }
}