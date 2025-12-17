import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

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

// Lambda handler for world domination metrics search
export const handler = async (event) => {
  // Handle preflight OPTIONS request for CORS
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, { message: 'CORS preflight response' });
  }

  try {
    // Parse query parameters
    const { WDM_ID, WDM_playing_as, startDate, endDate } = event.queryStringParameters || {};
    
    const tableName = process.env.WDM_TABLE || 'world_domination_metrics';

    let result;

    // If WDM_ID is provided, use Query for efficient lookup
    if (WDM_ID) {
      const queryParams = {
        TableName: tableName,
        KeyConditionExpression: 'WDM_ID = :id',
        ExpressionAttributeValues: {
          ':id': WDM_ID
        }
      };

      const command = new QueryCommand(queryParams);
      result = await docClient.send(command);
    } 
    // Otherwise, use Scan with filters (less efficient, use for small datasets)
    else {
      const scanParams = {
        TableName: tableName
      };

      // Build filter expressions
      const filterExpressions = [];
      const expressionAttributeValues = {};
      const expressionAttributeNames = {};

      if (WDM_playing_as) {
        filterExpressions.push('WDM_playing_as = :country');
        expressionAttributeValues[':country'] = WDM_playing_as;
      }

      if (startDate) {
        filterExpressions.push('WDM_record_game_date >= :startDate');
        expressionAttributeValues[':startDate'] = startDate;
      }

      if (endDate) {
        filterExpressions.push('WDM_record_game_date <= :endDate');
        expressionAttributeValues[':endDate'] = endDate;
      }

      if (filterExpressions.length > 0) {
        scanParams.FilterExpression = filterExpressions.join(' AND ');
        scanParams.ExpressionAttributeValues = expressionAttributeValues;
      }

      if (Object.keys(expressionAttributeNames).length > 0) {
        scanParams.ExpressionAttributeNames = expressionAttributeNames;
      }

      const command = new ScanCommand(scanParams);
      result = await docClient.send(command);
    }

    // Return successful response
    return createResponse(200, {
      success: true,
      data: result.Items,
      count: result.Count,
      message: 'World domination metrics retrieved successfully'
    });

  } catch (error) {
    console.error('Error in world domination metrics search:', error);

    // Return error response
    return createResponse(500, {
      error: 'Internal server error',
      message: 'Failed to retrieve metrics data',
      details: error.message
    });
  }
};
