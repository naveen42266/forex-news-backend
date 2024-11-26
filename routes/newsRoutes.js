const express = require("express");
const multer = require("multer");
const { getDatabase } = require("../db");
const { COLLECTION_NAME } = require("../config");
const { authenticateToken, extractUserFromToken } = require("../middlewares/authMiddleware")
const router = express.Router();
// const upload = multer();
// Configure multer with memory storage
const storage = multer.memoryStorage(); // Store files in memory as buffer
const upload = multer({ storage }); // Use this configuration in your route


// Middleware to get userId from request (assuming it's in req.user from authentication middleware)
const getUserId = (req) => req.userId; // or modify as per your auth setup


// Get News
router.get("/getAll", async (req, res) => {
  try {
    const database = getDatabase();
    const collection = database.collection(COLLECTION_NAME);

    // Fetch all documents in the collection
    const result = await collection.find({}).toArray();

    res.status(200).json(result); // Send the result as JSON response
  } catch (error) {
    console.error("Error fetching news:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// File Upload API for Forex News
router.post(
  "/updateForexNewsImage",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = getUserId(req);

      if (!userId) {
        return res.status(403).json({ error: "User not authenticated" });
      }

      const database = getDatabase();
      const usersCollection = database.collection("accounts");

      // Verify the user is an admin
      const user = await usersCollection.findOne({ userId: userId });

      if (!user || user.type !== "Admin") {
        return res.status(403).json({ error: "User must be an admin to update the image" });
      }

      const { id, image } = req.body; // Extract `id` and `image` from the request body
  

      if (!id) {
        return res.status(400).json({ error: "News ID is required" });
      }

      if (!image) {
        return res.status(400).json({ error: "Image file is required" });
      }

      // Verify that the image is a valid Base64 string
      if (!image.startsWith("data:image/")) {
        return res.status(400).json({ error: "Invalid image format" });
      }

      const newsCollection = database.collection(COLLECTION_NAME);

      // Find the news item by `source.id` matching the provided `id`
      const newsItem = await newsCollection.findOne({ "source.id": id });

      if (!newsItem) {
        return res.status(404).json({ error: "News item not found" });
      }

      // Update the `urlToImage` field
      const updatedNews = await newsCollection.updateOne(
        { "source.id": id },
        {
          $set: {
            urlToImage: image, // Use the image as provided (assumed Base64 string)
            updatedBy: userId,
            updatedAt: new Date(),
          },
        }
      );

      if (updatedNews.matchedCount === 0) {
        return res.status(400).json({ error: "Failed to update news image" });
      }

      res.status(200).json({ message: "Image updated successfully" });
    } catch (error) {
      console.error("Error updating Forex news image:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);



module.exports = router;
