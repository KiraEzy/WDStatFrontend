#!/bin/bash

# Deployment script for Lambda functions
# Usage: ./scripts/deploy.sh [function-name]

FUNCTION_NAME=${1:-"wdstat-attendance-search"}
REGION=${AWS_REGION:-"us-east-1"}
TABLE_NAME=${ATTENDANCE_TABLE:-"attendance-table"}

echo "Deploying Lambda function: $FUNCTION_NAME"
echo "Region: $REGION"
echo "Table: $TABLE_NAME"

# Install production dependencies
echo "Installing dependencies..."
npm install --production

# Create deployment package
echo "Creating deployment package..."
zip -r function.zip . -x "*.git*" -x "*node_modules/.cache*" -x "*.zip" -x "*scripts*" -x "*SETUP.md" -x "*template.yaml" -x "*lambda-policy.json"

# Check if function exists
if aws lambda get-function --function-name $FUNCTION_NAME --region $REGION 2>/dev/null; then
    echo "Updating existing function..."
    aws lambda update-function-code \
        --function-name $FUNCTION_NAME \
        --zip-file fileb://function.zip \
        --region $REGION
    
    aws lambda update-function-configuration \
        --function-name $FUNCTION_NAME \
        --environment Variables="{ATTENDANCE_TABLE=$TABLE_NAME,AWS_REGION=$REGION}" \
        --region $REGION
else
    echo "Function does not exist. Please create it first using AWS Console or template.yaml"
    echo "Or use: aws lambda create-function --function-name $FUNCTION_NAME ..."
fi

# Cleanup
rm -f function.zip

echo "Deployment complete!"

