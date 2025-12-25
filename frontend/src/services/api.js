import axios from 'axios';

// Base URL for Lambda functions - update with your Function URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://your-lambda-function-url.amazonaws.com';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth headers if needed
apiClient.interceptors.request.use(
  (config) => {
    // Add any authentication headers here if required
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.error(`API Error [${status}]:`, data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error:', error.message);
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// API service functions
export const apiService = {
  // Example function to fetch data from Lambda
  async getData(endpoint, params = {}) {
    try {
      const response = await apiClient.get(endpoint, { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Example function to post data to Lambda
  async postData(endpoint, data) {
    try {
      const response = await apiClient.post(endpoint, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // World Domination Metrics endpoints
  async getMetrics(searchParams) {
    return this.getData('/', searchParams);
  },

  async getMetricsByCountry(countryCode) {
    return this.getData('/', { WDM_playing_as: countryCode });
  },

  async getMetricsById(wdmId) {
    return this.getData('/', { WDM_ID: wdmId });
  },

  async getMetricsByDateRange(startDate, endDate) {
    return this.getData('/', { startDate, endDate });
  },

  // Count endpoint - get counts grouped by country
  async getMetricsCount(startDate, endDate) {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    // Use the count endpoint URL directly
    const countUrl = process.env.REACT_APP_COUNT_API_URL || 'https://kyz2mgoyhedxkbbghhe4xkj5ue0xzden.lambda-url.ap-east-1.on.aws';
    
    try {
      const response = await axios.get(countUrl, { 
        params,
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      // Enhanced error logging for debugging
      if (error.response) {
        console.error('API Error Response:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('Network Error - No response received:', error.request);
        console.error('Request URL:', countUrl);
        console.error('Request Params:', params);
      } else {
        console.error('Error setting up request:', error.message);
      }
      throw error;
    }
  },

  // Add more API functions as needed for your specific endpoints
};

export default apiService;
