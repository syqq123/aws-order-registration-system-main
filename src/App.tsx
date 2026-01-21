import { useState, useEffect } from 'react';
import { ShoppingCart, Package, AlertCircle, CheckCircle } from 'lucide-react';
import { ProductCard } from './components/ProductCard';
import { Cart } from './components/Cart';
import { CheckoutForm } from './components/CheckoutForm';
import { OrdersList } from './components/OrdersList';
import { EditOrderModal } from './components/EditOrderModal';
import { api, Product, OrderItem, Order } from './services/api';

type View = 'products' | 'orders';

function App() {
  const [view, setView] = useState<View>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (view === 'orders') {
      loadOrders();
    }
  }, [view]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products. Check if AWS API Gateway is configured.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setOrdersLoading(true);
      setError(null);
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      setError('Failed to load orders. Check if AWS services are running.');
      console.error(err);
    } finally {
      setOrdersLoading(false);
    }
  };

  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    setSuccess('Product added to cart!');
    setTimeout(() => setSuccess(null), 2000);
  };

  const updateQuantity = (id: string, quantity: number) => {
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const handleCheckout = async (customerName: string, email: string) => {
    try {
      setLoading(true);
      setError(null);
      const order = await api.createOrder({
        customerName,
        email,
        items: cart,
      });
      setSuccess(`Order ${order.orderId} created successfully! Check your email for confirmation.`);
      setCart([]);
      setShowCheckout(false);
      setTimeout(() => {
        setSuccess(null);
        setView('orders');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  const handleEditOrder = async (orderId: string, status: string, items: OrderItem[]) => {
    try {
      setLoading(true);
      setError(null);
      await api.updateOrder({ orderId, status, items });
      setSuccess(`Order ${orderId} updated successfully!`);
      setEditingOrder(null);
      await loadOrders();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);
      await api.deleteOrder(orderId);
      setSuccess(`Order ${orderId} deleted successfully!`);
      await loadOrders();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete order');
    } finally {
      setLoading(false);
    }
  };

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-blue-600" size={32} />
              <h1 className="text-2xl font-bold text-gray-800">AWS E-Commerce</h1>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setView('products')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  view === 'products'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Products
              </button>
              <button
                onClick={() => setView('orders')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  view === 'orders'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Package size={20} />
                Orders
              </button>
            </div>
          </div>
        </div>
      </nav>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        </div>
      )}

      {success && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
            <CheckCircle size={20} />
            <span>{success}</span>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'products' ? (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">Products</h2>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                  <p className="text-gray-500">No products available</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Make sure AWS Lambda and API Gateway are configured
                  </p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
                  ))}
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold text-gray-800">Cart</h2>
                  {cartItemsCount > 0 && (
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {cartItemsCount} {cartItemsCount === 1 ? 'item' : 'items'}
                    </span>
                  )}
                </div>
                <Cart
                  items={cart}
                  onUpdateQuantity={updateQuantity}
                  onRemoveItem={removeFromCart}
                  onCheckout={() => setShowCheckout(true)}
                />
              </div>
            </div>
          </div>
        ) : (
          <div>
            <h2 className="text-3xl font-bold text-gray-800 mb-6">Your Orders</h2>
            <OrdersList
              orders={orders}
              loading={ordersLoading}
              onEdit={setEditingOrder}
              onDelete={handleDeleteOrder}
            />
          </div>
        )}
      </main>

      {showCheckout && (
        <CheckoutForm
          items={cart}
          onSubmit={handleCheckout}
          onClose={() => setShowCheckout(false)}
        />
      )}

      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onSubmit={handleEditOrder}
          onClose={() => setEditingOrder(null)}
        />
      )}

      {loading && (showCheckout || editingOrder) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-700 font-medium">
              {showCheckout ? 'Creating your order...' : 'Updating order...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
