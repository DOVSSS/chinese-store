import { Link } from 'react-router-dom';
import { FaHeart, FaShoppingCart, FaRegHeart } from 'react-icons/fa';
import { useCartStore, useFavoritesStore } from '../../store/store';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

function ProductCard({ product }) {
  const addToCart = useCartStore((state) => state.addToCart);
  const isFavorite = useFavoritesStore((state) => state.isFavorite(product.id));
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  return (
    <div className="bg-white rounded-xl card-shadow overflow-hidden">
      <Link to={`/product/${product.id}`}>
        <div className="relative pt-[100%] overflow-hidden">
          <LazyLoadImage
            src={product.images[0]}
            alt={product.title}
            effect="blur"
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
        </div>
      </Link>
      
      <div className="p-3">
        <Link to={`/product/${product.id}`}>
          <h3 className="font-medium text-sm line-clamp-2 h-10 mb-2">
            {product.title}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between">
          <span className="font-bold text-lg text-blue-600">
            {product.price.toLocaleString()} ₽
          </span>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => toggleFavorite(product.id)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isFavorite ? (
                <FaHeart className="text-red-500 text-lg" />
              ) : (
                <FaRegHeart className="text-gray-400 text-lg" />
              )}
            </button>
            
            <button
              onClick={() => addToCart(product)}
              className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-full transition-colors"
            >
              <FaShoppingCart className="text-lg" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;