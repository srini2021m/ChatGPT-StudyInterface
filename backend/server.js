// backend/server.js

import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(bodyParser.json());

// Load users data from JSON file
const usersFilePath = './users.json';
let users = [];

try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    if (data.trim() !== '') {
        users = JSON.parse(data);
    }
} catch (err) {
    console.error('Error reading or parsing users file:', err);
    users = [];
}

// Middleware for password hashing
const saltRounds = 10;

// OpenAI API key from environment variable
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Endpoint to register a new user
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }

    // Check if username already exists
    const existingUser = users.find(user => user.username === username);
    if (existingUser) {
        return res.status(400).send('Username already exists.');
    }

    // Hash password
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            console.error('Error hashing password:', err);
            return res.status(500).send('Error registering user.');
        }

        // Generate unique ID for new user
        const id = uuidv4();

        // Save new user to database (JSON file in this example)
        const newUser = { id, username, password: hashedPassword };
        users.push(newUser);

        fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));

        // Respond with success message or user object if needed
        res.status(201).json(newUser);
    });
});

// Endpoint to authenticate user
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Find user by username
    const user = users.find(user => user.username === username);
    if (!user) {
        return res.status(404).send('User not found.');
    }

    // Compare password
    bcrypt.compare(password, user.password, (err, result) => {
        if (err || !result) {
            return res.status(401).send('Unauthorized.');
        }
        // Return user data or JWT token for session management (not implemented here)
        res.status(200).json({ message: 'Login successful.', user });
    });
});

// Endpoint for AI interaction (using OpenAI GPT-3 as an example)
app.post('/chat', async (req, res) => {
    const { message } = req.body;

    try {
        // Make request to OpenAI API
        const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
            prompt: message,
            max_tokens: 150,
            stop: ['\n']
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            }
        });

        // Return AI model response
        const reply = response.data.choices[0].text.trim();
        res.json({ reply });
    } catch (error) {
        console.error('Error calling OpenAI API:', error);
        res.status(500).json({ error: 'Error processing request.' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});