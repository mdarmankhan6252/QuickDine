import { Types } from "mongoose";

export enum BookingStatus {
    completed = "completed",
    confirmed = 'confirmed',
    cancelled = 'cancelled'
}
export interface IBooking extends Document {
    user: Types.ObjectId;
    restaurant: Types.ObjectId;
    date: Date;
    time: string;
    guests: number;
    occasion: string;
    specialRequest: string;
    status: BookingStatus;
    bookingId: string;
    createdAt: Date;
    updatedAt: Date;
}