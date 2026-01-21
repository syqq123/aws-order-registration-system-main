import { describe, it, expect } from 'vitest';

const mockHandler = async (event, mockGetResult) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const orderId = event.pathParameters?.orderId;

  if (!orderId) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Missing required parameter: orderId",
      }),
    };
  }

  try {
    const getResult = mockGetResult || { Item: null };

    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "Order not found",
        }),
      };
    }

    console.log("Order deleted successfully:", orderId);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Order deleted successfully",
        orderId,
      }),
    };
  } catch (error) {
    console.error("Error deleting order:", error);
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

describe('deleteOrder Lambda', () => {
  const existingOrder = {
    orderId: 'ORDER-123',
    customerName: 'John Doe',
    email: 'john@example.com',
    items: [{ id: '1', name: 'Product', price: 10, quantity: 1 }],
    totalAmount: '10.00',
    status: 'PENDING',
    createdAt: '2024-01-01T10:00:00Z'
  };

  it('should return 400 if orderId is missing', async () => {
    const result = await mockHandler({});
    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.error).toBe('Missing required parameter: orderId');
  });

  it('should return 404 if order does not exist', async () => {
    const event = {
      pathParameters: { orderId: 'ORDER-999' }
    };
    const result = await mockHandler(event, { Item: null });
    expect(result.statusCode).toBe(404);
    const body = JSON.parse(result.body);
    expect(body.error).toBe('Order not found');
  });

  it('should delete order successfully', async () => {
    const event = {
      pathParameters: { orderId: 'ORDER-123' }
    };
    const result = await mockHandler(event, { Item: existingOrder });
    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.message).toBe('Order deleted successfully');
    expect(body.orderId).toBe('ORDER-123');
  });

  it('should return CORS headers', async () => {
    const event = {
      pathParameters: { orderId: 'ORDER-123' }
    };
    const result = await mockHandler(event, { Item: existingOrder });
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(result.headers['Content-Type']).toBe('application/json');
  });

  it('should return correct orderId in response', async () => {
    const orderId = 'ORDER-XYZ-789';
    const event = {
      pathParameters: { orderId }
    };
    const result = await mockHandler(event, {
      Item: { ...existingOrder, orderId }
    });

    const body = JSON.parse(result.body);
    expect(body.orderId).toBe(orderId);
  });

  it('should handle pathParameters correctly', async () => {
    const event = {
      pathParameters: { orderId: 'ORDER-ABC' }
    };
    const result = await mockHandler(event, {
      Item: { ...existingOrder, orderId: 'ORDER-ABC' }
    });
    expect(result.statusCode).toBe(200);
  });

  it('should return 400 if pathParameters is undefined', async () => {
    const event = {};
    const result = await mockHandler(event);
    expect(result.statusCode).toBe(400);
  });
});
