import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingBag, FaArrowLeft } from 'react-icons/fa';
import CartItem from '../../features/cart/CartItem';
import { useCartStore } from '../../store/store';
import OrderForm from './components/OrderForm';

function Cart() {
  const navigate = useNavigate();
  const { items, clearCart, getTotal, removeFromCart, updateQuantity } = useCartStore();
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const handleOrderSuccess = (number) => {
    setOrderNumber(number);
    setOrderComplete(true);
    setShowOrderForm(false);
  };

  const handleCloseSuccess = () => {
    setOrderComplete(false);
    navigate('/');
  };

  if (items.length === 0 && !orderComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaShoppingBag className="text-gray-400 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Корзина пуста</h2>
          <p className="text-gray-600 mb-8">
            Добавьте товары из каталога
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Перейти к покупкам
          </button>
        </div>
      </div>
    );
  }

  // Экран успешного оформления заказа
  if (orderComplete) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="text-green-600 text-4xl">✓</div>
          </div>
          <h2 className="text-2xl font-bold mb-3">Заказ оформлен!</h2>
          <p className="text-gray-600 mb-4">
            Номер вашего заказа: <span className="font-mono font-bold">{orderNumber}</span>
          </p>
          <p className="text-gray-500 mb-6">
            С вами свяжется менеджер для подтверждения заказа и уточнения деталей доставки
          </p>
          <div className="space-y-3">
            <button
              onClick={handleCloseSuccess}
              className="w-full btn-primary"
            >
              Вернуться на главную
            </button>
            <button
              onClick={() => navigate('/products')}
              className="w-full py-3 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Продолжить покупки
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2"
            aria-label="Назад"
          >
            <FaArrowLeft className="text-xl" />
          </button>
          <h1 className="text-xl font-bold">Корзина</h1>
          <button
            onClick={clearCart}
            className="p-2 text-red-500 hover:text-red-600"
            aria-label="Очистить корзину"
          >
            <FaTrash />
          </button>
        </div>
      </div>

      {/* Список товаров */}
      <div className="p-4 space-y-4">
        {items.map((item) => (
          <CartItem
            key={item.id}
            item={item}
            onRemove={() => removeFromCart(item.id)}
            onUpdateQuantity={(quantity) => updateQuantity(item.id, quantity)}
          />
        ))}
      </div>

      {/* Итого и кнопка заказа */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-lg">Итого:</span>
          <span className="text-2xl font-bold text-blue-600">
            {getTotal().toLocaleString()} ₽
          </span>
        </div>
        
        <button
          onClick={() => setShowOrderForm(true)}
          className="w-full btn-primary py-4 text-lg"
        >
          Оформить заказ
        </button>
        
        <p className="text-xs text-gray-500 text-center">
          Нажимая кнопку, вы соглашаетесь с условиями покупки
        </p>
      </div>

      {/* Отступ для фиксированной панели */}
      <div className="h-32"></div>

      {/* Форма оформления заказа */}
      {showOrderForm && (
        <OrderForm
          onClose={() => setShowOrderForm(false)}
          onSuccess={handleOrderSuccess}
        />
      )}
    </div>
  );
}

export default Cart;