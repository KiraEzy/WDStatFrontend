# Quick Start Guide - Backend Setup

## 🚀 5-Minute Setup

### 1. Create DynamoDB Table

**Using AWS Console:**
- Go to DynamoDB Console
- Create table: `world_domination_metrics`
- Partition key: `WDM_ID` (String)
- Billing: On-demand
- Click Create

**Or use AWS CLI:**
```bash
aws dynamodb create-table \
    --table-name world_domination_metrics \
    --attribute-definitions AttributeName=WDM_ID,AttributeType=S \
    --key-schema AttributeName=WDM_ID,KeyType=HASH \
    --billing-mode ON_DEMAND
```

### 2. Create IAM Role

- Go to IAM Console → Roles → Create Role
- Select "Lambda" service
- Attach policy: `lambda-policy.json` (or use DynamoDBReadOnlyAccess)
- Name: `WDStatLambdaExecutionRole`
- Copy the Role ARN

### 3. Deploy Lambda Function

**Option A: Using AWS Console**
1. Create function: `wdstat-world-domination-metrics`
2. Runtime: Node.js 20.x
3. Upload ZIP:
   ```bash
   cd backend
   npm run package
   # Upload function.zip via console
   ```
4. Configure handler: `world-domination-metrics.handler`
5. Set environment variable:
   - Key: `WDM_TABLE`, Value: `world_domination_metrics`
   - **Don't set AWS_REGION** - it's automatically provided!
6. Create Function URL:
   - Auth: NONE
   - CORS: Check "Configure CORS"
   - Allow methods: GET, POST, OPTION (note: "OPTION" singular in AWS Console)
7. **Copy the Function URL!**

**Option B: Using AWS SAM**
```bash
cd backend
sam build
sam deploy --guided
```

### 4. Seed Sample Data

```bash
# Windows PowerShell
$env:WDM_TABLE="world_domination_metrics"
$env:AWS_REGION="us-east-1"
npm run seed

# Or Linux/Mac
export WDM_TABLE=world_domination_metrics
export AWS_REGION=us-east-1
npm run seed
```

### 5. Test Lambda

```bash
# Windows PowerShell
$env:LAMBDA_FUNCTION_NAME="wdstat-world-domination-metrics"
npm run test-lambda

# Or Linux/Mac
export LAMBDA_FUNCTION_NAME=wdstat-world-domination-metrics
npm run test-lambda
```

Or test via Function URL:
```bash
curl "https://YOUR_FUNCTION_URL.lambda-url.us-east-1.on.aws/?WDM_playing_as=CAN"
```

### 6. Update Frontend

Add to `frontend/.env`:
```env
REACT_APP_API_BASE_URL=https://YOUR_FUNCTION_URL.lambda-url.us-east-1.on.aws
```

## 📋 Checklist

- [ ] DynamoDB table `world_domination_metrics` created and active
- [ ] IAM role `WDStatLambdaExecutionRole` created with DynamoDB permissions
- [ ] Lambda function `wdstat-world-domination-metrics` deployed
- [ ] Function URL created and copied
- [ ] Environment variables set (`WDM_TABLE`, `AWS_REGION`)
- [ ] Sample data seeded (8 sample records)
- [ ] Lambda tested successfully
- [ ] Frontend `.env` file updated with API URL

## 🔗 Database Schema

```json
{
  "WDM_ID": "120120301230",
  "WDM_playing_as": "CAN",
  "WDM_record_game_date": "1940-08-21",
  "WDM_start_wd_game_date": "1939-12-01",
  "WDM_Update_datetime": "2024-01-01T09:00:00Z",
  "WDM_Create_datetime": "2024-01-01T09:00:00Z"
}
```

## 🎯 Next Steps

See `SETUP.md` for detailed instructions and troubleshooting.

## 📦 Available NPM Scripts

```bash
npm run package      # Create function.zip for deployment
npm run deploy       # Deploy to Lambda (requires AWS CLI configured)
npm run seed         # Populate DynamoDB with sample game data
npm run test-lambda  # Test Lambda function
```
