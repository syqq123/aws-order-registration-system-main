export const handler = async (event) => {
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
