import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";

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

// Lambda handler for creating world domination metrics records
export const handler = async (event) => {
  // Lambda Function URLs use requestContext.http.method, API Gateway uses httpMethod
  const httpMethod = event.requestContext?.http?.method || event.httpMethod;
  
  // Handle preflight OPTIONS request for CORS
  if (httpMethod === 'OPTIONS') {
    return createResponse(200, { message: 'CORS preflight response' });
  }

  // Only allow POST requests
  if (httpMethod !== 'POST') {
    return createResponse(405, {
      error: 'Method not allowed',
      message: 'Only POST method is supported for creating records'
    });
  }

  try {
    // Parse request body
    let requestBody;
    try {
      requestBody = JSON.parse(event.body || '{}');
    } catch (parseError) {
      return createResponse(400, {
        error: 'Invalid JSON',
        message: 'Request body must be valid JSON'
      });
    }

    // Validate required fields
    const { WDM_ID, WDM_playing_as, WDM_record_game_date, WDM_start_wd_game_date } = requestBody;

    if (!WDM_ID) {
      return createResponse(400, {
        error: 'Validation error',
        message: 'WDM_ID is required'
      });
    }

    if (!WDM_playing_as) {
      return createResponse(400, {
        error: 'Validation error',
        message: 'WDM_playing_as is required'
      });
    }

    if (!WDM_record_game_date) {
      return createResponse(400, {
        error: 'Validation error',
        message: 'WDM_record_game_date is required'
      });
    }

    if (!WDM_start_wd_game_date) {
      return createResponse(400, {
        error: 'Validation error',
        message: 'WDM_start_wd_game_date is required'
      });
    }

    const tableName = process.env.WDM_TABLE || 'world_domination_metrics';

    // Generate ISO timestamp for create and update datetime
    const now = new Date().toISOString();

    // Prepare the item to be created
    const item = {
      WDM_ID,
      WDM_playing_as,
      WDM_record_game_date,
      WDM_start_wd_game_date,
      WDM_Create_datetime: requestBody.WDM_Create_datetime || now,
      WDM_Update_datetime: requestBody.WDM_Update_datetime || now
    };

    // Create the record in DynamoDB
    const command = new PutCommand({
      TableName: tableName,
      Item: item
    });

    await docClient.send(command);

    // Return successful response
    return createResponse(201, {
      success: true,
      message: 'World domination metrics record created successfully',
      data: item
    });

  } catch (error) {
    console.error('Error creating world domination metrics record:', error);

    // Handle specific DynamoDB errors
    if (error.name === 'ConditionalCheckFailedException') {
      return createResponse(409, {
        error: 'Conflict',
        message: 'Record with this WDM_ID already exists'
      });
    }

    // Return generic error response
    return createResponse(500, {
      error: 'Internal server error',
      message: 'Failed to create metrics record',
      details: error.message
    });
  }
};

