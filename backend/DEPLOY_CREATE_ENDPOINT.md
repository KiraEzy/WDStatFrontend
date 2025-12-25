# Deploying the Create Endpoint to AWS Lambda

This guide shows you how to add the new `world-domination-metrics-create.js` endpoint to AWS Lambda.

## Prerequisites

- AWS Account with appropriate permissions
- AWS CLI configured (if using CLI method)
- `function.zip` already built (run `npm run package`)

## Method 1: Using AWS Console (Recommended for Beginners)

### Step 1: Update IAM Role Permissions

The create endpoint needs write permissions. Update your existing IAM role:

1. Go to [IAM Console](https://console.aws.amazon.com/iam/) → **Roles**
2. Find and click on `WDStatLambdaExecutionRole`
3. Click **"Add permissions"** → **"Create inline policy"**
4. Click **"JSON"** tab and paste:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:PutItem"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/world_domination_metrics"
    }
  ]
}
```
5. Click **"Review policy"**
6. Name: `DynamoDBWritePolicy`
7. Click **"Create policy"**

**OR** attach the managed policy: `AmazonDynamoDBFullAccess` (less secure, but simpler)

### Step 2: Create New Lambda Function

1. Go to [AWS Lambda Console](https://console.aws.amazon.com/lambda/)
2. Click **"Create function"**
3. Choose **"Author from scratch"**
4. Configure:
   - **Function name**: `wdstat-world-domination-metrics-create`
   - **Runtime**: `Node.js 20.x`
   - **Architecture**: `x86_64`
   - **Execution role**: Select existing role `WDStatLambdaExecutionRole` (or create new one)
5. Click **"Create function"**

### Step 3: Upload Code

1. In the function page, scroll to **"Code source"** section
2. Click **"Upload from"** → **".zip file"**
3. Upload `function.zip` (from `backend/function.zip`)
4. Click **"Save"**

### Step 4: Configure Handler

1. Go to **"Runtime settings"** → Click **"Edit"**
2. **Handler**: `functions/world-domination-metrics-create.handler`
   > **Note**: Include `functions/` prefix!
3. Click **"Save"**

### Step 5: Set Environment Variables

1. Go to **"Configuration"** tab → **"Environment variables"**
2. Click **"Edit"**
3. Add:
   - Key: `WDM_TABLE`, Value: `world_domination_metrics`
   - **Do NOT set `AWS_REGION`** - Lambda provides this automatically!
4. Click **"Save"**

### Step 6: Create Function URL

1. Go to **"Configuration"** tab → **"Function URL"**
2. Click **"Create function URL"**
3. Configure:
   - **Auth type**: `NONE` (for public access)
   - **Configure CORS**: ✅ Check this box
     - **Allow origins**: `*` (or your specific domain)
     - **Allow methods**: Select `POST` and `OPTIONS`
     - **Allow headers**: `Content-Type`
     - **Max age**: `86400` (optional)
4. Click **"Save"**
5. **Copy the Function URL** - you'll need this!

## Method 2: Using AWS CLI

### Step 1: Update IAM Role (if needed)

If your role doesn't have `PutItem` permission, update it:

```bash
# Attach DynamoDB full access (or create custom policy)
aws iam attach-role-policy \
    --role-name WDStatLambdaExecutionRole \
    --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess
```

### Step 2: Create Lambda Function

```bash
cd backend

# Create the function
aws lambda create-function \
    --function-name wdstat-world-domination-metrics-create \
    --runtime nodejs20.x \
    --role arn:aws:iam::YOUR_ACCOUNT_ID:role/WDStatLambdaExecutionRole \
    --handler functions/world-domination-metrics-create.handler \
    --zip-file fileb://function.zip \
    --environment Variables="{WDM_TABLE=world_domination_metrics}" \
    --timeout 30 \
    --memory-size 256 \
    --region us-east-1
```

### Step 3: Create Function URL

```bash
aws lambda create-function-url-config \
    --function-name wdstat-world-domination-metrics-create \
    --auth-type NONE \
    --cors '{"AllowOrigins":["*"],"AllowMethods":["POST","OPTIONS"],"AllowHeaders":["Content-Type"]}' \
    --region us-east-1
```

### Step 4: Get Function URL

```bash
aws lambda get-function-url-config \
    --function-name wdstat-world-domination-metrics-create \
    --region us-east-1
```

## Method 3: Using AWS SAM (Infrastructure as Code)

The `template.yaml` has been updated to include the new function.

### Step 1: Build and Deploy

```bash
cd backend

# Build the SAM application
sam build

# Deploy (first time will ask for configuration)
sam deploy --guided

# Or deploy with existing config
sam deploy
```

This will create:
- Both Lambda functions (search and create)
- Function URLs for both
- Updated IAM role with write permissions

### Step 2: Get Function URLs

After deployment, check the outputs:

```bash
aws cloudformation describe-stacks \
    --stack-name wdstat-backend \
    --query 'Stacks[0].Outputs' \
    --region us-east-1
```

## Testing the Create Endpoint

### Test via Function URL

```bash
# Replace with your actual Function URL
curl -X POST https://YOUR_FUNCTION_URL.lambda-url.us-east-1.on.aws \
  -H "Content-Type: application/json" \
  -d '{
    "WDM_ID": "120120301238",
    "WDM_playing_as": "CAN",
    "WDM_record_game_date": "1940-08-21",
    "WDM_start_wd_game_date": "1939-12-01"
  }'
```

### Test via AWS Console

1. Go to Lambda function → **"Test"** tab
2. Create a test event:
```json
{
  "httpMethod": "POST",
  "body": "{\"WDM_ID\":\"120120301238\",\"WDM_playing_as\":\"CAN\",\"WDM_record_game_date\":\"1940-08-21\",\"WDM_start_wd_game_date\":\"1939-12-01\"}"
}
```
3. Click **"Test"** and check the response

### Expected Success Response

```json
{
  "success": true,
  "message": "World domination metrics record created successfully",
  "data": {
    "WDM_ID": "120120301238",
    "WDM_playing_as": "CAN",
    "WDM_record_game_date": "1940-08-21",
    "WDM_start_wd_game_date": "1939-12-01",
    "WDM_Create_datetime": "2024-01-01T12:00:00.000Z",
    "WDM_Update_datetime": "2024-01-01T12:00:00.000Z"
  }
}
```

## Troubleshooting

### Error: "AccessDeniedException: User is not authorized to perform: dynamodb:PutItem"

**Solution**: Update IAM role to include `PutItem` permission (see Step 1 of Method 1)

### Error: "Handler not found"

**Solution**: Make sure handler is set to `functions/world-domination-metrics-create.handler` (with `functions/` prefix)

### Error: "Cannot find module"

**Solution**: Make sure `function.zip` includes `node_modules/` directory. Rebuild with `npm run package`

### CORS Errors

**Solution**: Ensure Function URL has CORS configured with:
- Allow methods: `POST`, `OPTIONS`
- Allow headers: `Content-Type`
- Allow origins: `*` (or your specific domain)

## Next Steps

1. Update frontend to use the new create endpoint
2. Add the Function URL to your frontend `.env` file
3. Test creating records from your application

## Summary

✅ **IAM Role**: Updated with `PutItem` permission  
✅ **Lambda Function**: `wdstat-world-domination-metrics-create`  
✅ **Handler**: `functions/world-domination-metrics-create.handler`  
✅ **Environment**: `WDM_TABLE=world_domination_metrics`  
✅ **Function URL**: Created with CORS enabled  
✅ **Template**: Updated `template.yaml` for SAM deployment


