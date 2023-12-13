const axios = require('axios');
const client = require('./db.js'); 



// Function to fetch data from the Prometheus endpoint and save it to MongoDB

async function getChunkRetrievalDuration(db) {
  try {
    // Connect the client to the MongoDB server
    await client.connect();
    const db = client.db('sla_metrics');

    const response = await axios.get(`${process.env.PROMETHEUS}query?query=increase(beekeeper_net_avail_data_download_duration_sum%7Bsuccess%3D%22true%22%7D%5B24h%5D)%20%2F%20increase(beekeeper_net_avail_data_download_duration_count%7Bsuccess%3D%22true%22%7D%5B24h%5D)&query=bee_pusher_total_errors`);

    const { data } = response;


    if (data.status === 'success' && data.data.resultType === 'vector') {
      const result = data.data.result[0];
      const { metric, value } = result;

      const chunkRetrievalDuration = {
        job: metric.job,
        success: metric.success,
        timestamp: value[0],
        value: parseFloat(value[1]),
      };
      
      // Insert the data into the MongoDB collection
      const collection = db.collection('chunk_retrieval_duration');
      await collection.insertOne(chunkRetrievalDuration);

      console.log('Data saved to MongoDB:', chunkRetrievalDuration);
    } else {
      console.error('Invalid response from Prometheus:', data);
    }
  } catch (error) {
    console.error('Error fetching data from Prometheus:', error.message);
  } finally {
    // Close the MongoDB client connection
    await client.close();
  }
}


async function getDownloadSuccess24h(db) {
  try {
    // Connect the client to the MongoDB server
    await client.connect();
    const db = client.db('sla_metrics');

    const response = await axios.get(`${process.env.PROMETHEUS}query?query=(increase(beekeeper_net_avail_download_attempts[24h]) - increase(beekeeper_net_avail_download_errors_count[24h])) / increase(beekeeper_net_avail_download_attempts[24h])`);

    const { data } = response;


    if (data.status === 'success' && data.data.resultType === 'vector') {
      const result = data.data.result[0];
      const { metric, value } = result;

      const downloadSuccessRate = {
        job: metric.job,
        success: metric.success,
        timestamp: value[0],
        value: parseFloat(value[1]),
      };
      
      // Insert the data into the MongoDB collection
      const collection = db.collection('download_success_24h');
      await collection.insertOne(downloadSuccessRate);

      console.log('Data saved to MongoDB:', downloadSuccessRate);
    } else {
      console.error('Invalid response from Prometheus:', data);
    }
  } catch (error) {
    console.error('Error fetching data from Prometheus:', error.message);
  } finally {
    // Close the MongoDB client connection
    await client.close();
  }
}

async function getUploadSuccess24h(db) {
  try {
    // Connect the client to the MongoDB server
    await client.connect();
    const db = client.db('sla_metrics');

    const response = await axios.get(`${process.env.PROMETHEUS}query?query=(increase(beekeeper_net_avail_upload_attempts[24h]) - increase(beekeeper_net_avail_upload_errors_count[24h])) / increase(beekeeper_net_avail_upload_attempts[24h])`);

    const { data } = response;


    if (data.status === 'success' && data.data.resultType === 'vector') {
      const result = data.data.result[0];
      const { metric, value } = result;

      const uploadSuccessRate = {
        job: metric.job,
        success: metric.success,
        timestamp: value[0],
        value: parseFloat(value[1]),
      };
      
      // Insert the data into the MongoDB collection
      const collection = db.collection('upload_success_24h');
      await collection.insertOne(uploadSuccessRate);

      console.log('Data saved to MongoDB:', uploadSuccessRate);
    } else {
      console.error('Invalid response from Prometheus:', data);
    }
  } catch (error) {
    console.error('Error fetching data from Prometheus:', error.message);
  } finally {
    // Close the MongoDB client connection
    await client.close();
  }
}


async function fetchData() {
  try {
    await client.connect();
    const db = client.db('sla_metrics');

    await getChunkRetrievalDuration(db);
    await getDownloadSuccess24h(db);
    await getUploadSuccess24h(db);

    // Use Promise.all here when more retrieval functions are added
  } catch (error) {
    console.error('Error fetching data:', error.message);
  } finally {
    await client.close();
  }
}

module.exports = fetchData;


