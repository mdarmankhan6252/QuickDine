import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './app/config/db.js';
import authRouter from './app/modules/auth/auth.router.js';
import { Error } from 'mongoose';
import restaurantRouter from './app/modules/restaurant/restaurant.router.js';
import bookingRouter from './app/modules/booking/booking.router.js';
import ownerRouter from './app/modules/owner/owner.router.js';

dotenv.config();
const app = express();
const port = 5000;

//database connected
connectDB();

//middlewares
app.use(express.json());
app.use(cors())

// application routes
app.get('/', (req: Request, res: Response) => {
    res.status(200).send({
        success: true,
        message: "MY SERVER IS LIVE."
    });
});

app.use('/api/auth', authRouter);
app.use('/api/restaurants', restaurantRouter);
app.use('/api/bookings', bookingRouter)
app.use('/api/owner', ownerRouter)

// global error handler 
app.use((err: Error, req: Request, res: Response, next: NextFunction) =>{
    console.log("Unhandled Error", err);
    res.status(500).json({
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
    })
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
