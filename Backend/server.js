const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const port = 3000;

// MongoDB connection details
const uri = "mongodb+srv://krishna98:Krishna%404321@crypto.fhudz.mongodb.net/cRYPTO";
const dbName = "cRYPTO";

// Middleware
app.use(cors());
app.use(express.json());

let db, USERS;

async function initializeDatabase() {
    try {
        const client = await MongoClient.connect(uri, { useUnifiedTopology: true });
        console.log("Connected to MongoDB");

        db = client.db(dbName);
        USERS = db.collection("USERS");

        app.listen(port, () => {
            console.log(`Server running at http://localhost:${port}`);
        });
    } catch (err) {
        console.error("Error connecting to MongoDB:", err);
        process.exit(1);
    }
}

initializeDatabase();

// Signup route
app.post('/username', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (await USERS.findOne({ $or: [{ email }, { username }] })) {
            return res.status(409).json({ error: 'Email or username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await USERS.insertOne({
            username,
            email,
            password: hashedPassword,
            isVerified: false,
            followedCoins: []
        });

        res.status(201).json({
            user: {
                id: result.insertedId.toString(),
                username,
                email,
                isVerified: false,
                followedCoins: []
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

// Login route
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await USERS.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        res.status(200).json({
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email,
                isVerified: user.isVerified,
                followedCoins: user.followedCoins
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

// PATCH request to follow a crypto coin
app.patch('/follow-coin', async (req, res) => {
    try {
        const { userId, coinName } = req.body;
        if (!userId || !coinName) {
            return res.status(400).json({ error: 'User ID and coin name are required' });
        }

        const result = await USERS.updateOne(
            { _id: new ObjectId(userId) },
            { $addToSet: { followedCoins: coinName } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'User not found or coin already followed' });
        }

        res.status(200).json({ message: 'Coin added successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error updating followed coins' });
    }
});

// PATCH request to unfollow a crypto coin
app.patch('/unfollow-coin', async (req, res) => {
    try {
        const { userId, coinName } = req.body;
        if (!userId || !coinName) {
            return res.status(400).json({ error: 'User ID and coin name are required' });
        }

        const result = await USERS.updateOne(
            { _id: new ObjectId(userId) },
            { $pull: { followedCoins: coinName } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: 'User not found or coin not followed' });
        }

        res.status(200).json({ message: 'Coin removed successfully' });
    } catch (err) {
        res.status(500).json({ error: 'Error removing followed coin' });
    }
});

// GET request to check if a user follows a crypto coin
app.get('/check-follow-status', async (req, res) => {
    try {
        const { userId, coinName } = req.query;

        if (!userId || !coinName) {
            return res.status(400).json({ error: 'User ID and coin name are required' });
        }

        // Find the user by ID
        const user = await USERS.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if the user follows the coin
        const followsCoin = user.followedCoins.includes(coinName);

        res.status(200).json({ followsCoin });
    } catch (err) {
        res.status(500).json({ error: 'Error checking follow status' });
    }
});

// GET request to fetch followed communities for a user
app.get('/followed-communities', async (req, res) => {
    try {
        const { userId } = req.query;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Find the user by ID
        const user = await USERS.findOne({ _id: new ObjectId(userId) });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ followedCoins: user.followedCoins });
    } catch (err) {
        res.status(500).json({ error: 'Error fetching followed communities' });
    }
});

