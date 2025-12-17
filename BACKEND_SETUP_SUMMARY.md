# Backend Setup Summary

## ✅ What Was Updated

Your backend has been configured for the `world_domination_metrics` database schema.

### Database Schema

**Table Name**: `world_domination_metrics`

**Primary Key**: `WDM_ID` (String)

**Attributes**:
- `WDM_ID` - Unique identifier (Primary Key)
- `WDM_playing_as` - Country code (CAN, USA, GER, SOV, UK, JAP, ITA, FRA)
- `WDM_record_game_date` - Game date (YYYY-MM-DD format)
- `WDM_start_wd_game_date` - Game start date
- `WDM_Update_datetime` - Last update timestamp (ISO 8601)
- `WDM_Create_datetime` - Creation timestamp (ISO 8601)

### Files Created/Updated

#### Backend Files
1. **`backend/functions/world-domination-metrics.js`** - Lambda handler for metrics API
2. **`backend/template.yaml`** - AWS SAM template for infrastructure
3. **`backend/lambda-policy.json`** - IAM policy for Lambda
4. **`backend/SETUP.md`** - Comprehensive setup guide
5. **`backend/QUICKSTART.md`** - Quick reference guide
6. **`backend/scripts/seed-data.js`** - Sample data seeder (8 game records)
7. **`backend/scripts/deploy.sh`** - Deployment automation
8. **`backend/scripts/test-lambda.js`** - Lambda testing script
9. **`backend/package.json`** - Updated with new scripts

#### Frontend Files
10. **`frontend/src/services/api.js`** - Updated with metrics endpoints

#### Documentation
11. **`README.md`** - Updated with correct schema and endpoints

## 🚀 Next Steps (In Order)

### 1. Create DynamoDB Table

**Option A: AWS Console** (Easiest)
- Go to [DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
- Click "Create table"
- Table name: `world_domination_metrics`
- Partition key: `WDM_ID` (String)
- Settings: On-demand
- Click "Create table"

**Option B: AWS CLI**
```bash
aws dynamodb create-table \
    --table-name world_domination_metrics \
    --attribute-definitions AttributeName=WDM_ID,AttributeType=S \
    --key-schema AttributeName=WDM_ID,KeyType=HASH \
    --billing-mode ON_DEMAND
```

### 2. Create IAM Role

- Go to [IAM Console](https://console.aws.amazon.com/iam/)
- Create role → Lambda
- Attach policy: **AmazonDynamoDBReadOnlyAccess**
- Role name: `WDStatLambdaExecutionRole`
- **Copy the Role ARN**

### 3. Deploy Lambda Function

```bash
cd backend
npm install
npm run package
```

Then in AWS Lambda Console:
- Create function: `wdstat-world-domination-metrics`
- Runtime: Node.js 20.x
- Upload `function.zip`
- Handler: `world-domination-metrics.handler`
- Set environment variables:
  - `WDM_TABLE=world_domination_metrics`
  - `AWS_REGION=us-east-1`
- Create Function URL (Auth: NONE, Enable CORS)
- **Copy the Function URL**

### 4. Seed Sample Data

```bash
cd backend
export WDM_TABLE=world_domination_metrics
export AWS_REGION=us-east-1
npm run seed
```

This will add 8 sample game records (CAN, USA, GER, SOV, UK, JAP, ITA, FRA).

### 5. Test Lambda

```bash
export LAMBDA_FUNCTION_NAME=wdstat-world-domination-metrics
npm run test-lambda
```

Or test via URL:
```bash
curl "https://YOUR_FUNCTION_URL/?WDM_playing_as=CAN"
```

### 6. Update Frontend

Create `frontend/.env`:
```env
REACT_APP_API_BASE_URL=https://YOUR_FUNCTION_URL.lambda-url.us-east-1.on.aws
```

## 📚 Documentation

- **Quick Start**: `backend/QUICKSTART.md` - 5-minute setup guide
- **Full Setup**: `backend/SETUP.md` - Detailed instructions with troubleshooting
- **Project README**: `README.md` - Updated with new schema

## 🔍 API Examples

### Get all metrics
```bash
GET https://YOUR_FUNCTION_URL/
```

### Filter by country
```bash
GET https://YOUR_FUNCTION_URL/?WDM_playing_as=CAN
```

### Get specific record
```bash
GET https://YOUR_FUNCTION_URL/?WDM_ID=120120301230
```

### Filter by date range
```bash
GET https://YOUR_FUNCTION_URL/?startDate=1940-01-01&endDate=1945-12-31
```

## 📦 NPM Scripts Available

```bash
npm run package      # Create deployment ZIP
npm run deploy       # Deploy to AWS (requires AWS CLI)
npm run seed         # Populate sample data
npm run test-lambda  # Test Lambda function
```

## ✅ Checklist

- [ ] DynamoDB table created
- [ ] IAM role created with correct permissions
- [ ] Lambda function deployed
- [ ] Function URL created and copied
- [ ] Environment variables configured
- [ ] Sample data seeded
- [ ] Lambda tested successfully
- [ ] Frontend `.env` updated
- [ ] Frontend restarted to load new env vars

## 🆘 Need Help?

1. **Quick reference**: See `backend/QUICKSTART.md`
2. **Detailed guide**: See `backend/SETUP.md`
3. **Troubleshooting**: See SETUP.md "Troubleshooting" section

## 📝 Sample Data Included

The seed script includes 8 game records:
- Canada (CAN) - 1940-08-21
- United States (USA) - 1941-12-07
- Germany (GER) - 1942-06-15
- Soviet Union (SOV) - 1943-02-02
- United Kingdom (UK) - 1940-05-10
- Japan (JAP) - 1941-12-07
- Italy (ITA) - 1940-06-10
- France (FRA) - 1940-06-22

---

**Ready to deploy!** Start with Step 1 above or see `backend/QUICKSTART.md` for the fastest path.

