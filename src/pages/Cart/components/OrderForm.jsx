import { useState } from 'react';
import { orderService } from '../../../services/firebase/orderService';
import { useCartStore } from '../../../store/store';

function OrderForm({ onClose, onSuccess }) {
  const { items, clearCart, getTotal } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    comment: ''
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Введите имя';
    else if (formData.name.length < 2) newErrors.name = 'Имя слишком короткое';
    
    if (!formData.phone.trim()) newErrors.phone = 'Введите телефон';
    else if (!/^[\+]?[78][-\s]?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{2}[-\s]?\d{2}$/.test(formData.phone)) {
      newErrors.phone = 'Введите корректный номер';
    }
    
    if (!formData.address.trim()) newErrors.address = 'Введите адрес';
    else if (formData.address.length < 10) newErrors.address = 'Адрес слишком короткий';
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setLoading(true);
    setErrors({});

    try {
      const orderData = {
        customer: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email || '',
          address: formData.address
        },
        items: items.map(item => ({
          productId: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          image: item.images?.[0] || ''
        })),
        total: getTotal(),
        comment: formData.comment || '',
        status: 'pending'
      };

      await orderService.createOrder(orderData);
      clearCart();
      onSuccess(orderData.orderNumber);
      
    } catch (error) {
      console.error('Error creating order:', error);
      setErrors({ submit: 'Ошибка при оформлении заказа. Попробуйте еще раз.' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Очищаем ошибку при изменении поля
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md animate-fadeIn">
        {/* Шапка модалки */}
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Оформление заказа</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg"
              aria-label="Закрыть"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Форма */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-1">
              Имя и фамилия *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Иван Иванов"
              disabled={loading}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Телефон *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="+7 (999) 123-45-67"
              disabled={loading}
            />
            {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Email (необязательно)
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="email@example.com"
              disabled={loading}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Адрес доставки *
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              className={`w-full p-3 border rounded-lg ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Город, улица, дом, квартира, индекс"
              rows="3"
              disabled={loading}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Комментарий к заказу (необязательно)
            </label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
              className="w-full p-3 border border-gray-300 rounded-lg"
              placeholder="Дополнительные пожелания"
              rows="2"
              disabled={loading}
            />
          </div>

          {/* Сводка заказа */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium mb-2">Ваш заказ:</h3>
            <div className="space-y-2">
              {items.map(item => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="truncate">{item.title} × {item.quantity}</span>
                  <span>{(item.price * item.quantity).toLocaleString()} ₽</span>
                </div>
              ))}
            </div>
            <div className="border-t pt-2 mt-2 flex justify-between font-bold">
              <span>Итого:</span>
              <span>{getTotal().toLocaleString()} ₽</span>
            </div>
          </div>

          {errors.submit && (
            <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm">
              {errors.submit}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-4 text-lg disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Отправляем...
              </div>
            ) : (
              'Подтвердить заказ'
            )}
          </button>

          <p className="text-xs text-gray-500 text-center">
            После оформления с вами свяжется менеджер для подтверждения заказа
          </p>
        </form>
      </div>
    </div>
  );
}

export default OrderForm;