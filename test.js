const { MongoClient } = require('mongodb');

// Replace this with your actual MongoDB URI
const uri = "mongodb+srv://noah:rnR9pqkb6DYioye5@cluster0.ifaz4ev.mongodb.net/?retryWrites=true&w=majority";

// Create a new MongoClient
const client = new MongoClient(uri);

async function run() {
    try {
        // Connect the client to the server
        await client.connect();
        console.log("Connected successfully to MongoDB");

        // You can perform any operations you need to test here
        // For example, listing databases:
        const databasesList = await client.db().admin().listDatabases();
        console.log("Databases:");
        databasesList.databases.forEach(db => console.log(` - ${db.name}`));

    } catch (err) {
        console.error("Failed to connect to MongoDB", err);
    } finally {
        // Close the connection to the MongoDB server
        await client.close();
    }
}

run();
