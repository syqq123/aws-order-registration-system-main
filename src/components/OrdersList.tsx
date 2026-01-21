import { Package, Calendar, Mail, User } from 'lucide-react';
import { Order } from '../services/api';

interface OrdersListProps {
  orders: Order[];
  loading: boolean;
}

export function OrdersList({ orders, loading }: OrdersListProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <Package className="mx-auto text-gray-300 mb-4" size={64} />
        <p className="text-gray-500">No orders yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.orderId} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{order.orderId}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  {new Date(order.createdAt).toLocaleDateString('pl-PL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                order.status === 'PENDING'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-green-100 text-green-800'
              }`}
            >
              {order.status}
            </span>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-4 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <User size={16} className="text-gray-400" />
              <span>{order.customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-700">
              <Mail size={16} className="text-gray-400" />
              <span>{order.email}</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-800 mb-2">Items:</h4>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.name} x {item.quantity}
                  </span>
                  <span className="text-gray-600">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t flex justify-between items-center">
              <span className="font-semibold text-gray-800">Total:</span>
              <span className="text-xl font-bold text-blue-600">${order.totalAmount}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
