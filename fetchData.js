const axios = require('axios');
const client = require('./db.js'); 


// Availability 
async function getDownloadSuccess24h(db) {
  try {
   
    const db = client.db('sla_metrics');
    const query = '(increase(beekeeper_net_avail_download_attempts[24h]) - increase(beekeeper_net_avail_download_errors_count[24h])) / increase(beekeeper_net_avail_download_attempts[24h])'
    const encodedQuery = encodeURIComponent(query);
    const response = await axios.get(`${process.env.PROMETHEUS}query_range?query=${encodedQuery}&start=2023-12-13T00:00:00Z&end=2023-12-31T23:59:59Z&step=1d`);
    const { data } = response;

    if (data.status === 'success' && data.data.resultType === 'matrix') {
      let { values } = data.data.result[0];

       // Convert timestamps to human-readable ISO date strings and check for numeric values
      values = values.reduce((acc, [timestamp, value]) => {
        const date = new Date(timestamp * 1000).toISOString();
        let numericValue = parseFloat(value) * 100;
        if (Number.isFinite(numericValue)) {
          acc.push([date, numericValue]);
        }
        return acc;
      }, []);
   
      const downloadSuccess24h = {
        values: values,
        unit: "%",
        metric: "24h Download Success Rate"
      };
      // Insert the data into the MongoDB collection
      const collection = db.collection('download_success_24h');
      const insertResult = await collection.insertOne(downloadSuccess24h);

      if (insertResult.insertedId) {
        // Delete all older entries
        await collection.deleteMany({ _id: { $ne: insertResult.insertedId } });
        console.log('Old entries deleted, new data saved to MongoDB: download_success_24h', JSON.stringify(downloadSuccess24h));
      }
      console.log('Data saved to MongoDB: download_success_24h', JSON.stringify(downloadSuccess24h));
    } else {
      console.error(`Invalid response from Prometheus (${downloadSuccess24h.metric}):`, data);
    }
  } catch (error) {
    console.error('Error fetching data from Prometheus:', error.message);
  } finally {

  }
}

async function getUploadSuccess24h(db) {
  try {
 
    const db = client.db('sla_metrics');

    const query = '(increase(beekeeper_net_avail_upload_attempts[24h]) - increase(beekeeper_net_avail_upload_errors_count[24h])) / increase(beekeeper_net_avail_upload_attempts[24h])'
    const encodedQuery = encodeURIComponent(query);
    const response = await axios.get(`${process.env.PROMETHEUS}query_range?query=${encodedQuery}&start=2023-12-13T00:00:00Z&end=2023-12-31T23:59:59Z&step=1d`);

    const { data } = response;


    if (data.status === 'success' && data.data.resultType === 'matrix') {
      let { values } = data.data.result[0];

       // Convert timestamps to human-readable ISO date strings and check for numeric values
      values = values.reduce((acc, [timestamp, value]) => {
        const date = new Date(timestamp * 1000).toISOString();
        let numericValue = parseFloat(value) * 100;
        if (Number.isFinite(numericValue)) {
          acc.push([date, numericValue]);
        }
        return acc;
      }, []);
   

      const uploadSuccess24h = {
        values: values,
        unit: "%",
        metric: "24h Upload Success Rate"
      };
      
      // Insert the data into the MongoDB collection
      const collection = db.collection('upload_success_24h');
      const insertResult = await collection.insertOne(uploadSuccess24h);

      if (insertResult.insertedId) {
        // Delete all older entries
        await collection.deleteMany({ _id: { $ne: insertResult.insertedId } });
        console.log('Old entries deleted, new data saved to MongoDB: upload_success_24h', JSON.stringify(uploadSuccess24h));
      }

      console.log('Data saved to MongoDB: upload_success_24h', uploadSuccess24h);
    } else {
      console.error(`Invalid response from Prometheus (${uploadSuccess24h.metric}):`, data);
    }
  } catch (error) {
    console.error('Error fetching data from Prometheus:', error.message);
  } 
}

async function getDownloadSuccessAllTime(db) {
  // For individual chunks
  try {
   
    const db = client.db('sla_metrics');
    const query = '(sum_over_time(beekeeper_net_avail_download_attempts[1h]) - sum_over_time(beekeeper_net_avail_download_errors_count[1h])) / sum_over_time(beekeeper_net_avail_download_attempts[1h])'
    const encodedQuery = encodeURIComponent(query);
    const response = await axios.get(`${process.env.PROMETHEUS}query_range?query=${encodedQuery}&start=2023-12-13T00:00:00Z&end=2023-12-31T23:59:59Z&step=1d`);
    const { data } = response;

    if (data.status === 'success' && data.data.resultType === 'matrix') {
      let { values } = data.data.result[0];
       // Convert timestamps to human-readable ISO date strings and check for numeric values
      values = values.reduce((acc, [timestamp, value]) => {
        const date = new Date(timestamp * 1000).toISOString();
        let numericValue = parseFloat(value) * 100;
        if (Number.isFinite(numericValue)) {
          acc.push([date, numericValue]);
        }
        return acc;
      }, []);

      const downloadSuccessAllTime = {
        values: values,
        unit: "%",
        metric: "All Time Chunk Download Success Rate"
      };  
      
      // Insert the data into the MongoDB collection
      const collection = db.collection('download_success_all_time');
      const insertResult = await collection.insertOne(downloadSuccessAllTime);

      if (insertResult.insertedId) {
        // Delete all older entries
        await collection.deleteMany({ _id: { $ne: insertResult.insertedId } });
        console.log('Old entries deleted, new data saved to MongoDB: download_success_all_time', JSON.stringify(downloadSuccessAllTime));
      }
      console.log('Data saved to MongoDB: downloadSuccessAllTime', downloadSuccessAllTime);
    

    } else {
      console.error(`Invalid response from Prometheus (${downloadSuccessAllTime.metric}):`, data);
    }
  } catch (error) {
    console.error('Error fetching data from Prometheus:', error.message);
  } finally {

  }
}

async function getUploadSuccessAllTime(db) {
  try {
   
    const db = client.db('sla_metrics');
    const query = '(sum_over_time(beekeeper_net_avail_upload_attempts[1h]) - sum_over_time(beekeeper_net_avail_upload_errors_count[1h])) / sum_over_time(beekeeper_net_avail_upload_attempts[1h])'
    const encodedQuery = encodeURIComponent(query);
    const response = await axios.get(`${process.env.PROMETHEUS}query_range?query=${encodedQuery}&start=2023-12-13T00:00:00Z&end=2023-12-31T23:59:59Z&step=1d`);
    const { data } = response;


    if (data.status === 'success' && data.data.resultType === 'matrix') {
      let { values } = data.data.result[0];
       // Convert timestamps to human-readable ISO date strings and check for numeric values
      values = values.reduce((acc, [timestamp, value]) => {
        const date = new Date(timestamp * 1000).toISOString();
        let numericValue = parseFloat(value) * 100;
        if (Number.isFinite(numericValue)) {
          acc.push([date, numericValue]);
        }
        return acc;
      }, []);

   
      
     
      const uploadSuccessAllTime = {
        values: values,
        unit: "%",
        metric: "All Time Upload Success Rate"
      };  
      
      // Insert the data into the MongoDB collection
      const collection = db.collection('upload_success_all_time');
      const insertResult = await collection.insertOne(uploadSuccessAllTime);

      if (insertResult.insertedId) {
        // Delete all older entries
        await collection.deleteMany({ _id: { $ne: insertResult.insertedId } });
        console.log('Old entries deleted, new data saved to MongoDB: upload_success_all_time', JSON.stringify(uploadSuccessAllTime));
      }
      console.log('Data saved to MongoDB: uploadSuccessAllTime', uploadSuccessAllTime);
    

    } else {
      console.error(`Invalid response from Prometheus (${uploadSuccessAllTime.metric}):`, data);
    }
  } catch (error) {
    console.error('Error fetching data from Prometheus:', error.message);
  } finally {

  }
}

// Durability 
async function getFileRetrievalRate24h(db) {
  try {
    const db = client.db('sla_metrics');

    const query = '1.0 - (sum(increase(beekeeper_check_data_durability_file_download_errors{job="dev-bee-gateway"}[86400s]))/sum(increase(beekeeper_check_data_durability_file_download_attempts{job="dev-bee-gateway"}[86400s])))'
    const encodedQuery = encodeURIComponent(query);
    const response = await axios.get(`${process.env.PROMETHEUS}query_range?query=${encodedQuery}&start=2023-12-13T00:00:00Z&end=2023-12-31T23:59:59Z&step=1d`);


    const { data } = response;


    if (data.status === 'success' && data.data.resultType === 'matrix') {
      let { values } = data.data.result[0];
       // Convert timestamps to human-readable ISO date strings and check for numeric values
      values = values.reduce((acc, [timestamp, value]) => {
        const date = new Date(timestamp * 1000).toISOString();
        let numericValue = parseFloat(value) * 100;
        if (Number.isFinite(numericValue)) {
          acc.push([date, numericValue]);
        }
        return acc;
      }, []);
    

      const fileRetrievalRate24h = {
        value: values,
        unit: "%",
        metric: "24h File Retrieval Rate"
      };
      
      // Insert the data into the MongoDB collection
      const collection = db.collection('file_retrieval_rate_24h');
      const insertResult = await collection.insertOne(fileRetrievalRate24h);

        if (insertResult.insertedId) {
          // Delete all older entries
          await collection.deleteMany({ _id: { $ne: insertResult.insertedId } });
          console.log('Old entries deleted, new data saved to MongoDB: file_retrieval_rate', JSON.stringify(fileRetrievalRate24h));
        }

      console.log('Data saved to MongoDB: file_retrieval_rate', fileRetrievalRate24h);
    } else {
      console.error(`Invalid response from Prometheus (${fileRetrievalRate24h.metric}):`, data);
    }
  } catch (error) {
    console.error('Error fetching data from Prometheus:', error.message);
  } 
}
async function getChunkRetrievalRate24h(db) {
  try {
    const db = client.db('sla_metrics');

    const query = '1.0 - (sum(increase(beekeeper_check_data_durability_chunk_download_errors{job="dev-bee-gateway"}[172800s]))/sum(increase(beekeeper_check_data_durability_chunk_download_attempts{job="dev-bee-gateway"}[172800s])))'
    const encodedQuery = encodeURIComponent(query);
    const response = await axios.get(`${process.env.PROMETHEUS}query_range?query=${encodedQuery}&start=2023-12-13T00:00:00Z&end=2023-12-31T23:59:59Z&step=1d`);
    const { data } = response;

    if (data.status === 'success' && data.data.resultType === 'matrix') {
      let { values } = data.data.result[0];

       // Convert timestamps to human-readable ISO date strings and check for numeric values
       values = values.reduce((acc, [timestamp, value]) => {
        const date = new Date(timestamp * 1000).toISOString();
        let numericValue = parseFloat(value) * 100;
        if (Number.isFinite(numericValue)) {
          acc.push([date, numericValue]);
        }
        return acc;
      }, []);

      const chunkRetrievalRate = {
        values: values,
        unit: "%",
        metric: "24h Chunk Retrieval Rate"
      };
      
      // Insert the data into the MongoDB collection
      const collection = db.collection('chunk_retrieval_rate_24h');
      const insertResult = await collection.insertOne(chunkRetrievalRate);

      if (insertResult.insertedId) {
        // Delete all older entries
        await collection.deleteMany({ _id: { $ne: insertResult.insertedId } });
        console.log('Old entries deleted, new data saved to MongoDB: chunk_retrieval_rate_24h', JSON.stringify(chunkRetrievalRate));
      }

      console.log('Data saved to MongoDB: file_retrieval_rate', chunkRetrievalRate);
    } else {
      console.error(`Invalid response from Prometheus (${chunkRetrievalRate.metric}):`, data);
    }
  } catch (error) {
    console.error('Error fetching data from Prometheus:', error.message);
  } finally {
 
  }
}

// Latency 
async function getChunkRetrievalDuration24h(db) {
  try {
   
    const db = client.db('sla_metrics');
    const query = 'increase(beekeeper_net_avail_data_download_duration_sum{success="true"}[24h]) / increase(beekeeper_net_avail_data_download_duration_count{success="true"}[24h])'
    const encodedQuery = encodeURIComponent(query);
    const response = await axios.get(`${process.env.PROMETHEUS}query_range?query=${encodedQuery}&start=2023-12-13T00:00:00Z&end=2023-12-31T23:59:59Z&step=1d`);

    const { data } = response;
  


    if (data.status === 'success' && data.data.resultType === 'matrix') {
      let { values } = data.data.result[0];
       // Convert timestamps to human-readable ISO date strings and check for numeric values
      values = values.reduce((acc, [timestamp, value]) => {
        const date = new Date(timestamp * 1000).toISOString();
        let numericValue = parseFloat(value) * 1000;
        if (Number.isFinite(numericValue)) {
          acc.push([date, numericValue]);
        }
        return acc;
      }, []);


      const chunkRetrievalDuration24h = {
        values: values,
        unit: "ms",
        metric: "24h Chunk Retrieval Duration"
      };
      
      // Insert the data into the MongoDB collection
      const collection = db.collection('chunk_retrieval_duration_24h');
      const insertResult = await collection.insertOne(chunkRetrievalDuration24h);

      if (insertResult.insertedId) {
        // Delete all older entries
        await collection.deleteMany({ _id: { $ne: insertResult.insertedId } });
        console.log('Old entries deleted, new data saved to MongoDB: chunk_retrieval_duration_24h', JSON.stringify(chunkRetrievalDuration24h));
      }

      console.log('Data saved to MongoDB: chunk_retrieval_duration_24h', chunkRetrievalDuration24h);
    } else {
      // console.error(`Invalid response from Prometheus (${chunkRetrievalDuration24h.metric}):`, data);
    }
  } catch (error) {
    console.error('Error fetching data from Prometheus:', error.message);
  }
}

async function getChunkRetrievalDurationAllTime(db) {
  try {
   
    const db = client.db('sla_metrics');
    const query = 'beekeeper_net_avail_data_download_duration_sum{success="true"} / beekeeper_net_avail_data_download_duration_count{success="true"}'
    const encodedQuery = encodeURIComponent(query);
    const response = await axios.get(`${process.env.PROMETHEUS}query_range?query=${encodedQuery}&start=2023-12-13T00:00:00Z&end=2023-12-31T23:59:59Z&step=1d`);

    const { data } = response;


    if (data.status === 'success' && data.data.resultType === 'matrix') {
      let { values } = data.data.result[0];

       // Convert timestamps to human-readable ISO date strings and check for numeric values
      values = values.reduce((acc, [timestamp, value]) => {
        const date = new Date(timestamp * 1000).toISOString();
        let numericValue = parseFloat(value) * 1000;
        if (Number.isFinite(numericValue)) {
          acc.push([date, numericValue]);
        }
        return acc;
      }, []);
      const chunkRetrievalDurationAllTime = {
        values: values,
        unit: "ms",
        metric: "All Time Chunk Retrieval Duration"
      };
      
      // Insert the data into the MongoDB collection
      const collection = db.collection('chunk_retrieval_duration_all_time');
      const insertResult = await collection.insertOne(chunkRetrievalDurationAllTime);

      if (insertResult.insertedId) {
        // Delete all older entries
        await collection.deleteMany({ _id: { $ne: insertResult.insertedId } });
        console.log('Old entries deleted, new data saved to MongoDB: chunk_retrieval_duration_all_time', JSON.stringify(chunkRetrievalDurationAllTime));
      }

      console.log('Data saved to MongoDB: chunk_retrieval_duration_all_time', chunkRetrievalDurationAllTime);
    } else {
      console.error(`Invalid response from Prometheus (${chunkRetrievalDurationAllTime.metric}):`, data);
    }
  } catch (error) {
    console.error('Error fetching data from Prometheus:', error.message);
  }
}



async function fetchData() {
  try {
    const db = client.db('sla_metrics');
    let metrics = [
      getDownloadSuccess24h(db),
      getUploadSuccess24h(db),
      getDownloadSuccessAllTime(db),
      getUploadSuccessAllTime(db),
      getFileRetrievalRate24h(db),
      getChunkRetrievalRate24h(db),
      getChunkRetrievalDuration24h(db),
      getChunkRetrievalDurationAllTime(db)
    ];

    // Execute all metrics functions; 
    await Promise.all(metrics);


    console.log('All metrics functions executed successfully.');

  } catch (error) {
    console.error('Error fetching data:', error.message);
    // Additional error handling can be added here if necessary
  } 
}


module.exports = fetchData;


