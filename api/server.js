import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import connectDB from './config/db.js';
// routes
import authRoutes from './routes/authRoutes.js';
import debtRoutes from './routes/debtRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import userRoutes from './routes/userRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from project root `.env`
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Set up CORS with specific options - MUST be before routes
// Allow local Vite dev server on any port (5173, 5174, ...)
const allowedOrigins = [process.env.FRONTEND_URL || 'http://localhost:5173'];
const isLocalhostOrigin = (origin) => {
    try {
        const url = new URL(origin);
        return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    } catch {
        return false;
    }
};

app.use(cors({
    origin: (origin, callback) => {
        // allow same-origin / server-to-server / curl
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        if (process.env.NODE_ENV !== 'production' && isLocalhostOrigin(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Set-Cookie'],
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth",authRoutes)
app.use("/api/user",userRoutes)
app.use("/api/expense",expenseRoutes)
app.use("/api/debt",debtRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});


app.listen(PORT,() => {
    connectDB();
});
