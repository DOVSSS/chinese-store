import { useState, useEffect } from 'react';
import { orderService } from '../../services/firebase/orderService';
import { FaEye, FaCheck, FaTimes, FaTruck, FaBox, FaEdit } from 'react-icons/fa';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusLoading, setStatusLoading] = useState({});

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const ordersData = await orderService.getAllOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    setStatusLoading(prev => ({ ...prev, [orderId]: true }));
    try {
      await orderService.updateOrderStatus(orderId, status);
      await loadOrders(); // Перезагружаем список
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Ошибка при обновлении статуса');
    } finally {
      setStatusLoading(prev => ({ ...prev, [orderId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: <FaEye className="inline mr-1" />, 
        label: 'Новый' 
      },
      processing: { 
        color: 'bg-blue-100 text-blue-800', 
        icon: <FaTruck className="inline mr-1" />, 
        label: 'В обработке' 
      },
      shipped: { 
        color: 'bg-purple-100 text-purple-800', 
        icon: <FaTruck className="inline mr-1" />, 
        label: 'Отправлен' 
      },
      completed: { 
        color: 'bg-green-100 text-green-800', 
        icon: <FaCheck className="inline mr-1" />, 
        label: 'Завершен' 
      },
      cancelled: { 
        color: 'bg-red-100 text-red-800', 
        icon: <FaTimes className="inline mr-1" />, 
        label: 'Отменен' 
      }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Заказы</h1>
        <span className="text-gray-600">
          Всего: {orders.length}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <FaBox className="text-gray-400 text-6xl mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Заказов пока нет</h3>
          <p className="text-gray-600">Как только клиенты начнут оформлять заказы, они появятся здесь</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-4">Номер</th>
                <th className="text-left p-4">Клиент</th>
                <th className="text-left p-4">Товары</th>
                <th className="text-left p-4">Сумма</th>
                <th className="text-left p-4">Статус</th>
                <th className="text-left p-4">Дата</th>
                <th className="text-left p-4">Действия</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-mono text-sm">{order.orderNumber}</td>
                  <td className="p-4">
                    <div>
                      <div className="font-medium">{order.customer?.name}</div>
                      <div className="text-sm text-gray-600">{order.customer?.phone}</div>
                      {order.customer?.email && (
                        <div className="text-sm text-gray-600">{order.customer.email}</div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-blue-600 hover:text-blue-800 text-sm underline"
                    >
                      {order.items?.length || 0} товаров
                    </button>
                  </td>
                  <td className="p-4 font-bold">
                    {order.total?.toLocaleString()} ₽
                  </td>
                  <td className="p-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                    {order.createdAt?.toDate?.().toLocaleDateString('ru-RU')}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        disabled={statusLoading[order.id]}
                        className="border rounded px-2 py-1 text-sm w-full"
                      >
                        <option value="pending">Новый</option>
                        <option value="processing">В обработке</option>
                        <option value="shipped">Отправлен</option>
                        <option value="completed">Завершен</option>
                        <option value="cancelled">Отменен</option>
                      </select>
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-800 p-1"
                        title="Детали заказа"
                      >
                        <FaEye />
                        <span>Подробнее</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Модальное окно с деталями заказа */}
      {selectedOrder && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedOrder(null)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Шапка модалки */}
            <div className="sticky top-0 bg-white border-b p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold">Заказ #{selectedOrder.orderNumber}</h2>
                  <p className="text-gray-600">
                    {selectedOrder.createdAt?.toDate?.().toLocaleString('ru-RU')}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-gray-700"
                  aria-label="Закрыть"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>
            </div>

            {/* Контент модалки */}
            <div className="p-6 space-y-6">
              {/* Информация о клиенте */}
              <div>
                <h3 className="text-lg font-bold mb-4 pb-2 border-b">Информация о клиенте</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm text-gray-600 mb-1">Имя и фамилия:</label>
                    <div className="font-medium text-lg">{selectedOrder.customer?.name || 'Не указано'}</div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <label className="block text-sm text-gray-600 mb-1">Телефон:</label>
                    <div className="font-medium text-lg">{selectedOrder.customer?.phone || 'Не указан'}</div>
                  </div>
                  {selectedOrder.customer?.email && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <label className="block text-sm text-gray-600 mb-1">Email:</label>
                      <div className="font-medium">{selectedOrder.customer.email}</div>
                    </div>
                  )}
                  <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Адрес доставки:</label>
                    <div className="font-medium">{selectedOrder.customer?.address || 'Не указан'}</div>
                  </div>
                </div>
              </div>

              {/* Товары в заказе */}
              <div>
                <h3 className="text-lg font-bold mb-4 pb-2 border-b">
                  Товары ({selectedOrder.items?.length || 0})
                </h3>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center border rounded-lg p-4">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-20 h-20 object-cover rounded mr-4"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-sm text-gray-600">
                          Цена: {item.price?.toLocaleString()} ₽ × {item.quantity} шт.
                        </div>
                        {item.productId && (
                          <div className="text-xs text-gray-500 mt-1">
                            ID товара: {item.productId}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">
                          {(item.price * item.quantity)?.toLocaleString()} ₽
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Итого и дополнительная информация */}
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-lg font-bold">Итого к оплате:</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {selectedOrder.total?.toLocaleString()} ₽
                  </div>
                </div>

                {selectedOrder.comment && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Комментарий клиента:
                    </label>
                    <div className="bg-gray-50 p-4 rounded-lg italic">
                      "{selectedOrder.comment}"
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Текущий статус:</label>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Изменить статус:</span>
                    <select
                      value={selectedOrder.status}
                      onChange={(e) => {
                        updateStatus(selectedOrder.id, e.target.value);
                        setSelectedOrder({
                          ...selectedOrder,
                          status: e.target.value
                        });
                      }}
                      className="border rounded px-3 py-2"
                    >
                      <option value="pending">Новый</option>
                      <option value="processing">В обработке</option>
                      <option value="shipped">Отправлен</option>
                      <option value="completed">Завершен</option>
                      <option value="cancelled">Отменен</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Футер модалки */}
            <div className="sticky bottom-0 bg-white border-t p-4">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Закрыть
                </button>
                <button
                  onClick={() => {
                    // Здесь можно добавить функцию печати или экспорта
                    window.print();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Распечатать заказ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;