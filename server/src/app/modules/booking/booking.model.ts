import { model, Schema, Types } from "mongoose";
import { BookingStatus, IBooking } from "./booking.interface.js";

const bookingSchema = new Schema<IBooking>({
    user: { type: Types.ObjectId, ref: "User", required: true },
    restaurant: { type: Types.ObjectId, ref: "Restaurant", required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    guests: { type: Number, required: true, min: 1 },
    occasion: { type: String, required: true },
    specialRequest: { type: String, trim: true },
    status: { type: String, enum: Object.values(BookingStatus), default: BookingStatus.confirmed },
    bookingId: { type: String, required: true, unique: true },
}, { timestamps: true });


//auto generate bookingId before saving the booking document
bookingSchema.pre('save', function(){
    if(!this.bookingId){
        this.bookingId = `BK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
})


const Booking = model<IBooking>('Booking', bookingSchema);
export default Booking;