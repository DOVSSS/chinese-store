import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { useFavoritesStore } from '../../store/store';
import { cloudinaryService } from '../../services/cloudinary/cloudinaryService';

function ProductCard({ product }) {
  const isFavorite = useFavoritesStore((state) => state.isFavorite(product.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  // Получаем оптимизированное изображение
  const getProductImage = () => {
    if (!product.images || product.images.length === 0) {
      return 'https://via.placeholder.com/900x900/cccccc/ffffff?text=No+Image';
    }
    
    const firstImage = product.images[0];
    
    if (typeof firstImage === 'string' && firstImage.includes('cloudinary.com')) {
      return cloudinaryService.getOptimizedUrl(firstImage, { 
        width: 900, 
        height: 900 
      });
    }
    
    if (typeof firstImage === 'string') {
      return firstImage;
    }
    
    return 'https://via.placeholder.com/900x900/cccccc/ffffff?text=No+Image';
  };

  const imageUrl = getProductImage();

  // Проверяем, новый ли товар (менее 7 дней)
  const checkIfNew = () => {
    if (!product.createdAt) return false;
    
    try {
      let createdDate;
      if (product.createdAt.toDate) {
        createdDate = product.createdAt.toDate();
      } else if (typeof product.createdAt === 'string') {
        createdDate = new Date(product.createdAt);
      } else if (product.createdAt.seconds) {
        createdDate = new Date(product.createdAt.seconds * 1000);
      } else {
        return false;
      }
      
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      return createdDate > sevenDaysAgo;
    } catch (error) {
      console.error('Error checking if product is new:', error);
      return false;
    }
  };

  const isNew = checkIfNew();

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full">
      <div className="relative flex-grow">
        <Link to={`/product/${product.id}`} className="block">
          <div className="relative pt-[120%] overflow-hidden bg-gray-100">
            <img
              src={imageUrl}
              alt={product.title || 'Товар'}
              className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/900x900/cccccc/ffffff?text=Image+Error';
              }}
            />
            
            {/* Бейдж новинки в левом верхнем углу */}
            {isNew && (
              <div className="absolute top-1 left-1 bg-green-500 text-white text-xs font-semibold px-1 py-0.5 rounded z-10">
                NEW
              </div>
            )}
            
            {/* Бейдж скидки в левом верхнем углу (под новинкой) */}
            {product.originalPrice && product.originalPrice > product.price && (
              <div className={`absolute bg-red-500 text-white text-xs font-semibold px-1 py-0.5 rounded z-10 ${
                isNew ? 'top-7 left-1' : 'top-1 left-1'
              }`}>
                -{Math.round((1 - product.price / product.originalPrice) * 100)}%
              </div>
            )}
            
            {/* Иконка избранного в правом верхнем углу */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleFavorite(product.id);
              }}
              className="absolute top-1 right-1 z-10"
              aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
              title={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
            >
              <div className="p-1 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-colors">
                {isFavorite ? (
                  <FaHeart className="text-red-500 text-xs" />
                ) : (
                  <FaRegHeart className="text-gray-600 text-xs" />
                )}
              </div>
            </button>
          </div>
        </Link>
      </div>
      
      <div className="p-1.5">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-xs line-clamp-2 h-8 mb-0.5 hover:text-blue-600 transition-colors">
            {product.title || 'Без названия'}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-bold text-sm text-blue-600">
              {product.price ? `${product.price.toLocaleString('ru-RU')} ₽` : 'Цена не указана'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;