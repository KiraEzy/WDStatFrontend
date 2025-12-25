import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

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

// Lambda handler for counting world domination metrics grouped by WDM_playing_as
export const handler = async (event) => {
  // Lambda Function URLs use requestContext.http.method, API Gateway uses httpMethod
  const httpMethod = event.requestContext?.http?.method || event.httpMethod;
  
  // Handle preflight OPTIONS request for CORS
  if (httpMethod === 'OPTIONS') {
    return createResponse(200, { message: 'CORS preflight response' });
  }

  // Only allow GET requests
  if (httpMethod !== 'GET') {
    return createResponse(405, {
      error: 'Method not allowed',
      message: 'Only GET method is supported for this endpoint'
    });
  }

  try {
    const tableName = process.env.WDM_TABLE || 'world_domination_metrics';

    // Optional date filters from query parameters
    const { startDate, endDate } = event.queryStringParameters || {};

    // Build scan parameters with optional date filters
    const scanParams = {
      TableName: tableName
    };

    const filterExpressions = [];
    const expressionAttributeValues = {};

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

    // Scan all records (or filtered by date range)
    const command = new ScanCommand(scanParams);
    const result = await docClient.send(command);

    // Group and count by WDM_playing_as
    const countsByCountry = {};
    let totalCount = 0;

    if (result.Items && result.Items.length > 0) {
      result.Items.forEach((item) => {
        const country = item.WDM_playing_as || 'UNKNOWN';
        
        if (!countsByCountry[country]) {
          countsByCountry[country] = 0;
        }
        
        countsByCountry[country]++;
        totalCount++;
      });
    }

    // Convert to array format for easier consumption
    const groupedData = Object.keys(countsByCountry).map((country) => ({
      WDM_playing_as: country,
      count: countsByCountry[country]
    }));

    // Sort by count descending, then by country code ascending
    groupedData.sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      return a.WDM_playing_as.localeCompare(b.WDM_playing_as);
    });

    // Return successful response
    return createResponse(200, {
      success: true,
      data: groupedData,
      summary: {
        total_records: totalCount,
        total_countries: groupedData.length,
        counts_by_country: countsByCountry
      },
      message: 'World domination metrics counts retrieved successfully'
    });

  } catch (error) {
    console.error('Error counting world domination metrics:', error);

    // Return error response
    return createResponse(500, {
      error: 'Internal server error',
      message: 'Failed to retrieve metrics counts',
      details: error.message
    });
  }
};


