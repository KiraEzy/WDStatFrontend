# Troubleshooting 404 AccessDeniedException for Count Endpoint

## Problem
Getting `404 AccessDeniedException` when accessing the count endpoint:
```
https://kyz2mgoyhedxkbbghhe4xkj5ue0xzden.lambda-url.ap-east-1.on.aws
```

## Possible Causes & Solutions

### 1. Lambda Function Doesn't Exist or Wrong Name

**Check if function exists:**
```bash
aws lambda get-function \
    --function-name wdstat-world-domination-metrics-count \
    --region ap-east-1
```

**Solution**: Create the function if it doesn't exist (see deployment steps below)

### 2. Function URL Not Created or Wrong URL

**Check Function URL:**
```bash
aws lambda get-function-url-config \
    --function-name wdstat-world-domination-metrics-count \
    --region ap-east-1
```

**Solution**: Create Function URL if missing:
```bash
aws lambda create-function-url-config \
    --function-name wdstat-world-domination-metrics-count \
    --auth-type NONE \
    --cors '{"AllowOrigins":["*"],"AllowMethods":["GET","OPTIONS"],"AllowHeaders":["Content-Type"]}' \
    --region ap-east-1
```

### 3. Handler Path Incorrect

**Check current handler:**
```bash
aws lambda get-function-configuration \
    --function-name wdstat-world-domination-metrics-count \
    --region ap-east-1 \
    --query 'Handler'
```

**Should be**: `functions/world-domination-metrics-count.handler`

**Fix handler:**
```bash
aws lambda update-function-configuration \
    --function-name wdstat-world-domination-metrics-count \
    --handler functions/world-domination-metrics-count.handler \
    --region ap-east-1
```

### 4. Missing DynamoDB Permissions

The function needs `dynamodb:Scan` permission. Check the IAM role:

```bash
# Get the role name
aws lambda get-function-configuration \
    --function-name wdstat-world-domination-metrics-count \
    --region ap-east-1 \
    --query 'Role' \
    --output text
```

Then check if the role has Scan permission. If not, add it (see FIX_PERMISSIONS.md)

### 5. Function Code Not Uploaded

**Check if code is uploaded:**
```bash
aws lambda get-function \
    --function-name wdstat-world-domination-metrics-count \
    --region ap-east-1 \
    --query 'CodeSize'
```

If CodeSize is 0 or very small, the code wasn't uploaded properly.

**Solution**: Upload the function.zip:
```bash
cd backend
npm run package
aws lambda update-function-code \
    --function-name wdstat-world-domination-metrics-count \
    --zip-file fileb://function.zip \
    --region ap-east-1
```

### 6. Environment Variables Missing

**Check environment variables:**
```bash
aws lambda get-function-configuration \
    --function-name wdstat-world-domination-metrics-count \
    --region ap-east-1 \
    --query 'Environment.Variables'
```

**Should have**: `WDM_TABLE=world_domination_metrics`

**Fix:**
```bash
aws lambda update-function-configuration \
    --function-name wdstat-world-domination-metrics-count \
    --environment Variables="{WDM_TABLE=world_domination_metrics}" \
    --region ap-east-1
```

## Quick Fix Checklist

Run these commands to verify and fix:

```bash
# 1. Check if function exists
aws lambda get-function \
    --function-name wdstat-world-domination-metrics-count \
    --region ap-east-1

# 2. Check handler
aws lambda get-function-configuration \
    --function-name wdstat-world-domination-metrics-count \
    --region ap-east-1 \
    --query 'Handler'

# 3. Check Function URL
aws lambda get-function-url-config \
    --function-name wdstat-world-domination-metrics-count \
    --region ap-east-1

# 4. Check environment variables
aws lambda get-function-configuration \
    --function-name wdstat-world-domination-metrics-count \
    --region ap-east-1 \
    --query 'Environment.Variables'

# 5. Get the role ARN
ROLE_ARN=$(aws lambda get-function-configuration \
    --function-name wdstat-world-domination-metrics-count \
    --region ap-east-1 \
    --query 'Role' \
    --output text)

echo "Role: $ROLE_ARN"
```

## Complete Deployment (If Function Doesn't Exist)

If the function doesn't exist, create it:

```bash
cd backend

# 1. Build the package
npm run package

# 2. Create the function
aws lambda create-function \
    --function-name wdstat-world-domination-metrics-count \
    --runtime nodejs20.x \
    --role arn:aws:iam::551185773969:role/WDStatLambdaExecutionRole \
    --handler functions/world-domination-metrics-count.handler \
    --zip-file fileb://function.zip \
    --environment Variables="{WDM_TABLE=world_domination_metrics}" \
    --timeout 30 \
    --memory-size 256 \
    --region ap-east-1

# 3. Create Function URL
aws lambda create-function-url-config \
    --function-name wdstat-world-domination-metrics-count \
    --auth-type NONE \
    --cors '{"AllowOrigins":["*"],"AllowMethods":["GET","OPTIONS"],"AllowHeaders":["Content-Type"]}' \
    --region ap-east-1

# 4. Get the Function URL
aws lambda get-function-url-config \
    --function-name wdstat-world-domination-metrics-count \
    --region ap-east-1 \
    --query 'FunctionUrl' \
    --output text
```

## Test the Endpoint

After fixing, test with:

```bash
curl "https://kyz2mgoyhedxkbbghhe4xkj5ue0xzden.lambda-url.ap-east-1.on.aws"
```

Expected response:
```json
{
  "success": true,
  "data": [...],
  "summary": {...},
  "message": "World domination metrics counts retrieved successfully"
}
```

## Common Error Messages

- **404 AccessDeniedException**: Function doesn't exist, wrong URL, or handler issue
- **403 Forbidden**: IAM permissions issue (need `dynamodb:Scan`)
- **500 Internal Server Error**: Code error or missing environment variables
- **502 Bad Gateway**: Function timeout or out of memory

## Still Not Working?

1. Check CloudWatch Logs:
   ```bash
   aws logs tail /aws/lambda/wdstat-world-domination-metrics-count --follow --region ap-east-1
   ```

2. Test the function directly:
   ```bash
   aws lambda invoke \
       --function-name wdstat-world-domination-metrics-count \
       --payload '{"httpMethod":"GET","queryStringParameters":{}}' \
       --region ap-east-1 \
       response.json
   cat response.json
   ```

