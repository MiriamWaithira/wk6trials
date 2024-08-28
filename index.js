// Load environment variables
require('dotenv').config();
const jwtSecret = process.env.JWT_SECRET;

// Import required modules and libraries
const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { Sequelize } = require('sequelize');
const authenticateJWT = require('./middlewares/auth');
const config = require('./config/config.js'); // Importing the config.js
const { User } = require('./models'); // Import models after Sequelize initialization

// Initialize express application
const app = express();

// Set up middleware
app.use(cors({
    origin: 'http://localhost:4000',
    methods: 'GET,POST',
    allowedHeaders: 'Content-Type,Authorization'
}));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize Sequelize
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql'
});

// Test the database connection
async function connect() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.sync(); // Sync models with the database
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

connect();

// Define routes for the landing page
app.get('/', (req, res) => {
    res.render('home', { title: "Home" });
});

app.get('/signup', (req, res) => {
    res.render('signup', { title: "SignUp" });
});

app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ username, email, password: hashedPassword });
        res.redirect('/login');
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).send('Server Error');
    }
});

app.get('/login', (req, res) => {
    res.render('login', { title: "Login" });
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).send('Invalid credentials');
        }
        const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Server Error');
    }
});

app.use('/dashboard', authenticateJWT);

app.get('/dashboard', (req, res) => {
    res.render('dashboard', { title: "Dashboard" });
});

// Start the server
app.listen(4000, () => {
    console.log('Server is running on http://localhost:4000');
});
