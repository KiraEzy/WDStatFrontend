# Fix IAM Permissions for Lambda Functions

## Problem 1: Create Endpoint - Missing PutItem Permission

Your Lambda function role doesn't have permission to write to DynamoDB. The error shows:
```
User: arn:aws:sts::551185773969:assumed-role/wdstat-world-domination-metrics-create-role-vkw56okp/wdstat-world-domination-metrics-create is not authorized to perform: dynamodb:PutItem
```

## Problem 2: Search Endpoint - Missing Scan Permission

Your Lambda function role doesn't have permission to scan DynamoDB. The error shows:
```
User: arn:aws:sts::551185773969:assumed-role/wdstat-world-domination-metrics-role-avcl3y0t/wdstat-world-domination-metrics is not authorized to perform: dynamodb:Scan
```

## Solution: Add Required DynamoDB Permissions

### Fix 1: Create Endpoint - Add PutItem Permission

#### Method 1: Using AWS Console (Easiest)

1. **Go to IAM Console**
   - Navigate to [IAM Roles](https://console.aws.amazon.com/iam/home#/roles)
   - Search for: `wdstat-world-domination-metrics-create-role-vkw56okp`
   - Click on the role name

2. **Add Inline Policy**
   - Click **"Add permissions"** → **"Create inline policy"**
   - Click **"JSON"** tab
   - Paste this policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "dynamodb:PutItem"
         ],
         "Resource": "arn:aws:dynamodb:ap-east-1:551185773969:table/world_domination_metrics"
       }
     ]
   }
   ```
   > **Note**: Replace `ap-east-1` with your actual region if different
   > **Note**: Replace `551185773969` with your account ID if needed

3. **Review and Create**
   - Click **"Review policy"**
   - Name: `DynamoDBPutItemPolicy`
   - Click **"Create policy"**

### Fix 2: Search Endpoint - Add Scan, Query, and GetItem Permissions

#### Method 1: Using AWS Console (Easiest)

1. **Go to IAM Console**
   - Navigate to [IAM Roles](https://console.aws.amazon.com/iam/home#/roles)
   - Search for: `wdstat-world-domination-metrics-role-avcl3y0t`
   - Click on the role name

2. **Add Inline Policy**
   - Click **"Add permissions"** → **"Create inline policy"**
   - Click **"JSON"** tab
   - Paste this policy:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "dynamodb:Scan",
           "dynamodb:Query",
           "dynamodb:GetItem"
         ],
         "Resource": "arn:aws:dynamodb:ap-east-1:551185773969:table/world_domination_metrics"
       }
     ]
   }
   ```

3. **Review and Create**
   - Click **"Review policy"**
   - Name: `DynamoDBReadPolicy`
   - Click **"Create policy"**

#### Method 2: Using AWS CLI

**For Create Endpoint (PutItem):**
```bash
aws iam put-role-policy \
    --role-name wdstat-world-domination-metrics-create-role-vkw56okp \
    --policy-name DynamoDBPutItemPolicy \
    --policy-document '{
      "Version": "2012-10-17",
      "Statement": [{
        "Effect": "Allow",
        "Action": ["dynamodb:PutItem"],
        "Resource": "arn:aws:dynamodb:ap-east-1:551185773969:table/world_domination_metrics"
      }]
    }' \
    --region ap-east-1
```

**For Search Endpoint (Scan, Query, GetItem):**
```bash
aws iam put-role-policy \
    --role-name wdstat-world-domination-metrics-role-avcl3y0t \
    --policy-name DynamoDBReadPolicy \
    --policy-document '{
      "Version": "2012-10-17",
      "Statement": [{
        "Effect": "Allow",
        "Action": ["dynamodb:Scan", "dynamodb:Query", "dynamodb:GetItem"],
        "Resource": "arn:aws:dynamodb:ap-east-1:551185773969:table/world_domination_metrics"
      }]
    }' \
    --region ap-east-1
```

### Method 3: Attach Managed Policy (Quick but Less Secure)

If you want a quick fix with broader permissions for both functions:

**For Create Endpoint:**
```bash
aws iam attach-role-policy \
    --role-name wdstat-world-domination-metrics-create-role-vkw56okp \
    --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess \
    --region ap-east-1
```

**For Search Endpoint:**
```bash
aws iam attach-role-policy \
    --role-name wdstat-world-domination-metrics-role-avcl3y0t \
    --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess \
    --region ap-east-1
```

Or via Console:
1. Go to IAM → Roles → `wdstat-world-domination-metrics-create-role-vkw56okp` (or `wdstat-world-domination-metrics-role-avcl3y0t`)
2. Click **"Add permissions"** → **"Attach policies"**
3. Search for: `AmazonDynamoDBFullAccess`
4. Check the box and click **"Add permissions"**

## Verify the Fixes

**Test Create Endpoint:**
```bash
curl -X POST https://YOUR_CREATE_FUNCTION_URL.lambda-url.ap-east-1.on.aws \
  -H "Content-Type: application/json" \
  -d '{
    "WDM_ID": "120120301238",
    "WDM_playing_as": "CAN",
    "WDM_record_game_date": "1940-08-21",
    "WDM_start_wd_game_date": "1939-12-01"
  }'
```
You should get a `201 Created` response.

**Test Search Endpoint:**
```bash
curl "https://YOUR_SEARCH_FUNCTION_URL.lambda-url.ap-east-1.on.aws?WDM_playing_as=CAN"
```
You should get a `200 OK` response with data.

## Important Notes

- **Region**: Your table is in `ap-east-1` (Asia Pacific Hong Kong). Make sure the policy resource ARN matches your region.
- **Account ID**: The account ID in the error is `551185773969`. Use this in your policy if creating manually.
- **Table Name**: Ensure the table name in the resource ARN matches: `world_domination_metrics`

## Alternative: Use a Wildcard Resource (Less Secure)

If you want to allow PutItem on any DynamoDB table (not recommended for production):

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

This allows the action on the `world_domination_metrics` table in any region and account (if the role is used there).

