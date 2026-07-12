import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './app/config/db.js';

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

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
