const express = require("express");
const multer = require("multer");
const { getDatabase } = require("../db");
const { COLLECTION_USER } = require("../config");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();
const storage = multer.memoryStorage(); // Store files in memory as buffer
const upload = multer({ storage }); // Use this configuration in your route
// Middleware to get userId from request (assuming it's in req.user from authentication middleware)
const getUserId = (req) => req.userId; // or modify as per your auth setup

// File Upload API for Forex News
// router.post(
//     "/updateForexNewsImage",
//     authenticateToken,
//     async (req, res) => {
//         try {
//             const userId = getUserId(req);

//             if (!userId) {
//                 return res.status(403).json({ error: "User not authenticated" });
//             }

//             const database = getDatabase();
//             const usersCollection = database.collection("accounts");

//             // Verify the user is an admin
//             const user = await usersCollection.findOne({ userId: userId });

//             if (!user || user.type !== "Admin") {
//                 return res.status(403).json({ error: "User must be an admin to update the image" });
//             }

//             const { id, image } = req.body; // Extract `id` and `image` from the request body


//             if (!id) {
//                 return res.status(400).json({ error: "News ID is required" });
//             }

//             if (!image) {
//                 return res.status(400).json({ error: "Image file is required" });
//             }

//             // Verify that the image is a valid Base64 string
//             if (!image.startsWith("data:image/")) {
//                 return res.status(400).json({ error: "Invalid image format" });
//             }

//             const newsCollection = database.collection(COLLECTION_NAME);

//             // Find the news item by `source.id` matching the provided `id`
//             const newsItem = await newsCollection.findOne({ "source.id": id });

//             if (!newsItem) {
//                 return res.status(404).json({ error: "News item not found" });
//             }

//             // Update the `urlToImage` field
//             const updatedNews = await newsCollection.updateOne(
//                 { "source.id": id },
//                 {
//                     $set: {
//                         urlToImage: image, // Use the image as provided (assumed Base64 string)
//                         updatedBy: userId,
//                         updatedAt: new Date(),
//                     },
//                 }
//             );

//             if (updatedNews.matchedCount === 0) {
//                 return res.status(400).json({ error: "Failed to update news image" });
//             }

//             res.status(200).json({ message: "Image updated successfully" });
//         } catch (error) {
//             console.error("Error updating Forex news image:", error);
//             res.status(500).json({ error: "Internal Server Error" });
//         }
//     }
// );

router.get("/getAllUsers", authenticateToken, async (req, res) => {
    try {
        // Extract user information from the request
        const userId = getUserId(req); // Assuming `authenticateToken` attaches user info to `req`
        if (!userId) {
            return res.status(401).json({ error: "Unauthorized. User ID not found." });
        }

        const database = getDatabase();
        const usersCollection = database.collection("accounts");

        // Check if the user exists and is an admin
        const user = await usersCollection.findOne({ userId: userId });
        if (!user) {
            return res.status(404).json({ error: "User not found." });
        }
        if (user.type !== "Admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        const collection = database.collection(COLLECTION_USER);

        // Fetch all users
        const result = await collection.find({}, { projection: { password: 0 } }).toArray();
        if (!result || result.length === 0) {
            return res.status(404).json({ message: "No users found." });
        }

        res.status(200).json(result); // Send the result as JSON response
    } catch (error) {
        console.error("Error fetching users:", error.message);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;
