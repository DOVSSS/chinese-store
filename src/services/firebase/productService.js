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
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';

export const productService = {
  // Получить все активные товары
  async getAllProducts() {
    try {
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef, 
        where('active', '==', true),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  },

  // Получить товар по ID
  async getProductById(id) {
    try {
      const docRef = doc(db, 'products', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting product:', error);
      throw error;
    }
  },

  // Создать новый товар
  async createProduct(productData) {
    try {
      const productsRef = collection(db, 'products');
      const productWithMeta = {
        ...productData,
        active: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        views: 0,
        sales: 0
      };
      
      const docRef = await addDoc(productsRef, productWithMeta);
      return { id: docRef.id, ...productWithMeta };
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  },

  // Обновить товар
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

  // Мягкое удаление (деактивация)
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

  // Увеличить счетчик просмотров
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
  },

  // Поиск товаров
  async searchProducts(searchTerm) {
    try {
      const productsRef = collection(db, 'products');
      const q = query(
        productsRef,
        where('active', '==', true),
        where('title', '>=', searchTerm),
        where('title', '<=', searchTerm + '\uf8ff')
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error searching products:', error);
      throw error;
    }
  }
};