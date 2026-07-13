import { Request, Response } from "express";
import { AuthRequest } from "../../middlewares/auth.js";
import Restaurant from "../restaurant/restaurant.model.js";
import { RestaurantStatus } from "../restaurant/restaurant.interface.js";
import Booking from "./booking.model.js";
import { BookingStatus } from "./booking.interface.js";

//create a new booking
//POST /api/bookings
//@access private

export const createBooking = async (req: AuthRequest, res: Response) => {
    try {
        const { restaurantId, date, time, guests, occasion, specialRequest } = req.body;

        if (!restaurantId || !date || !time || !guests) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required reservation details."
            })
        }

        const restaurant = await Restaurant.findById(restaurantId);

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant not found"
            })
        }

        //verify restaurant is approved.

        if (restaurant?.status !== RestaurantStatus.approved) {
            return res.status(404).json({
                success: false,
                message: "Reservations are not open for this restaurant yet."
            })
        }

        //verify seat availability
        const requestedGuests = Number(guests);

        const existingBookings = await Booking.find({
            restaurant: restaurantId,
            date: new Date(date),
            time,
            status: BookingStatus.confirmed
        });

        const bookedSeats = existingBookings.reduce((sum, b) => sum + b.guests, 0);

        const totalSeats = restaurant.totalSeats || 20;
        const availableSeats = totalSeats - bookedSeats;

        if (requestedGuests > availableSeats) {
            res.status(400).json({
                success: true,
                message: `Unable to reserve only ${availableSeats} seats are available for this time slot.`
            })
        }

        const booking = await Booking.create({
            user: req.user?._id,
            restaurant: restaurantId,
            date: new Date(date),
            time,
            guests: Number(guests),
            occasion,
            specialRequest,
            status: BookingStatus.confirmed
        });

        //populate restaurant info before returning

        const populatedBooking = await booking.populate("restaurant", "name location image address");

        res.status(201).json({
            success: true,
            message: "Booking Successful!",
            data: populatedBooking
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to create booking."
        })
    }
}

//get logged in user bookings
//GET /api/bookings/my
//@access private

export const getMyBookings = async (req: AuthRequest, res: Response) => {
    try {
        const bookings = await Booking
            .find({
                user: req.user?._id
            })
            .populate('restaurant', 'name location image address slug')
            .sort({ date: -1, time: -1 });

        res.status(200).json({
            success: true,
            message: "My booking data retrieved successfully.",
            data: bookings
        });


    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to retrieved my bookings."
        })
    }

}

//cancel a booking
//PUT /api/bookings/:id/cancel
//@access private

export const cancelBooking = async (req: AuthRequest, res: Response) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            })
        }

        //verify user owns this  bookings

        if (booking.user.toString() !== req.user?._id.toString()) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized."
            })
        }

        booking.status = BookingStatus.cancelled;
        await booking.save();

        const populatedBooking = await booking.populate('restaurant', 'name location image address');

        res.status(200).json({
            success: true,
            message: "Booking data retrieved successfully",
            data: populatedBooking
        })

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to cancel booking."
        })
    }

}
