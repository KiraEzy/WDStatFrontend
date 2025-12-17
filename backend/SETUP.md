# Backend Setup Guide: DynamoDB & Lambda

This guide walks you through setting up the DynamoDB database and deploying Lambda functions for WDStat.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI installed and configured (`aws configure`)
- Node.js 20.x installed
- Basic understanding of AWS services

## Database Schema

**Table**: `world_domination_metrics`

**Columns**:
- `WDM_ID` (String) - Primary Key
- `WDM_playing_as` (String) - Country code (e.g., CAN, USA, GER)
- `WDM_record_game_date` (String) - Game date in YYYY-MM-DD format
- `WDM_start_wd_game_date` (String) - Game start date
- `WDM_Update_datetime` (String) - ISO timestamp
- `WDM_Create_datetime` (String) - ISO timestamp

## Step 1: Create DynamoDB Table

### Option A: Using AWS Console (Recommended for beginners)

1. **Navigate to DynamoDB Console**
   - Go to [AWS DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
   - Click **"Create table"**

2. **Configure Table Settings**
   - **Table name**: `world_domination_metrics`
   - **Partition key**: `WDM_ID` (type: String)
   - **Sort key**: Leave empty (not needed)
   - **Table settings**: Use default settings or customize as needed

3. **Configure Capacity**
   - Choose **On-demand** (pay per request) or **Provisioned** (fixed capacity)
   - For development: **On-demand** is recommended

4. **Create Table**
   - Click **"Create table"**
   - Wait for table status to become **"Active"**

### Option B: Using AWS CLI

```bash
aws dynamodb create-table \
    --table-name world_domination_metrics \
    --attribute-definitions \
        AttributeName=WDM_ID,AttributeType=S \
    --key-schema \
        AttributeName=WDM_ID,KeyType=HASH \
    --billing-mode ON_DEMAND \
    --region us-east-1
```

### Option C: Using CloudFormation/SAM Template

```bash
cd backend
sam build
sam deploy --guided
```

See `template.yaml` in the backend directory for Infrastructure as Code approach.

## Step 2: Create IAM Role for Lambda

1. **Navigate to IAM Console**
   - Go to [AWS IAM Console](https://console.aws.amazon.com/iam/)
   - Click **"Roles"** → **"Create role"**

2. **Select Trust Entity**
   - Choose **"AWS service"**
   - Select **"Lambda"**
   - Click **"Next"**

3. **Add Permissions**
   - Search for and attach: **"AmazonDynamoDBReadOnlyAccess"** (or create custom policy)
   - For custom policy, use the policy in `lambda-policy.json`
   - Click **"Next"**

4. **Name the Role**
   - Role name: `WDStatLambdaExecutionRole`
   - Description: "Execution role for WDStat Lambda functions"
   - Click **"Create role"**

5. **Note the Role ARN**
   - Copy the Role ARN (you'll need it for deployment)
   - Example: `arn:aws:iam::123456789012:role/WDStatLambdaExecutionRole`

## Step 3: Prepare Lambda Function for Deployment

### Install Dependencies

```bash
cd backend
npm install
```

### Create Deployment Package

```bash
# Create deployment package
npm run package

# This creates function.zip containing your code and dependencies
```

## Step 4: Deploy Lambda Function

### Option A: Using AWS Console

1. **Create Lambda Function**
   - Go to [AWS Lambda Console](https://console.aws.amazon.com/lambda/)
   - Click **"Create function"**
   - Choose **"Author from scratch"**
   - Function name: `wdstat-world-domination-metrics`
   - Runtime: **Node.js 20.x**
   - Architecture: **x86_64**
   - Execution role: Select the role created in Step 2
   - Click **"Create function"**

2. **Upload Code**
   - Scroll to **"Code source"** section
   - Click **"Upload from"** → **".zip file"**
   - Upload `function.zip`
   - Click **"Save"**

3. **Configure Handler**
   - Go to **"Runtime settings"** → Click **"Edit"**
   - Handler: `world-domination-metrics.handler`
   - Click **"Save"**

4. **Configure Environment Variables**
   - Go to **"Configuration"** tab → **"Environment variables"**
   - Click **"Edit"**
   - Add:
     - Key: `WDM_TABLE`, Value: `world_domination_metrics`
   - Click **"Save"**
   
   > **Note**: Do NOT set `AWS_REGION` - Lambda provides this automatically!

5. **Configure Function URL**
   - Go to **"Configuration"** tab → **"Function URL"**
   - Click **"Create function URL"**
   - Auth type: **"NONE"** (for public access)
   - Configure CORS: ✅ Check "Configure cross-origin resource sharing (CORS)"
     - Allow origins: `*` (or your specific domain like `https://kiraezy.github.io`)
     - Allow methods: Select **GET**, **HEAD**, **POST** (OPTIONS is automatically handled by AWS)
     - Allow headers: `Content-Type` (or `*` for all headers)
     - Max age: `86400` (optional)
   - Click **"Save"**
   - **Copy the Function URL** - you'll need this for the frontend!

### Option B: Using AWS CLI

```bash
# Create Lambda function
aws lambda create-function \
    --function-name wdstat-world-domination-metrics \
    --runtime nodejs20.x \
    --role arn:aws:iam::YOUR_ACCOUNT_ID:role/WDStatLambdaExecutionRole \
    --handler world-domination-metrics.handler \
    --zip-file fileb://function.zip \
    --environment Variables="{WDM_TABLE=world_domination_metrics}" \
    --region us-east-1

# Create Function URL
aws lambda create-function-url-config \
    --function-name wdstat-world-domination-metrics \
    --auth-type NONE \
    --cors '{"AllowOrigins":["*"],"AllowMethods":["GET","POST","OPTIONS"],"AllowHeaders":["Content-Type"]}' \
    --region us-east-1
```

## Step 5: Test the Lambda Function

### Test via AWS Console

1. Go to Lambda function → **"Test"** tab
2. Create a test event:
```json
{
  "httpMethod": "GET",
  "queryStringParameters": {
    "WDM_playing_as": "CAN"
  }
}
```
3. Click **"Test"** and check the response

### Test via Function URL

```bash
# Replace with your actual Function URL
curl "https://YOUR_FUNCTION_URL.lambda-url.us-east-1.on.aws/?WDM_playing_as=CAN"
```

### Test via Script

```bash
export LAMBDA_FUNCTION_NAME=wdstat-world-domination-metrics
npm run test-lambda
```

## Step 6: Populate DynamoDB with Sample Data

### Using Seed Script (Recommended)

```bash
export WDM_TABLE=world_domination_metrics
export AWS_REGION=us-east-1
npm run seed
```

### Using AWS Console

1. Go to DynamoDB → Select your table → **"Explore table items"**
2. Click **"Create item"**
3. Add attributes:
   - `WDM_ID`: `120120301230` (String)
   - `WDM_playing_as`: `CAN` (String)
   - `WDM_record_game_date`: `1940-08-21` (String)
   - `WDM_start_wd_game_date`: `1939-12-01` (String)
   - `WDM_Update_datetime`: `2024-01-01T09:00:00Z` (String)
   - `WDM_Create_datetime`: `2024-01-01T09:00:00Z` (String)
4. Click **"Create item"**
5. Repeat for more sample data

### Using AWS CLI

```bash
aws dynamodb put-item \
    --table-name world_domination_metrics \
    --item '{
        "WDM_ID": {"S": "120120301230"},
        "WDM_playing_as": {"S": "CAN"},
        "WDM_record_game_date": {"S": "1940-08-21"},
        "WDM_start_wd_game_date": {"S": "1939-12-01"},
        "WDM_Update_datetime": {"S": "2024-01-01T09:00:00Z"},
        "WDM_Create_datetime": {"S": "2024-01-01T09:00:00Z"}
    }' \
    --region us-east-1
```

## Step 7: Update Frontend API Configuration

1. **Get your Function URL** from Lambda console
2. **Create `.env` file** in `frontend` directory:
```env
REACT_APP_API_BASE_URL=https://YOUR_FUNCTION_URL.lambda-url.us-east-1.on.aws
```
3. **Restart the React dev server** if running

## API Endpoints

### GET /
Search world domination metrics with optional filters.

**Query Parameters:**
- `WDM_ID` (optional): Specific metric ID
- `WDM_playing_as` (optional): Filter by country code
- `startDate` (optional): Filter by game date (>=)
- `endDate` (optional): Filter by game date (<=)

**Response:**
```json
{
  "success": true,
  "data": [{
    "WDM_ID": "120120301230",
    "WDM_playing_as": "CAN",
    "WDM_record_game_date": "1940-08-21",
    "WDM_start_wd_game_date": "1939-12-01",
    "WDM_Update_datetime": "2024-01-01T09:00:00Z",
    "WDM_Create_datetime": "2024-01-01T09:00:00Z"
  }],
  "count": 1,
  "message": "World domination metrics retrieved successfully"
}
```

## Troubleshooting

### Common Issues

1. **"Access Denied" errors**
   - Check IAM role permissions
   - Ensure DynamoDB read permissions are attached

2. **"Table not found"**
   - Verify table name in environment variables matches exactly
   - Check table exists in the same region as Lambda

3. **CORS errors**
   - Verify Function URL CORS configuration
   - Check CORS headers in Lambda response

4. **Timeout errors**
   - Increase Lambda timeout in Configuration → General configuration
   - Check DynamoDB query performance
   - Consider using Query instead of Scan for large datasets

### Useful Commands

```bash
# View Lambda logs
aws logs tail /aws/lambda/wdstat-world-domination-metrics --follow

# Update Lambda code
aws lambda update-function-code \
    --function-name wdstat-world-domination-metrics \
    --zip-file fileb://function.zip

# Update environment variables
aws lambda update-function-configuration \
    --function-name wdstat-world-domination-metrics \
    --environment Variables="{WDM_TABLE=world_domination_metrics}"
```

## Next Steps

- Add more Lambda functions for different endpoints (POST, PUT, DELETE)
- Implement authentication/authorization
- Set up CloudWatch alarms for monitoring
- Configure API Gateway if needed (instead of Function URLs)
- Set up CI/CD pipeline for automated deployments
- Add secondary indexes for efficient filtering

## Security Best Practices

- ✅ Use IAM roles (not access keys) for Lambda execution
- ✅ Restrict CORS origins in production (replace `*` with your domain)
- ✅ Enable AWS CloudTrail for audit logging
- ✅ Use AWS Secrets Manager for sensitive configuration
- ✅ Implement rate limiting for public endpoints
- ✅ Enable VPC if Lambda needs private network access
- ✅ Implement input validation and sanitization
