import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaSpinner, FaCheck } from 'react-icons/fa';

// Правильный относительный путь
import { db } from '../../services/firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    description: '',
    category: 'electronics',
  });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Проверяем размер файлов (макс 5MB каждый)
    const oversized = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversized.length > 0) {
      setError('Некоторые файлы слишком большие (макс 5MB)');
      return;
    }
    
    // Добавляем новые файлы
    setImages([...images, ...files.slice(0, 5 - images.length)]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');
    
    // Валидация
    if (images.length === 0) {
      setError('Добавьте хотя бы одно изображение');
      setUploading(false);
      return;
    }
    
    if (!formData.title || !formData.price) {
      setError('Заполните обязательные поля');
      setUploading(false);
      return;
    }
    
    try {
      // Создаем массив URL для изображений (временное решение без Cloudinary)
      const imageUrls = images.map(img => URL.createObjectURL(img));
      
      // Создаем продукт в Firestore
      const productData = {
        title: formData.title,
        price: Number(formData.price),
        description: formData.description,
        category: formData.category,
        images: imageUrls,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        sales: 0,
        stock: 100 // Начальный запас
      };
      
      const productsRef = collection(db, 'products');
      await addDoc(productsRef, productData);
      
      // Успех
      alert('✅ Товар успешно добавлен!');
      navigate('/admin/dashboard/products');
      
    } catch (error) {
      console.error('Ошибка добавления товара:', error);
      setError(`Ошибка: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Добавить товар</h1>
        <p className="text-gray-600">Заполните информацию о товаре</p>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded-lg">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Изображения */}
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h2 className="text-lg font-semibold mb-4">Изображения товара</h2>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Загрузите изображения (макс 5 файлов, до 5MB каждый)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="imageUpload"
                disabled={uploading || images.length >= 5}
              />
              <label htmlFor="imageUpload" className="cursor-pointer">
                <FaUpload className="text-4xl text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Нажмите для загрузки</p>
                <p className="text-sm text-gray-500">
                  Поддерживаются JPG, PNG, WebP
                </p>
              </label>
            </div>
          </div>
          
          {/* Превью изображений */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={uploading}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-2 text-sm text-gray-500">
            {images.length} / 5 изображений
          </div>
        </div>
        
        {/* Основная информация */}
        <div className="bg-white rounded-xl p-6 shadow-md space-y-4">
          <h2 className="text-lg font-semibold mb-4">Основная информация</h2>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название товара *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Например: Смартфон Xiaomi Redmi Note 12"
              maxLength={100}
              disabled={uploading}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена (₽) *
              </label>
              <input
                type="number"
                required
                min="1"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="999.99"
                disabled={uploading}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                disabled={uploading}
              >
                <option value="electronics">Электроника</option>
                <option value="clothing">Одежда</option>
                <option value="home">Для дома</option>
                <option value="sports">Спорт</option>
                <option value="toys">Игрушки</option>
                <option value="beauty">Красота</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание *
            </label>
            <textarea
              rows="4"
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
              placeholder="Подробное описание товара..."
              maxLength={1000}
              disabled={uploading}
            />
          </div>
        </div>
        
        {/* Кнопки */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard/products')}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition disabled:opacity-50"
            disabled={uploading}
          >
            Отмена
          </button>
          
          <button
            type="submit"
            disabled={uploading || images.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <FaSpinner className="animate-spin" />
                Добавление...
              </>
            ) : (
              <>
                <FaCheck />
                Добавить товар
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;