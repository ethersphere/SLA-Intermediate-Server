const axios = require('axios');
const client = require('./db.js');

/**
 * A generic function to fetch metric data from Prometheus and store it incrementally in MongoDB.
 * @param {Db} db - The MongoDB database instance.
 * @param {string} collectionName - The name of the collection to store the metric in.
 * @param {string} promQuery - The Prometheus query string.
 * @param {string} metricName - A human-readable name for the metric.
 * @param {string} unit - The unit of the metric (e.g., "%", "ms").
 * @param {number} valueMultiplier - A number to multiply the raw value by (e.g., 100 for percentages).
 * @param {boolean} aggregateResults - Whether to aggregate results from multiple time series.
 */
async function updateMetricData(db, { collectionName, promQuery, metricName, unit, valueMultiplier = 1, aggregateResults = false }) {
  console.log(`--- Starting update for: ${metricName} ---`);
  const collection = db.collection(collectionName);
  let requestUrl = ''; // To store the URL for logging purposes

  try {
    // Find the existing document for this metric. We assume one document per metric.
    const existingMetric = await collection.findOne({});
    let startTime;

    // If data exists, find the last timestamp and start fetching from there.
    if (existingMetric && existingMetric.values && existingMetric.values.length > 0) {
      const lastEntry = existingMetric.values[existingMetric.values.length - 1];
      const lastTimestampStr = lastEntry[0];
      // Start from the second after the last entry to avoid duplicates.
      const startDate = new Date(new Date(lastTimestampStr).getTime() + 1000);
      startTime = startDate.toISOString().split('.')[0] + 'Z';
      console.log(`Found existing data. Fetching new data since ${startTime} for ${metricName}.`);
    } else {
      // If no data exists, fetch the last 30 days to create a baseline.
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      startTime = startDate.toISOString().split('.')[0] + 'Z';
      console.log(`No existing data found. Fetching initial 30-day baseline for ${metricName}.`);
    }

    const endTime = new Date().toISOString().split('.')[0] + 'Z';
    const encodedQuery = encodeURIComponent(promQuery);
    requestUrl = `${process.env.PROMETHEUS}query_range?query=${encodedQuery}&start=${startTime}&end=${endTime}&step=1d`;

    // Make the API call to Prometheus
    console.log(`Querying Prometheus for '${metricName}': ${requestUrl}`);
    const response = await axios.get(requestUrl);
    const { data } = response;
    console.log(`Successfully fetched data for '${metricName}'.`);


    // Validate the response from Prometheus
    if (data.status !== 'success' || data.data.resultType !== 'matrix' || !data.data.result) {
      console.error(`Invalid or empty response from Prometheus for ${metricName}:`, JSON.stringify(data, null, 2));
      return;
    }
    
    if (data.data.result.length === 0) {
        console.log(`No new data points found for ${metricName}.`);
        return;
    }

    // Process the new values from the response
    let newValues;
    if (aggregateResults) {
        let aggregatedValues = {};
        data.data.result.forEach(result => {
            result.values.forEach(([timestamp, value]) => {
                if (!aggregatedValues[timestamp]) {
                    aggregatedValues[timestamp] = [];
                }
                aggregatedValues[timestamp].push(parseFloat(value));
            });
        });

        newValues = Object.entries(aggregatedValues).map(([timestamp, values]) => {
            const average = values.reduce((sum, val) => sum + val, 0) / values.length;
            const finalValue = average * valueMultiplier;
            return [new Date(timestamp * 1000).toISOString(), finalValue];
        }).filter(([, value]) => Number.isFinite(value));

    } else {
        newValues = data.data.result[0].values.reduce((acc, [timestamp, value]) => {
            const date = new Date(timestamp * 1000).toISOString();
            const numericValue = parseFloat(value) * valueMultiplier;
            if (Number.isFinite(numericValue)) {
                acc.push([date, numericValue]);
            }
            return acc;
        }, []);
    }


    if (newValues.length === 0) {
      console.log(`No new valid data points to add for ${metricName}.`);
      return;
    }

    // Update the database
    if (existingMetric) {
      // If a document exists, append the new values to the array.
      const result = await collection.updateOne(
        { _id: existingMetric._id },
        { $push: { values: { $each: newValues } } }
      );
      console.log(`${result.modifiedCount > 0 ? newValues.length : 0} new data points saved for ${metricName}.`);
    } else {
      // If no document exists, create a new one.
      const metricDocument = {
        values: newValues,
        unit: unit,
        metric: metricName
      };
      await collection.insertOne(metricDocument);
      console.log(`Initial document created with ${newValues.length} data points for ${metricName}.`);
    }

  } catch (error) {
    console.error(`Error querying Prometheus for '${metricName}'. URL: ${requestUrl}. Error:`, error.message);
  }
}

/**
 * Main function to fetch all defined metrics.
 */
async function fetchData() {
  try {
    const db = client.db('sla_metrics');

    // Configuration for all metrics to be fetched.
    const metricsToFetch = [
      // Availability
      { collectionName: 'download_success_24h', promQuery: '(increase(beekeeper_net_avail_download_attempts[24h]) - increase(beekeeper_net_avail_download_errors_count[24h])) / increase(beekeeper_net_avail_download_attempts[24h])', metricName: '24h Download Success Rate', unit: '%', valueMultiplier: 100 },
      { collectionName: 'upload_success_24h', promQuery: '(increase(beekeeper_net_avail_upload_attempts[24h]) - increase(beekeeper_net_avail_upload_errors_count[24h])) / increase(beekeeper_net_avail_upload_attempts[24h])', metricName: '24h Upload Success Rate', unit: '%', valueMultiplier: 100 },
      { collectionName: 'download_success_all_time', promQuery: '(sum_over_time(beekeeper_net_avail_download_attempts[1h]) - sum_over_time(beekeeper_net_avail_download_errors_count[1h])) / sum_over_time(beekeeper_net_avail_download_attempts[1h])', metricName: 'All Time Chunk Download Success Rate', unit: '%', valueMultiplier: 100 },
      { collectionName: 'upload_success_all_time', promQuery: '(sum_over_time(beekeeper_net_avail_upload_attempts[1h]) - sum_over_time(beekeeper_net_avail_upload_errors_count[1h])) / sum_over_time(beekeeper_net_avail_upload_attempts[1h])', metricName: 'All Time Upload Success Rate', unit: '%', valueMultiplier: 100 },
      // Durability
      { collectionName: 'file_retrieval_rate_24h', promQuery: '1.0 - (sum(increase(beekeeper_check_data_durability_file_download_errors{job="bee-sla"}[86400s]))/sum(increase(beekeeper_check_data_durability_file_download_attempts{job="bee-sla"}[86400s])))', metricName: '24h File Retrieval Rate', unit: '%', valueMultiplier: 100 },
      { collectionName: 'chunk_retrieval_rate_24h', promQuery: '1.0 - (sum(increase(beekeeper_check_data_durability_chunk_download_errors{job="bee-sla"}[172800s]))/sum(increase(beekeeper_check_data_durability_chunk_download_attempts{job="bee-sla"}[172800s])))', metricName: '24h Chunk Retrieval Rate', unit: '%', valueMultiplier: 100 },
      // Latency
      { collectionName: 'chunk_retrieval_duration_24h', promQuery: 'increase(beekeeper_net_avail_data_download_duration_sum{success="true"}[24h]) / increase(beekeeper_net_avail_data_download_duration_count{success="true"}[24h])', metricName: '24h Chunk Retrieval Duration', unit: 'ms', valueMultiplier: 1000 },
      { collectionName: 'chunk_retrieval_duration_all_time', promQuery: 'beekeeper_net_avail_data_download_duration_sum{success="true"} / beekeeper_net_avail_data_download_duration_count{success="true"}', metricName: 'All Time Chunk Retrieval Duration', unit: 'ms', valueMultiplier: 1000 },
      { collectionName: 'file_download_speed_24h', promQuery: 'avg by(job) ( beekeeper_check_longavailability_d_download_size_bytes / (rate(beekeeper_check_longavailability_d_download_duration_seconds_sum{job="bee-sla"}[24h]) / rate(beekeeper_check_longavailability_d_download_duration_seconds_count{job="bee-sla"}[24h])))', metricName: 'File Download Speed 24h', unit: 'MiB/s', valueMultiplier: 1 / 1048576, aggregateResults: true },
      { collectionName: 'file_download_speed_all_time', promQuery: 'beekeeper_check_longavailability_d_download_size_bytes / (beekeeper_check_longavailability_d_download_duration_seconds_sum{job="bee-sla"} / beekeeper_check_longavailability_d_download_duration_seconds_count{job="bee-sla"})', metricName: 'File Download Speed All Time', unit: 'MiB/s', valueMultiplier: 1 / 1048576, aggregateResults: true },
    ];

    // Execute all metric updates in parallel.
    const updatePromises = metricsToFetch.map(metricConfig => updateMetricData(db, metricConfig));
    await Promise.all(updatePromises);

    console.log('All metrics have been updated successfully.');

  } catch (error) {
    console.error('An error occurred in the main fetchData function:', error.message);
  }
}

module.exports = fetchData;
