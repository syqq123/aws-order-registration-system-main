// getOrders.mjs
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const TABLE_NAME = process.env.ORDERS_TABLE_NAME;

// Tworzymy klienta DynamoDB
const ddbClient = new DynamoDBClient({});
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  if (!TABLE_NAME) {
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: "ORDERS_TABLE_NAME env variable is missing" })
    };
  }

  try {
    // Pobieramy wszystkie zamówienia z tabeli (limit 50)
    const result = await ddbDocClient.send(
      new ScanCommand({ TableName: TABLE_NAME, Limit: 50 })
    );

    const items = result.Items || [];

    // Sortujemy po dacie utworzenia malejąco
    const sortedOrders = items.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type'
      },
      body: JSON.stringify({
        orders: sortedOrders,
        count: sortedOrders.length
      })
    };

  } catch (error) {
    console.error("Error fetching orders:", error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        error: "Failed to fetch orders",
        message: error.message
      })
    };
  }
};
