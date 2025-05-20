const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();
const TodoModel = require('./models/Todo');

const app = express();

// Security middleware
app.use(helmet()); // Adds various HTTP headers for security

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*', // Ideally, set this to your frontend URL in production
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));
app.use(express.json({ limit: '10kb' })); // Limit payload size

// Environment variables
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables');
    process.exit(1);
}

// MongoDB connection with retry logic
const connectWithRetry = async () => {
    try {
        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            // Add connection pool settings for production
            maxPoolSize: 10
        });
        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err);
        console.log('Retrying connection in 5 seconds...');
        setTimeout(connectWithRetry, 5000);
    }
};

connectWithRetry();

// Error handling middleware
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
};

// Input validation middleware
const validateTodoInput = (req, res, next) => {
    const { task } = req.body;
    if (!task || typeof task !== 'string' || task.trim().length === 0) {
        return res.status(400).json({ error: 'Task is required and must be a non-empty string' });
    }
    req.body.task = task.trim();
    next();
};

// Routes with proper error handling
app.post('/add', validateTodoInput, async (req, res, next) => {
    try {
        const result = await TodoModel.create({ task: req.body.task });
        res.status(201).json(result);
    } catch (err) {
        next(err);
    }
});

app.get('/get', async (req, res, next) => {
    try {
        const result = await TodoModel.find();
        res.json(result);
    } catch (err) {
        next(err);
    }
});

app.put('/edit/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await TodoModel.findByIdAndUpdate(
            id,
            { done: true },
            { new: true }
        );
        if (!result) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json(result);
    } catch (err) {
        next(err);
    }
});

app.put('/update/:id', validateTodoInput, async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await TodoModel.findByIdAndUpdate(
            id,
            { task: req.body.task },
            { new: true }
        );
        if (!result) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json(result);
    } catch (err) {
        next(err);
    }
});

app.delete('/delete/:id', async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await TodoModel.findByIdAndDelete({ _id: id });
        if (!result) {
            return res.status(404).json({ error: 'Todo not found' });
        }
        res.json(result);
    } catch (err) {
        next(err);
    }
});

// Apply error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Received SIGTERM. Performing graceful shutdown...');
    server.close(() => {
        console.log('Server closed. Disconnecting from database...');
        mongoose.connection.close(false, () => {
            console.log('Database connection closed.');
            process.exit(0);
        });
    });
});

const server = app.listen(PORT, () => {
    console.log(`Server listening on port: ${PORT}`);
});

module.exports = app;
