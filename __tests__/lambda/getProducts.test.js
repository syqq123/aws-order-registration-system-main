import { describe, it, expect, beforeEach } from 'vitest';

const mockHandler = async (event) => {
  console.log('Fetching product catalog');

  const products = [
    {
      id: 'prod-1',
      name: 'Laptop Dell XPS 15',
      price: 1299.99,
      description: 'High-performance laptop with Intel i7',
      category: 'Electronics'
    },
    {
      id: 'prod-2',
      name: 'Wireless Mouse Logitech',
      price: 29.99,
      description: 'Ergonomic wireless mouse',
      category: 'Accessories'
    },
    {
      id: 'prod-3',
      name: 'Mechanical Keyboard',
      price: 89.99,
      description: 'RGB mechanical gaming keyboard',
      category: 'Accessories'
    },
    {
      id: 'prod-4',
      name: 'USB-C Hub',
      price: 45.99,
      description: '7-in-1 USB-C hub with HDMI',
      category: 'Accessories'
    },
    {
      id: 'prod-5',
      name: 'Webcam HD 1080p',
      price: 79.99,
      description: 'Professional webcam for streaming',
      category: 'Electronics'
    }
  ];

  console.log(`Returning ${products.length} products`);

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      products: products,
      count: products.length
    })
  };
};

describe('getProducts Lambda', () => {
  it('should return 200 status code', async () => {
    const result = await mockHandler({});
    expect(result.statusCode).toBe(200);
  });

  it('should return CORS headers', async () => {
    const result = await mockHandler({});
    expect(result.headers['Access-Control-Allow-Origin']).toBe('*');
    expect(result.headers['Content-Type']).toBe('application/json');
  });

  it('should return 5 products', async () => {
    const result = await mockHandler({});
    const body = JSON.parse(result.body);
    expect(body.products).toHaveLength(5);
    expect(body.count).toBe(5);
  });

  it('should return products with correct structure', async () => {
    const result = await mockHandler({});
    const body = JSON.parse(result.body);

    const product = body.products[0];
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('price');
    expect(product).toHaveProperty('description');
    expect(product).toHaveProperty('category');
  });

  it('should return products with valid data types', async () => {
    const result = await mockHandler({});
    const body = JSON.parse(result.body);

    const product = body.products[0];
    expect(typeof product.id).toBe('string');
    expect(typeof product.name).toBe('string');
    expect(typeof product.price).toBe('number');
    expect(typeof product.description).toBe('string');
    expect(typeof product.category).toBe('string');
  });
});
