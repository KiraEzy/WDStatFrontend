import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand } from "@aws-sdk/lib-dynamodb";

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: process.env.AWS_REGION || "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

// CORS headers as per project standards
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Content-Type": "application/json"
};

// Helper function to create HTTP response
const createResponse = (statusCode, body, headers = {}) => {
  return {
    statusCode,
    headers: { ...corsHeaders, ...headers },
    body: JSON.stringify(body)
  };
};

// Lambda handler for attendance search
export const handler = async (event) => {
  // Handle preflight OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, { message: 'CORS preflight response' });
  }

  try {
    // Parse query parameters
    const { date, employeeId, department } = event.queryStringParameters || {};

    // Validate required parameters
    if (!date) {
      return createResponse(400, {
        error: 'Missing required parameter: date'
      });
    }

    // Prepare DynamoDB query parameters
    const queryParams = {
      TableName: process.env.ATTENDANCE_TABLE || 'attendance-table',
      KeyConditionExpression: '#date = :dateVal',
      ExpressionAttributeNames: {
        '#date': 'date'
      },
      ExpressionAttributeValues: {
        ':dateVal': date
      }
    };

    // Add filters if provided
    if (employeeId) {
      queryParams.FilterExpression = 'employeeId = :empId';
      queryParams.ExpressionAttributeValues[':empId'] = employeeId;
    }

    if (department) {
      const filterExpression = employeeId ? ' AND department = :dept' : 'department = :dept';
      queryParams.FilterExpression = (queryParams.FilterExpression || '') + filterExpression;
      queryParams.ExpressionAttributeValues[':dept'] = department;
    }

    // Query DynamoDB
    const command = new QueryCommand(queryParams);
    const result = await docClient.send(command);

    // Return successful response
    return createResponse(200, {
      success: true,
      data: result.Items,
      count: result.Count,
      message: 'Attendance data retrieved successfully'
    });

  } catch (error) {
    console.error('Error in attendance search:', error);

    // Return error response
    return createResponse(500, {
      error: 'Internal server error',
      message: 'Failed to retrieve attendance data'
    });
  }
};
