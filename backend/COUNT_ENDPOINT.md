# Count Endpoint - Grouped by Country

## Overview

The count endpoint (`world-domination-metrics-count.js`) provides aggregated counts of world domination metrics records grouped by `WDM_playing_as` (country code).

## Endpoint Details

- **Method**: GET
- **Handler**: `world-domination-metrics-count.handler`
- **Function Name**: `wdstat-world-domination-metrics-count`

## Features

- ✅ Counts all records grouped by `WDM_playing_as`
- ✅ Optional date range filtering (`startDate`, `endDate`)
- ✅ Returns sorted results (by count descending, then country code)
- ✅ Includes summary statistics

## Query Parameters

- `startDate` (optional): Filter records with `WDM_record_game_date >= startDate` (format: YYYY-MM-DD)
- `endDate` (optional): Filter records with `WDM_record_game_date <= endDate` (format: YYYY-MM-DD)

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "data": [
    {
      "WDM_playing_as": "CAN",
      "count": 5
    },
    {
      "WDM_playing_as": "USA",
      "count": 3
    },
    {
      "WDM_playing_as": "GER",
      "count": 2
    }
  ],
  "summary": {
    "total_records": 10,
    "total_countries": 3,
    "counts_by_country": {
      "CAN": 5,
      "USA": 3,
      "GER": 2
    }
  },
  "message": "World domination metrics counts retrieved successfully"
}
```

### Error Response (500)

```json
{
  "error": "Internal server error",
  "message": "Failed to retrieve metrics counts",
  "details": "Error details here"
}
```

## Function URL

**Production URL**: `https://kyz2mgoyhedxkbbghhe4xkj5ue0xzden.lambda-url.ap-east-1.on.aws`

## Usage Examples

### Get all counts (no filters)

```bash
curl "https://kyz2mgoyhedxkbbghhe4xkj5ue0xzden.lambda-url.ap-east-1.on.aws"
```

### Get counts filtered by date range

```bash
curl "https://kyz2mgoyhedxkbbghhe4xkj5ue0xzden.lambda-url.ap-east-1.on.aws?startDate=1940-01-01&endDate=1941-12-31"
```

### JavaScript/Fetch Example

```javascript
// Get all counts
const response = await fetch('https://kyz2mgoyhedxkbbghhe4xkj5ue0xzden.lambda-url.ap-east-1.on.aws');
const data = await response.json();

console.log(data.data); // Array of { WDM_playing_as, count }
console.log(data.summary.total_records); // Total count
console.log(data.summary.counts_by_country); // Object with country codes as keys

// Get counts for specific date range
const filteredResponse = await fetch(
  'https://kyz2mgoyhedxkbbghhe4xkj5ue0xzden.lambda-url.ap-east-1.on.aws?startDate=1940-01-01&endDate=1941-12-31'
);
const filteredData = await filteredResponse.json();
```

## Response Structure

- **`data`**: Array of objects, each containing:
  - `WDM_playing_as`: Country code (e.g., "CAN", "USA", "GER")
  - `count`: Number of records for that country
  - Sorted by count (descending), then by country code (ascending)

- **`summary`**: Object containing:
  - `total_records`: Total number of records counted
  - `total_countries`: Number of unique countries
  - `counts_by_country`: Object with country codes as keys and counts as values

## Deployment

### Using AWS Console

1. Create Lambda function: `wdstat-world-domination-metrics-count`
2. Runtime: Node.js 20.x
3. Handler: `functions/world-domination-metrics-count.handler`
4. Upload `function.zip` (includes all functions)
5. Set environment variable: `WDM_TABLE=world_domination_metrics`
6. Create Function URL with CORS enabled (GET, OPTIONS methods)

### Using AWS SAM

The endpoint is included in `template.yaml`. Deploy with:

```bash
cd backend
sam build
sam deploy
```

### Using AWS CLI

```bash
aws lambda create-function \
    --function-name wdstat-world-domination-metrics-count \
    --runtime nodejs20.x \
    --role arn:aws:iam::YOUR_ACCOUNT_ID:role/WDStatLambdaExecutionRole \
    --handler functions/world-domination-metrics-count.handler \
    --zip-file fileb://function.zip \
    --environment Variables="{WDM_TABLE=world_domination_metrics}" \
    --region ap-east-1

aws lambda create-function-url-config \
    --function-name wdstat-world-domination-metrics-count \
    --auth-type NONE \
    --cors '{"AllowOrigins":["*"],"AllowMethods":["GET","OPTIONS"],"AllowHeaders":["Content-Type"]}' \
    --region ap-east-1
```

## Permissions Required

The Lambda execution role needs:
- `dynamodb:Scan` - To scan all records
- `dynamodb:Query` - Not required for this endpoint, but good to have
- `dynamodb:GetItem` - Not required for this endpoint, but good to have

## Performance Notes

- Uses `ScanCommand` to retrieve all records (or filtered by date)
- For large datasets, consider adding pagination
- Results are aggregated in memory after the scan
- Date filtering happens at the DynamoDB level for efficiency

## Use Cases

- Dashboard statistics showing game counts per country
- Data visualization (pie charts, bar charts)
- Analytics and reporting
- Quick overview of data distribution


