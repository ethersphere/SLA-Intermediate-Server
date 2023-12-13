const express = require('express');
const router = express.Router();
const client = require('./db.js'); // Import the MongoDB client


// New route to get the most recent entry from every collection
router.get('/api/v1/all', async (req, res) => {
  try {

    const db = client.db('sla_metrics');

    // Get a list of all collection names in the database
    const collectionNames = await db.listCollections().toArray();
    const recentEntries = {};

    // Loop through collections and get the most recent entry from each
    for (const { name } of collectionNames) {
      const collection = db.collection(name);
      const mostRecentEntry = await collection
        .find()
        .sort({ timestamp: -1 })
        .limit(1)
        .toArray();

      if (mostRecentEntry.length > 0) {
        recentEntries[name] = mostRecentEntry[0];
      }
    }

    // New code to get the most recent hundred entries for specified collections
    const collectionsToQuery = ['upload_success_24h', 'download_success_24h', 'chunk_retrieval_duration'];
    const recentHundredEntries = {};

    for (const collectionName of collectionsToQuery) {
      const collection = db.collection(collectionName);
      const entries = await collection
        .find()
        .sort({ timestamp: -1 })
        .limit(100)
        .toArray();

      recentHundredEntries[collectionName] = entries;
    }

    // Combine the results with the previously fetched recentEntries
    const combinedResults = {
      recentEntries,
      recentHundredEntries
    };



    res.json(combinedResults);
    } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  } 
});

module.exports = router;
