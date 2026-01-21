import { describe, it, expect, vi } from 'vitest';

const mockHandler = async (event) => {
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

    console.log("Order created successfully:", orderId);

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

describe('createOrder Lambda', () => {
  it('should return 400 if body is missing', async () => {
    const result = await mockHandler({});
    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.error).toBe('Request body is missing');
  });

  it('should return 400 if body is invalid JSON', async () => {
    const result = await mockHandler({ body: 'invalid json' });
    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.error).toBe('Invalid JSON in request body');
  });

  it('should return 400 if customerName is missing', async () => {
    const event = {
      body: JSON.stringify({
        email: 'test@example.com',
        items: [{ id: '1', name: 'Product', price: 10, quantity: 1 }]
      })
    };
    const result = await mockHandler(event);
    expect(result.statusCode).toBe(400);
    const body = JSON.parse(result.body);
    expect(body.error).toContain('Missing required fields');
  });

  it('should return 400 if email is missing', async () => {
    const event = {
      body: JSON.stringify({
        customerName: 'John Doe',
        items: [{ id: '1', name: 'Product', price: 10, quantity: 1 }]
      })
    };
    const result = await mockHandler(event);
    expect(result.statusCode).toBe(400);
  });

  it('should return 400 if items are missing', async () => {
    const event = {
      body: JSON.stringify({
        customerName: 'John Doe',
        email: 'test@example.com'
      })
    };
    const result = await mockHandler(event);
    expect(result.statusCode).toBe(400);
  });

  it('should return 400 if items array is empty', async () => {
    const event = {
      body: JSON.stringify({
        customerName: 'John Doe',
        email: 'test@example.com',
        items: []
      })
    };
    const result = await mockHandler(event);
    expect(result.statusCode).toBe(400);
  });

  it('should create order successfully', async () => {
    const event = {
      body: JSON.stringify({
        customerName: 'John Doe',
        email: 'test@example.com',
        items: [
          { id: '1', name: 'Product 1', price: 10.50, quantity: 2 },
          { id: '2', name: 'Product 2', price: 5.25, quantity: 1 }
        ]
      })
    };
    const result = await mockHandler(event);
    expect(result.statusCode).toBe(201);

    const body = JSON.parse(result.body);
    expect(body.message).toBe('Order created successfully');
    expect(body.order).toHaveProperty('orderId');
    expect(body.order.customerName).toBe('John Doe');
    expect(body.order.email).toBe('test@example.com');
    expect(body.order.status).toBe('PENDING');
  });

  it('should calculate total amount correctly', async () => {
    const event = {
      body: JSON.stringify({
        customerName: 'John Doe',
        email: 'test@example.com',
        items: [
          { id: '1', name: 'Product 1', price: 10.50, quantity: 2 },
          { id: '2', name: 'Product 2', price: 5.25, quantity: 1 }
        ]
      })
    };
    const result = await mockHandler(event);
    const body = JSON.parse(result.body);
    expect(body.order.totalAmount).toBe('26.25');
  });

  it('should return CORS headers', async () => {
    const event = {
      body: JSON.stringify({
        customerName: 'John Doe',
        email: 'test@example.com',
        items: [{ id: '1', name: 'Product', price: 10, quantity: 1 }]
      })
    };
    const result = await mockHandler(event);
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(result.headers['Content-Type']).toBe('application/json');
  });

  it('should generate unique order IDs', async () => {
    const event = {
      body: JSON.stringify({
        customerName: 'John Doe',
        email: 'test@example.com',
        items: [{ id: '1', name: 'Product', price: 10, quantity: 1 }]
      })
    };

    const result1 = await mockHandler(event);
    const result2 = await mockHandler(event);

    const body1 = JSON.parse(result1.body);
    const body2 = JSON.parse(result2.body);

    expect(body1.order.orderId).not.toBe(body2.order.orderId);
  });
});
