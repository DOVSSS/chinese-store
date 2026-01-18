import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';
import { cloudinaryService } from '../cloudinary/cloudinaryService';

export const productService = {
  async getAllProducts() {
    try {
      const productsRef = collection(db, 'products');
      const q = query(productsRef, where('active', '==', true));
      
      const snapshot = await getDocs(q);
      const products = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Оптимизируем изображения для мобильных
        const optimizedImages = data.images?.map(img => 
          cloudinaryService.getOptimizedUrl(img, { width: 500, height: 500 })
        ) || [];
        
        return {
          id: doc.id,
          ...data,
          images: optimizedImages
        };
      });
      
      // Сортировка на клиенте по дате создания
      return products.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
      
    } catch (error) {
      console.error('Error getting products:', error);
      
      // Если ошибка индекса, пробуем получить все и фильтровать на клиенте
      if (error.code === 'failed-precondition') {
        try {
          const productsRef = collection(db, 'products');
          const snapshot = await getDocs(productsRef);
          const allProducts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          return allProducts
            .filter(product => product.active !== false)
            .map(product => ({
              ...product,
              images: product.images?.map(img => 
                cloudinaryService.getOptimizedUrl(img, { width: 500, height: 500 })
              ) || []
            }));
        } catch (fallbackError) {
          console.error('Fallback error:', fallbackError);
        }
      }
      
      return [];
    }
  },

  async getProductById(id) {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Оптимизируем изображения
        const optimizedImages = data.images?.map(img => 
          cloudinaryService.getOptimizedUrl(img, { width: 800, height: 800 })
        ) || [];
        
        return { 
          id: docSnap.id, 
          ...data,
          images: optimizedImages
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  },

  async createProduct(productData) {
    try {
      const productsRef = collection(db, 'products');
      const productWithMeta = {
        ...productData,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        sales: 0,
        rating: 0,
        reviews: 0,
        stock: productData.stock || 100
      };
      
      const docRef = await addDoc(productsRef, productWithMeta);
      return { id: docRef.id, ...productWithMeta };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  async updateProduct(id, productData) {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        ...productData,
        updatedAt: serverTimestamp()
      });
      return { id, ...productData };
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  },

  async deleteProduct(id) {
    try {
      const docRef = doc(db, 'products', id);
      await updateDoc(docRef, {
        active: false,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  },

  async incrementViews(id) {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const currentViews = docSnap.data().views || 0;
        await updateDoc(docRef, { views: currentViews + 1 });
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  }
};