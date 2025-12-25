# Postman Collection Setup Guide

## Quick Start

1. **Import the Collection**
   - Open Postman
   - Click **"Import"** button (top left)
   - Select `WDStat_API.postman_collection.json`
   - Click **"Import"**

2. **Set Environment Variables**
   - In Postman, click on the collection name: **"WDStat API - World Domination Metrics"**
   - Go to the **"Variables"** tab
   - Update the following variables:
     - `create_endpoint_url`: Your Lambda Function URL for the create endpoint
       - Example: `https://abc123xyz.lambda-url.us-east-1.on.aws`
     - `search_endpoint_url`: Your Lambda Function URL for the search endpoint
       - Example: `https://def456uvw.lambda-url.us-east-1.on.aws`

3. **Run Tests**
   - Expand the collection folders
   - Click on any request
   - Click **"Send"** to execute
   - Check the **"Test Results"** tab at the bottom

## Collection Structure

### 📝 Create Record
- **Create Record - Success**: Creates a new record with random WDM_ID
- **Create Record - Missing WDM_ID**: Tests validation (should return 400)
- **Create Record - Missing WDM_playing_as**: Tests validation (should return 400)
- **Create Record - Invalid JSON**: Tests error handling (should return 400)
- **Create Record - With Custom Timestamps**: Creates record with custom timestamps

### 🔍 Search Records
- **Search - Get All Records**: Retrieves all records
- **Search - Filter by Country**: Filters by `WDM_playing_as` (e.g., CAN)
- **Search - Filter by WDM_ID**: Gets specific record by ID
- **Search - Filter by Date Range**: Filters by date range

### 🌐 CORS Tests
- **OPTIONS Preflight Request**: Tests CORS preflight handling

## Test Scripts

Each request includes automated tests that verify:
- ✅ Status codes (200, 201, 400, etc.)
- ✅ Response structure and data
- ✅ Response time performance
- ✅ Validation error messages
- ✅ CORS headers

## Example Usage

### Create a New Record

1. Open **"Create Record"** → **"Create Record - Success"**
2. The request body uses `{{$randomInt}}` to generate unique IDs
3. Click **"Send"**
4. Check **"Test Results"** tab - all tests should pass ✅

### Search Records

1. Open **"Search Records"** → **"Search - Filter by Country"**
2. Modify the query parameter if needed
3. Click **"Send"**
4. View results in the response body

## Tips

- **Random IDs**: The collection uses `{{$randomInt}}` to avoid ID conflicts
- **Environment Variables**: Update URLs in the Variables tab for easy switching between environments
- **Saved Responses**: Right-click any request → **"Save Response"** → **"Save as Example"** to save sample responses
- **Collection Runner**: Use **"Run Collection"** to execute all tests at once

## Troubleshooting

### "Could not get response"
- Check that your Function URLs are correct in the Variables tab
- Verify your Lambda functions are deployed and active
- Check AWS CloudWatch logs for errors

### "CORS error"
- Ensure Function URLs have CORS enabled
- Check that `Access-Control-Allow-Origin` header is set to `*` or your domain

### "Validation errors"
- Check request body format matches the schema
- Ensure all required fields are present:
  - `WDM_ID` (required)
  - `WDM_playing_as` (required)
  - `WDM_record_game_date` (required)
  - `WDM_start_wd_game_date` (required)

## Sample Request Bodies

### Create Record (Minimal)
```json
{
  "WDM_ID": "120120301238",
  "WDM_playing_as": "CAN",
  "WDM_record_game_date": "1940-08-21",
  "WDM_start_wd_game_date": "1939-12-01"
}
```

### Create Record (With Timestamps)
```json
{
  "WDM_ID": "120120301239",
  "WDM_playing_as": "USA",
  "WDM_record_game_date": "1941-12-07",
  "WDM_start_wd_game_date": "1939-09-01",
  "WDM_Create_datetime": "2024-01-01T10:00:00Z",
  "WDM_Update_datetime": "2024-01-01T10:00:00Z"
}
```

## Next Steps

1. Import the collection into Postman
2. Update the Function URL variables
3. Run the tests to verify your endpoints work correctly
4. Use the collection for ongoing API testing and development


