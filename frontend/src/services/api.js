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

  // Example function for attendance/search endpoint
  async searchAttendance(searchParams) {
    return this.getData('/attendance/search', searchParams);
  },

  // Add more API functions as needed for your specific endpoints
};

export default apiService;
