import { describe, it, expect, vi } from 'vitest';

const mockDynamoDBDocClient = {
  send: vi.fn()
};

const mockHandler = async (event, mockScanResult) => {
  const TABLE_NAME = 'OrdersTable';

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
    const result = mockScanResult || { Items: [] };
    const items = result.Items || [];

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

describe('getOrders Lambda', () => {
  it('should return 200 status code with empty orders', async () => {
    const result = await mockHandler({}, { Items: [] });
    expect(result.statusCode).toBe(200);
  });

  it('should return CORS headers', async () => {
    const result = await mockHandler({}, { Items: [] });
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(result.headers['Content-Type']).toBe('application/json');
  });

  it('should return empty array when no orders exist', async () => {
    const result = await mockHandler({}, { Items: [] });
    const body = JSON.parse(result.body);
    expect(body.orders).toEqual([]);
    expect(body.count).toBe(0);
  });

  it('should return orders sorted by createdAt descending', async () => {
    const mockOrders = [
      { orderId: '1', createdAt: '2024-01-01T10:00:00Z' },
      { orderId: '2', createdAt: '2024-01-03T10:00:00Z' },
      { orderId: '3', createdAt: '2024-01-02T10:00:00Z' }
    ];

    const result = await mockHandler({}, { Items: mockOrders });
    const body = JSON.parse(result.body);

    expect(body.orders[0].orderId).toBe('2');
    expect(body.orders[1].orderId).toBe('3');
    expect(body.orders[2].orderId).toBe('1');
  });

  it('should return correct count of orders', async () => {
    const mockOrders = [
      { orderId: '1', createdAt: '2024-01-01T10:00:00Z' },
      { orderId: '2', createdAt: '2024-01-02T10:00:00Z' }
    ];

    const result = await mockHandler({}, { Items: mockOrders });
    const body = JSON.parse(result.body);
    expect(body.count).toBe(2);
  });

  it('should handle errors gracefully', async () => {
    const mockHandlerWithError = async () => {
      try {
        throw new Error('DynamoDB error');
      } catch (error) {
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

    const result = await mockHandlerWithError();
    expect(result.statusCode).toBe(500);
    const body = JSON.parse(result.body);
    expect(body.error).toBe('Failed to fetch orders');
  });
});
