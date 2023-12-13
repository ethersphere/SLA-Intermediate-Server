const axios = require('axios');
const client = require('./db.js'); 



// Function to fetch data from the Prometheus endpoint and save it to MongoDB

async function chunkRetrievalDuration24h(db) {
  try {
   
    const db = client.db('sla_metrics');
    const query = 'increase(beekeeper_net_avail_data_download_duration_sum{success="true"}[24h]) / increase(beekeeper_net_avail_data_download_duration_count{success="true"}[24h])'
    const encodedQuery = encodeURIComponent(query);
    const response = await axios.get(`${process.env.PROMETHEUS}query?query=${encodedQuery}`);

    const { data } = response;


    if (data.status === 'success' && data.data.resultType === 'vector') {
      const result = data.data.result[0];
      const { metric, value } = result;

      const chunkRetrievalDuration = {
        timestamp: value[0],
        value: parseFloat(value[1]) * 1000,
        unit: "ms"
      };
      
      // Insert the data into the MongoDB collection
      const collection = db.collection('chunk_retrieval_duration');
      await collection.insertOne(chunkRetrievalDuration);

      console.log('Data saved to MongoDB: chunk_retrieval_duration', chunkRetrievalDuration);
    } else {
      console.error('Invalid response from Prometheus:', data);
    }
  } catch (error) {
    console.error('Error fetching data from Prometheus:', error.message);
  }
}

// async function getAvgFileDownloadDuration(db) {

// }

async function avgChunkDownloadDuration(db) {
  try {

    const db = client.db('sla_metrics');
    const query = 'rate(beekeeper_check_data_durability_chunk_download_duration_seconds_sum{job="dev-bee-gateway"}[172800s])/rate(beekeeper_check_data_durability_chunk_download_duration_seconds_count{job="dev-bee-gateway"}[172800s])'
    const encodedQuery = encodeURIComponent(query);
    const response = await axios.get(`${process.env.PROMETHEUS}query?query=${encodedQuery}`);

    const { data } = response;


    if (data.status === 'success' && data.data.resultType === 'vector') {
      const result = data.data.result[0];
      const { metric, value } = result;

      const chunkDownloadDuration = {
        timestamp: value[0],
        value: parseFloat(value[1]) * 1000,
        unit: "ms"
      };
      
      // Insert the data into the MongoDB collection
      const collection = db.collection('avg_chunk_download_duration');
      await collection.insertOne(chunkDownloadDuration);

      console.log('Data saved to MongoDB: chunk_download_duration', chunkDownloadDuration);
    } else {
      console.error('Invalid response from Prometheus:', data);
    }
  } catch (error) {
    console.error('Error fetching data from Prometheus:', error.message);
  } 
}

async function avgFileDownloadDuration(db) {
  try {

    const db = client.db('sla_metrics');
    const query = 'rate(beekeeper_check_data_durability_file_download_duration_seconds_sum{job="dev-bee-gateway"}[172800s])/rate(beekeeper_check_data_durability_file_download_duration_seconds_count{job="dev-bee-gateway"}[172800s])'
    const encodedQuery = encodeURIComponent(query);
    const response = await axios.get(`${process.env.PROMETHEUS}query?query=${encodedQuery}`);

    const { data } = response;


    if (data.status === 'success' && data.data.resultType === 'vector') {
      const result = data.data.result[0];
      const { metric, value } = result;

      const avgFileDownloadDuration = {
        timestamp: value[0],
        value: parseFloat(value[1]) * 1000,
        unit: "ms"
      };
      
      // Insert the data into the MongoDB collection
      const collection = db.collection('avg_file_download_duration');
      await collection.insertOne(avgFileDownloadDuration);

      console.log('Data saved to MongoDB: avg_file_download_duration', avgFileDownloadDuration);
    } else {
      console.error('Invalid response from Prometheus:', data);
    }
  } catch (error) {
    console.error('Error fetching data from Prometheus:', error.message);
  } 
}

async function fileRetrievalRate(db) {
  try {
    const db = client.db('sla_metrics');

    const query = '1.0 - (sum(increase(beekeeper_check_data_durability_file_download_errors{job="dev-bee-gateway"}[86400s]))/sum(increase(beekeeper_check_data_durability_file_download_attempts{job="dev-bee-gateway"}[86400s])))'
    const encodedQuery = encodeURIComponent(query);
    const response = await axios.get(`${process.env.PROMETHEUS}query?query=${encodedQuery}`);


    const { data } = response;


    if (data.status === 'success' && data.data.resultType === 'vector') {
      const result = data.data.result[0];
      const { metric, value } = result;

      const fileRetrievalRate = {
        timestamp: value[0],
        value: parseFloat(value[1]) * 100,
        unit: "%"
      };
      
      // Insert the data into the MongoDB collection
      const collection = db.collection('file_retrieval_rate');
      await collection.insertOne(fileRetrievalRate);

      console.log('Data saved to MongoDB: file_retrieval_rate', fileRetrievalRate);
    } else {
      console.error('Invalid response from Prometheus:', data);
    }
  } catch (error) {
    console.error('Error fetching data from Prometheus:', error.message);
  } 
}
async function chunkRetrievalRate(db) {
  try {
    const db = client.db('sla_metrics');

    const query = '1.0 - (sum(increase(beekeeper_check_data_durability_chunk_download_errors{job="dev-bee-gateway"}[172800s]))/sum(increase(beekeeper_check_data_durability_chunk_download_attempts{job="dev-bee-gateway"}[172800s])))'
    const encodedQuery = encodeURIComponent(query);
    const response = await axios.get(`${process.env.PROMETHEUS}query?query=${encodedQuery}`);
    const { data } = response;

    if (data.status === 'success' && data.data.resultType === 'vector') {
      const result = data.data.result[0];
      const { metric, value } = result;

      const chunkRetrievalRate = {
        timestamp: value[0],
        value: parseFloat(value[1]) * 100,
        unit: "%"
      };
      
      // Insert the data into the MongoDB collection
      const collection = db.collection('chunk_retrieval_rate');
      await collection.insertOne(chunkRetrievalRate);

      console.log('Data saved to MongoDB: file_retrieval_rate', chunkRetrievalRate);
    } else {
      console.error('Invalid response from Prometheus:', data);
    }
  } catch (error) {
    console.error('Error fetching data from Prometheus:', error.message);
  } finally {
 
  }
}

async function downloadSuccess24h(db) {
  try {
   
    const db = client.db('sla_metrics');
    const query = '(increase(beekeeper_net_avail_download_attempts[24h]) - increase(beekeeper_net_avail_download_errors_count[24h])) / increase(beekeeper_net_avail_download_attempts[24h])'
    const encodedQuery = encodeURIComponent(query);
    const response = await axios.get(`${process.env.PROMETHEUS}query?query=${encodedQuery}`);
    const { data } = response;


    if (data.status === 'success' && data.data.resultType === 'vector') {
      const result = data.data.result[0];
      const { metric, value } = result;

      const downloadSuccess24h = {
        timestamp: value[0],
        value: parseFloat(value[1]) * 100,
        unit: "%"
      };
      
      // Insert the data into the MongoDB collection
      const collection = db.collection('download_success_24h');
      await collection.insertOne(downloadSuccess24h);

      console.log('Data saved to MongoDB: download_success_24h', downloadSuccess24h);
    } else {
      console.error('Invalid response from Prometheus:', data);
    }
  } catch (error) {
    console.error('Error fetching data from Prometheus:', error.message);
  } finally {

  }
}

async function uploadSuccess24h(db) {
  try {
 
    const db = client.db('sla_metrics');

    const query = '(increase(beekeeper_net_avail_upload_attempts[24h]) - increase(beekeeper_net_avail_upload_errors_count[24h])) / increase(beekeeper_net_avail_upload_attempts[24h])'
    const encodedQuery = encodeURIComponent(query);
    const response = await axios.get(`${process.env.PROMETHEUS}query?query=${encodedQuery}`);

    const { data } = response;


    if (data.status === 'success' && data.data.resultType === 'vector') {
      const result = data.data.result[0];
      const { metric, value } = result;

      const uploadSuccess24h = {
        timestamp: value[0],
        value: parseFloat(value[1]) * 100,
        unit: "%"
      };
      
      // Insert the data into the MongoDB collection
      const collection = db.collection('upload_success_24h');
      await collection.insertOne(uploadSuccess24h);

      console.log('Data saved to MongoDB: upload_success_24h', uploadSuccess24h);
    } else {
      console.error('Invalid response from Prometheus:', data);
    }
  } catch (error) {
    console.error('Error fetching data from Prometheus:', error.message);
  } 
}


async function fetchData() {
  try {

    const db = client.db('sla_metrics');

    await downloadSuccess24h(db);

    await uploadSuccess24h(db);

    await chunkRetrievalDuration24h(db);

    await fileRetrievalRate(db);
    await chunkRetrievalRate(db);

    await avgChunkDownloadDuration(db);
    await avgFileDownloadDuration(db);

    // Use Promise.all here when more retrieval functions are added
  } catch (error) {
    console.error('Error fetching data:', error.message);
  } 
}

module.exports = fetchData;


