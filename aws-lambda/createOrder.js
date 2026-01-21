// createOrder.mjs
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const TABLE_NAME = process.env.ORDERS_TABLE_NAME;
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN;

// Klienci AWS SDK v3
const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);
const snsClient = new SNSClient({});

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  // Sprawdzenie, czy body istnieje
  if (!event.body) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Request body is missing" }),
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ error: "Invalid JSON in request body" }),
    };
  }

  if (!body.customerName || !body.email || !body.items || body.items.length === 0) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Missing required fields: customerName, email, or items",
      }),
    };
  }

  try {
    const orderId = `ORDER-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const totalAmount = body.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = {
      orderId,
      customerName: body.customerName,
      email: body.email,
      items: body.items,
      totalAmount: totalAmount.toFixed(2),
      status: "PENDING",
      createdAt: new Date().toISOString(),
    };

    // Zapis do DynamoDB
    await ddbDocClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: order,
      })
    );

    console.log("Order created successfully:", orderId);

    // Wysłanie powiadomienia SNS
    try {
      await snsClient.send(
        new PublishCommand({
          TopicArn: SNS_TOPIC_ARN,
          Subject: `New Order: ${orderId}`,
          Message: `New order received!\n\nOrder ID: ${orderId}\nCustomer: ${body.customerName}\nEmail: ${body.email}\nTotal: $${totalAmount.toFixed(
            2
          )}\nItems: ${body.items.length}\n\nStatus: PENDING`,
        })
      );
      console.log("SNS notification sent successfully");
    } catch (snsError) {
      console.error("SNS notification failed:", snsError);
    }

    return {
      statusCode: 201,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Order created successfully",
        order,
      }),
    };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Internal server error",
        message: error.message,
      }),
    };
  }
};
