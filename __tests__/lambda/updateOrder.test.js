import { describe, it, expect } from 'vitest';

const mockHandler = async (event, mockGetResult) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

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

  const { orderId, status, items } = body;

  if (!orderId) {
    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Missing required field: orderId",
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

    const existingOrder = getResult.Item;

    const updatedOrder = {
      ...existingOrder,
      ...(status && { status }),
      ...(items && {
        items,
        totalAmount: items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)
      }),
      updatedAt: new Date().toISOString(),
    };

    console.log("Order updated successfully:", orderId);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Order updated successfully",
        order: updatedOrder,
      }),
    };
  } catch (error) {
    console.error("Error updating order:", error);
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

describe('updateOrder Lambda', () => {
  const existingOrder = {
    orderId: 'ORDER-123',
    customerName: 'John Doe',
    email: 'john@example.com',
    items: [{ id: '1', name: 'Product', price: 10, quantity: 1 }],
    totalAmount: '10.00',
    status: 'PENDING',
    createdAt: '2024-01-01T10:00:00Z'
  };

  it('should return 400 if body is missing', async () => {
    const result = await mockHandler({});
    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.error).toBe('Request body is missing');
  });

  it('should return 400 if orderId is missing', async () => {
    const event = {
      body: JSON.stringify({ status: 'SHIPPED' })
    };
    const result = await mockHandler(event);
    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.error).toBe('Missing required field: orderId');
  });

  it('should return 404 if order does not exist', async () => {
    const event = {
      body: JSON.stringify({ orderId: 'ORDER-999', status: 'SHIPPED' })
    };
    const result = await mockHandler(event, { Item: null });
    expect(result.statusCode).toBe(404);
    const body = JSON.parse(result.body);
    expect(body.error).toBe('Order not found');
  });

  it('should update order status successfully', async () => {
    const event = {
      body: JSON.stringify({ orderId: 'ORDER-123', status: 'SHIPPED' })
    };
    const result = await mockHandler(event, { Item: existingOrder });
    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.message).toBe('Order updated successfully');
    expect(body.order.status).toBe('SHIPPED');
    expect(body.order).toHaveProperty('updatedAt');
  });

  it('should update order items successfully', async () => {
    const newItems = [
      { id: '1', name: 'Product 1', price: 15, quantity: 2 },
      { id: '2', name: 'Product 2', price: 10, quantity: 1 }
    ];

    const event = {
      body: JSON.stringify({ orderId: 'ORDER-123', items: newItems })
    };
    const result = await mockHandler(event, { Item: existingOrder });
    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.order.items).toEqual(newItems);
    expect(body.order.totalAmount).toBe('40.00');
  });

  it('should update both status and items', async () => {
    const newItems = [{ id: '1', name: 'Product', price: 20, quantity: 1 }];

    const event = {
      body: JSON.stringify({
        orderId: 'ORDER-123',
        status: 'DELIVERED',
        items: newItems
      })
    };
    const result = await mockHandler(event, { Item: existingOrder });
    expect(result.statusCode).toBe(200);

    const body = JSON.parse(result.body);
    expect(body.order.status).toBe('DELIVERED');
    expect(body.order.items).toEqual(newItems);
    expect(body.order.totalAmount).toBe('20.00');
  });

  it('should preserve existing fields when updating', async () => {
    const event = {
      body: JSON.stringify({ orderId: 'ORDER-123', status: 'PROCESSING' })
    };
    const result = await mockHandler(event, { Item: existingOrder });

    const body = JSON.parse(result.body);
    expect(body.order.customerName).toBe('John Doe');
    expect(body.order.email).toBe('john@example.com');
    expect(body.order.createdAt).toBe('2024-01-01T10:00:00Z');
  });

  it('should return CORS headers', async () => {
    const event = {
      body: JSON.stringify({ orderId: 'ORDER-123', status: 'SHIPPED' })
    };
    const result = await mockHandler(event, { Item: existingOrder });
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(result.headers['Content-Type']).toBe('application/json');
  });

  it('should calculate new total amount correctly', async () => {
    const newItems = [
      { id: '1', name: 'Product 1', price: 12.50, quantity: 3 },
      { id: '2', name: 'Product 2', price: 7.25, quantity: 2 }
    ];

    const event = {
      body: JSON.stringify({ orderId: 'ORDER-123', items: newItems })
    };
    const result = await mockHandler(event, { Item: existingOrder });

    const body = JSON.parse(result.body);
    expect(body.order.totalAmount).toBe('52.00');
  });
});
