import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.js";
import Restaurant from "../restaurant/restaurant.model.js";
import { RestaurantStatus } from "../restaurant/restaurant.interface.js";
import { v2 as cloudinary } from 'cloudinary';
import Booking from "../booking/booking.model.js";
import { BookingStatus } from "../booking/booking.interface.js";

//upload the image to cloudinary
const uploadToCloudinary = (fileBuffer: Buffer): Promise<{ secure_url: string }> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: "QuickDine" },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }
                if (!result) {
                    reject(new Error("Upload failed"));
                    return;
                }
                if (result) {
                    resolve({ secure_url: result.secure_url });
                }
            }
        );
        stream.end(fileBuffer);
    });
};

//get owners restaurant
// GET /api/owner/restaurant
export const getOwnerRestaurant = async (req: AuthRequest, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.user?._id });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurants are not found."
            })
        }

        res.status(200).json({
            success: true,
            message: "Restaurants retrieved successfully",
            data: restaurant
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to retrieved the restaurant owners"
        })
    }
}

//create owner restaurant
// POST /api/owner/restaurant
export const createOwnerRestaurant = async (req: AuthRequest, res: Response) => {
    try {
        const existing = await Restaurant.findOne({ owner: req.user?._id });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "You already have a restaurant registered."
            })
        }

        const { name, description, cuisine, priceRange, location, address, chef, tags, availableSlots, totalSeats } = req.body;

        if (!name || !description || !cuisine || !priceRange || !location || !address || !chef || !tags || !availableSlots || !totalSeats) {
            return res.status(400).json({
                success: false,
                message: "All fields are required."
            })
        }

        //generate slug from name
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

        const slugExists = await Restaurant.findOne({ slug });

        if (slugExists) {
            return res.status(400).json({
                success: false,
                message: "Restaurant with this name already exists."
            })
        }

        // ... image handling logic

        let imageUrl = "";
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            imageUrl = result.secure_url;
        }


        //setup parsed tags and slots

        const parsedTags = typeof tags === 'string' ? tags.split(",").map((t: string) => t.trim()) : tags || [];

        const parsedSlots = typeof availableSlots === 'string' ? availableSlots.split(",").map((s: string) => s.trim()) : availableSlots || ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

        const restaurant = await Restaurant.create({
            name,
            slug,
            description,
            cuisine,
            priceRange,
            location,
            address,
            chef,
            tags: parsedTags,
            availableSlots: parsedSlots,
            totalSeats: Number(totalSeats) || 20,
            image: imageUrl,
            owner: req.user?._id,
            status: RestaurantStatus.pending
        })

        res.status(201).json({
            success: true,
            message: "Restaurant created successfully",
            data: restaurant
        });


    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to retrieved the restaurant owners"
        })
    }
}

//update owner restaurant
// PUT /api/owner/restaurant
export const updateOwnerRestaurant = async (req: AuthRequest, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.user?._id })

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant is not found."
            })
        }


        const { name, description, cuisine, priceRange, location, address, chef, tags, availableSlots, totalSeats } = req.body;

        if (name) restaurant.name = name;
        if (description) restaurant.description = description;
        if (cuisine) restaurant.cuisine = cuisine;
        if (priceRange) restaurant.priceRange = priceRange;
        if (location) restaurant.location = location;
        if (address) restaurant.address = address;
        if (chef) restaurant.chef = chef;
        if (tags) restaurant.tags = typeof tags === 'string' ? tags.split(",").map((t: string) => t.trim()) : tags || [];
        if (availableSlots) restaurant.availableSlots = typeof availableSlots === 'string' ? availableSlots.split(",").map((s: string) => s.trim()) : availableSlots || ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];
        if (totalSeats) restaurant.totalSeats = Number(totalSeats) || 20;

        //handle image update
        if (req.file) {
            const result = await uploadToCloudinary(req.file.buffer);
            restaurant.image = result.secure_url;
        }

        const updated = await restaurant.save();

        res.status(200).json({
            success: true,
            message: "Restaurant updated successfully",
            data: updated
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to retrieved the restaurant owners"
        })
    }
}

//get owners bookings
// PUT /api/owner/bookings
export const getOwnerBookings = async (req: AuthRequest, res: Response) => {
    try {
        const restaurant = await Restaurant.findOne({ owner: req.user?._id });

        if (!restaurant) {
            return res.status(404).json({
                success: false,
                message: "Restaurant is not found."
            })
        }

        const bookings = await Booking
            .find({ restaurant: restaurant._id })
            .populate("user", "name email phone")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Bookings retrieved successfully",
            data: bookings
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to retrieved the restaurant owners"
        })
    }
}

//update status of booking
// PUT /api/owner/bookings/:id/status
export const updateBookingStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;

        if (!status || !Object.values(BookingStatus).includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Please provide a valid status."
            });
        }

        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found."
            });
        }

        //verify booking belongs to the owner's restaurant
        const restaurant = await Restaurant.findById(booking.restaurant);

        if (!restaurant || restaurant.owner.toString() !== req.user?._id.toString()) {
            return res.status(401).json({
                success: false,
                message: "Not authorized to manage this bookings"
            });
        }

        booking.status = status;
        await booking.save();

        res.status(200).json({
            success: false,
            message: "Booking status updated successfully!"
        });


    } catch (error) {
        return res.status(400).json({
            success: false,
            message: "Failed to retrieved the restaurant owners"
        })
    }
}