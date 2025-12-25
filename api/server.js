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

// Simplified CORS - since frontend is served from same origin in production
// Only needed for development when frontend runs on different port
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? true  // In production, same origin - allow all
        : 'http://localhost:5173', // In development, allow Vite dev server
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

// API routes
app.use("/api/auth",authRoutes)
app.use("/api/user",userRoutes)
app.use("/api/expense",expenseRoutes)
app.use("/api/debt",debtRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// Serve static files from frontend build in production
if (process.env.NODE_ENV === 'production') {
    const frontendDistPath = path.join(__dirname, '../frontend/dist');
    
    // Serve static files
    app.use(express.static(frontendDistPath));
    
    // Handle React Router - send all non-API requests to index.html
    app.get('*', (req, res) => {
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
} else {
    // Development mode - show API info
    app.get('/', (req, res) => {
        res.json({ 
            name: 'Finance Tracker API',
            version: '1.0.0',
            status: 'running',
            message: 'Welcome to Finance Tracker API (Development Mode)',
            endpoints: {
                health: '/api/health',
                auth: '/api/auth',
                user: '/api/user',
                expenses: '/api/expense',
                debts: '/api/debt'
            },
            note: 'In production, this serves the React frontend'
        });
    });
}


app.listen(PORT,() => {
    connectDB();
});
