require('dotenv').config()
const express = require('express');
const app = express();
const port = 3000;
const fetchData = require('./fetchData.js')
const router = require('./router.js'); // Import the router
const client = require('./db.js');

client.connect()
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Failed to connect to MongoDB', err));
    
process.on('SIGINT', () => {
  client.close().then(() => {
    console.log('MongoDB Disconnected');
    process.exit(0);
  });
});

app.use(express.json());

// Use the router for all routes
app.use('/', router);

// Periodically fetch data
fetchData()
setInterval(fetchData, 10 * 1000);


// Example route for POST request
app.post('/data', (req, res) => {
    console.log(req.body); // Log data from the POST request
    res.send('Data received!');
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
