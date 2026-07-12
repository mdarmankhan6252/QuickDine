import { model, Schema, Types } from "mongoose";
import { IRestaurant, PriceRangeType, RestaurantStatus } from "./restaurant.interface.js";

const restaurantSchema = new Schema<IRestaurant>({
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    cuisine: { type: String, required: true, trim: true },
    priceRange: { type: String, enum: Object.values(PriceRangeType), required: true },
    rating: { type: Number, default: 5.0, min: 1, max: 5 },
    reviewCount: { type: Number, default: 0 },
    location: { type: String, required: true, trim: true },
    address: { type: String, required: true },
    image: { type: String, default: '' },
    chef: { type: String, required: true },
    tags: [{ type: String }],
    availableSlots: [{ type: String }],
    featured: { type: Boolean, default: false },
    exclusive: { type: Boolean, default: false },
    owner: { type: Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: Object.values(RestaurantStatus), default: RestaurantStatus.pending }
}, { timestamps: true });


const Restaurant = model<IRestaurant>('Restaurant', restaurantSchema);
export default Restaurant;