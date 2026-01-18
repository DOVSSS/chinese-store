import { Link } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaRegHeart } from 'react-icons/fa';
import { useCartStore, useFavoritesStore } from '../../store/store';
import { cloudinaryService } from '../../services/cloudinary/cloudinaryService';

function ProductCard({ product }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(product.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  // Получаем оптимизированное изображение
  const getProductImage = () => {
    if (!product.images || product.images.length === 0) {
      return 'https://via.placeholder.com/500x500/cccccc/ffffff?text=No+Image';
    }
    
    const firstImage = product.images[0];
    
    // Если это Cloudinary изображение, оптимизируем его
    if (typeof firstImage === 'string' && firstImage.includes('cloudinary.com')) {
      return cloudinaryService.getOptimizedUrl(firstImage, { 
        width: 500, 
        height: 500 
      });
    }
    
    // Если это другой URL
    if (typeof firstImage === 'string') {
      return firstImage;
    }
    
    return 'https://via.placeholder.com/500x500/cccccc/ffffff?text=No+Image';
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
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
      <Link to={`/product/${product.id}`} className="block">
        <div className="relative pt-[100%] overflow-hidden bg-gray-100">
          <img
            src={imageUrl}
            alt={product.title || 'Товар'}
            className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/500x500/cccccc/ffffff?text=Image+Error';
            }}
          />
          
          {/* Бейдж новинки */}
          {isNew && (
            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
              NEW
            </div>
          )}
          
          {/* Бейдж скидки */}
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{Math.round((1 - product.price / product.originalPrice) * 100)}%
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-sm line-clamp-2 h-10 mb-3 hover:text-blue-600 transition-colors">
            {product.title || 'Без названия'}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="font-bold text-lg text-blue-600 block">
              {product.price ? `${product.price.toLocaleString('ru-RU')} ₽` : 'Цена не указана'}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-gray-400 line-through">
                {product.originalPrice.toLocaleString('ru-RU')} ₽
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleFavorite(product.id)}
              className="p-2 hover:bg-red-50 rounded-full transition-colors group/fav"
              aria-label={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
              title={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
            >
              {isFavorite ? (
                <FaHeart className="text-red-500 text-lg group-hover/fav:scale-110 transition-transform" />
              ) : (
                <FaRegHeart className="text-gray-400 text-lg group-hover/fav:text-red-400 group-hover/fav:scale-110 transition-all" />
              )}
            </button>
            
            <button
              onClick={() => addToCart(product)}
              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-colors group/cart"
              aria-label="Добавить в корзину"
              title="Добавить в корзину"
            >
              <FaShoppingCart className="text-lg group-hover/cart:scale-110 transition-transform" />
            </button>
          </div>
        </div>
        
        {/* Дополнительная информация */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t">
          <span className="flex items-center gap-1">
            👁 {product.views || 0}
          </span>
          <span className="flex items-center gap-1">
            ⭐ {product.rating || 0}/5
          </span>
          {product.stock !== undefined && (
            <span className={`flex items-center gap-1 ${
              product.stock < 10 ? 'text-red-500 font-medium' : ''
            }`}>
              📦 {product.stock > 50 ? 'Много' : product.stock} шт.
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;