# Fix Forbidden Error for Count Endpoint

## Problem
Getting `{"Message":"Forbidden"}` (403) when accessing:
```
https://kyz2mgoyhedxkbbghhe4xkj5ue0xzden.lambda-url.ap-east-1.on.aws
```

This means the function exists, but the IAM role doesn't have DynamoDB permissions.

## Solution: Add DynamoDB Scan Permission

### Method 1: Using AWS Console (Easiest)

1. **Find the Lambda Function Role**
   - Go to [Lambda Console](https://console.aws.amazon.com/lambda/)
   - Click on function: `wdstat-world-domination-metrics-count`
   - Go to **"Configuration"** tab → **"Permissions"**
   - Click on the **Execution role** link (it will be something like `wdstat-world-domination-metrics-count-role-xxxxx`)

2. **Add Inline Policy**
   - In the IAM role page, click **"Add permissions"** → **"Create inline policy"**
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

### Method 2: Using AWS CLI

**Step 1: Get the Role Name**
```bash
ROLE_NAME=$(aws lambda get-function-configuration \
    --function-name wdstat-world-domination-metrics-count \
    --region ap-east-1 \
    --query 'Role' \
    --output text | awk -F'/' '{print $NF}')

echo "Role name: $ROLE_NAME"
```

**Step 2: Add Inline Policy**
```bash
aws iam put-role-policy \
    --role-name $ROLE_NAME \
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

```bash
# Get the role name
ROLE_NAME=$(aws lambda get-function-configuration \
    --function-name wdstat-world-domination-metrics-count \
    --region ap-east-1 \
    --query 'Role' \
    --output text | awk -F'/' '{print $NF}')

# Attach full DynamoDB access
aws iam attach-role-policy \
    --role-name $ROLE_NAME \
    --policy-arn arn:aws:iam::aws:policy/AmazonDynamoDBFullAccess \
    --region ap-east-1
```

Or via Console:
1. Go to IAM → Roles → Find your count function's role
2. Click **"Add permissions"** → **"Attach policies"**
3. Search for: `AmazonDynamoDBFullAccess`
4. Check the box and click **"Add permissions"**

## Verify the Fix

After adding permissions, wait a few seconds for IAM to propagate, then test:

```bash
curl "https://kyz2mgoyhedxkbbghhe4xkj5ue0xzden.lambda-url.ap-east-1.on.aws"
```

You should now get a successful response:
```json
{
  "success": true,
  "data": [
    { "WDM_playing_as": "CAN", "count": 5 },
    ...
  ],
  "summary": {
    "total_records": 10,
    "total_countries": 3,
    ...
  },
  "message": "World domination metrics counts retrieved successfully"
}
```

## Quick PowerShell Command

If you're using PowerShell, here's a one-liner to get the role name:

```powershell
$roleArn = (aws lambda get-function-configuration --function-name wdstat-world-domination-metrics-count --region ap-east-1 --query 'Role' --output text)
$roleName = $roleArn.Split('/')[-1]
Write-Host "Role name: $roleName"
```

Then use that role name in the IAM policy commands above.

## Troubleshooting

### Still Getting Forbidden?

1. **Check IAM Policy Propagation**: Wait 10-30 seconds after adding the policy
2. **Verify Resource ARN**: Make sure the table ARN in the policy matches your actual table
3. **Check CloudWatch Logs**: 
   ```bash
   aws logs tail /aws/lambda/wdstat-world-domination-metrics-count --follow --region ap-east-1
   ```
4. **Test Function Directly**:
   ```bash
   aws lambda invoke \
       --function-name wdstat-world-domination-metrics-count \
       --payload '{"httpMethod":"GET","queryStringParameters":{}}' \
       --region ap-east-1 \
       response.json
   cat response.json
   ```

### Alternative: Use Existing Role

If you have the `WDStatLambdaExecutionRole` with proper permissions, you can update the function to use it:

```bash
aws lambda update-function-configuration \
    --function-name wdstat-world-domination-metrics-count \
    --role arn:aws:iam::551185773969:role/WDStatLambdaExecutionRole \
    --region ap-east-1
```

This will use the same role as your other functions (which should already have the permissions).

