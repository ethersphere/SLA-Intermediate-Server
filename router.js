const express = require('express');
const router = express.Router();
const client = require('./db.js'); // Import the MongoDB client

// New route to get the most recent entry from every collection
router.get('/api/v1/all', async (req, res) => {
  try {
    const db = client.db('sla_metrics');

    // Get a list of all collection names in the database
    const collectionInfos = await db.listCollections().toArray();
    const collections = {};

    // Loop through collections and get the most recent entry from each
    for (const collectionInfo of collectionInfos) {
      const collectionName = collectionInfo.name;
      const collection = db.collection(collectionName);
      
      // Since there's only one document per metric collection, we can just find one
      const metricDocument = await collection.findOne({});

      if (metricDocument && metricDocument.values) {
        // Filter out future timestamp values
        const now = new Date();
        metricDocument.values = metricDocument.values.filter(value => {
          const valueDate = new Date(value[0]);
          return valueDate <= now;
        });

        collections[collectionName] = metricDocument;
      }
    }
    
    // Return the most recent entries from each collection
    res.json(collections);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).json({ message: 'Internal Server Error' });
  } 
});

module.exports = router;
