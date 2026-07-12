import { Document, Types } from "mongoose";

export enum PriceRangeType {
    BUDGET = "$",
    MODERATE = "$$",
    EXPENSIVE = "$$$",
    LUXURY = "$$$$",
}

export enum RestaurantStatus {
    pending = "pending",
    approved = 'approved',
    rejected = 'rejected'
}

export interface IRestaurant extends Document {
    name: string;
    slug: string;
    description: string;
    cuisine: string;
    priceRange: PriceRangeType;
    rating: number;
    reviewCount: number;
    location: string;
    address: string;
    image: string;
    chef: string;
    tags: string[];
    availableSlots: string[];
    featured: boolean;
    exclusive: boolean;
    owner: Types.ObjectId;
    status: RestaurantStatus;
    totalSeats: number;
}

