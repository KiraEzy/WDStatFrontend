import { LambdaClient, InvokeCommand } from "@aws-sdk/client-lambda";

const client = new LambdaClient({ region: process.env.AWS_REGION || "us-east-1" });
const FUNCTION_NAME = process.env.LAMBDA_FUNCTION_NAME || "wdstat-attendance-search";

async function testLambda() {
  const testEvent = {
    httpMethod: "GET",
    queryStringParameters: {
      date: "2024-01-01",
      department: "Engineering"
    }
  };

  try {
    console.log(`Testing Lambda function: ${FUNCTION_NAME}`);
    console.log("Test event:", JSON.stringify(testEvent, null, 2));

    const command = new InvokeCommand({
      FunctionName: FUNCTION_NAME,
      Payload: JSON.stringify(testEvent)
    });

    const response = await client.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.Payload));

    console.log("\n=== Lambda Response ===");
    console.log("Status Code:", response.StatusCode);
    console.log("Response:", JSON.stringify(result, null, 2));

    if (result.errorMessage) {
      console.error("\nError:", result.errorMessage);
      console.error("Stack:", result.stackTrace);
    }
  } catch (error) {
    console.error("Test failed:", error.message);
  }
}

testLambda();

