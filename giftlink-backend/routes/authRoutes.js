// Step 1 - Task 2: Import necessary packages
const express = require("express");
const app = express();
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");
const connectToDatabase = require("../models/db");
const router = express.Router();
const dotenv = require("dotenv");
const pino = require("pino"); // Import Pino logger

// Step 1 - Task 3: Create a Pino logger instance
const logger = pino();

// Load environment variables
dotenv.config();

// Step 1 - Task 4: Create JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

// Step 2 will be implemented in the next lab step
router.post("/register", async (req, res) => {
  try {
    // Task 1: Connect to `giftsdb` in MongoDB
    const db = await connectToDatabase();

    // Task 2: Access MongoDB collection
    const collection = db.collection("users");

    // Task 3: Check for existing email
    const existingEmail = await collection.findOne({ email: req.body.email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Hash password
    const salt = await bcryptjs.genSalt(10);
    const hash = await bcryptjs.hash(req.body.password, salt);
    const email = req.body.email;

    // Task 4: Save user details in database
    const newUser = await collection.insertOne({
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: hash,
      createdAt: new Date(),
    });

    // Task 5: Create JWT authentication
    const payload = {
      user: {
        id: newUser.insertedId,
      },
    };

    const authtoken = jwt.sign(payload, JWT_SECRET);

    logger.info("User registered successfully");

    res.json({ authtoken, email });
  } catch (e) {
    logger.error(e);
    return res.status(500).send("Internal server error");
  }
});

router.post("/login", async (req, res) => {
  try {
    // Task 1: Connect to MongoDB
    const db = await connectToDatabase();

    // Task 2: Access users collection
    const collection = db.collection("users");

    // Task 3: Check for user credentials
    const theUser = await collection.findOne({ email: req.body.email });

    // Task 7: User not found
    if (!theUser) {
      logger.error("User not found");
      return res.status(404).json({ error: "User not found" });
    }

    // Task 4: Check password
    const passwordMatch = await bcryptjs.compare(
      req.body.password,
      theUser.password
    );

    if (!passwordMatch) {
      logger.error("Passwords do not match");
      return res.status(404).json({ error: "Wrong password" });
    }

    // Task 5: Fetch user details
    const firstName = theUser.firstName;
    const lastName = theUser.lastName;
    const userEmail = theUser.email;

    // Task 6: Create JWT authentication
    const payload = {
      user: {
        id: theUser._id.toString(),
      },
    };

    const authtoken = jwt.sign(payload, JWT_SECRET);

    // Send response
    res.json({ authtoken, firstName, lastName, userEmail });
  } catch (e) {
    logger.error(e);
    return res.status(500).send("Internal server error");
  }
});

router.put(
  "/update",
  [
    body("firstName").optional().isLength({ min: 1 }),
    body("lastName").optional().isLength({ min: 1 }),
  ],
  async (req, res) => {
    // Task 2: Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logger.error("Validation errors in update request", errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Task 3: Check if email exists in headers
      const email = req.headers.email;
      if (!email) {
        logger.error("Email not found in the request headers");
        return res
          .status(400)
          .json({ error: "Email not found in the request headers" });
      }

      // Task 4: Connect to MongoDB
      const db = await connectToDatabase();
      const collection = db.collection("users");

      // Task 5: Find user
      const existingUser = await collection.findOne({ email });
      if (!existingUser) {
        logger.error("User not found");
        return res.status(404).json({ error: "User not found" });
      }
      

      // Update fields
      const updateFields = {
        firstName: req.body.firstName || existingUser.firstName,
        lastName: req.body.lastName || existingUser.lastName,
        updatedAt: new Date(),
      };

      // Task 6: Update user in DB
       const updatedUser = await collection.findOneAndUpdate(
         { email },
         { $set: updateFields },
         { returnDocument: "after" }
       );
      if (!updatedUser.value) {
        return res.status(500).json({ error: "Failed to update profile" });
      }
      // Task 7: Create JWT
      const payload = {
        user: {
          id: updatedUser.value._id.toString(),
        },
      };

      const authtoken = jwt.sign(payload, JWT_SECRET);

      res.json({ authtoken });
    } catch (e) {
      logger.error(e);
      return res.status(500).send("Internal server error");
    }
  }
);

module.exports = router;
