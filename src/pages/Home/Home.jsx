import { useState, useEffect } from 'react';
import ProductGrid from '../../components/ProductGrid/ProductGrid';
import { db } from '../../services/firebase/config';
import { collection, getDocs, query, where } from 'firebase/firestore';

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('active', '==', true));
      const snapshot = await getDocs(q);
      
      const productsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProducts(productsList);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Товары из Китая</h1>
      
      <ProductGrid products={products} />
      
      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Товары скоро появятся</p>
        </div>
      )}
    </div>
  );
}

export default Home;