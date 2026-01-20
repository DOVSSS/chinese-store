import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  serverTimestamp,
  doc,
  updateDoc 
} from 'firebase/firestore';
import { db } from './config';

const ordersCollection = collection(db, 'orders');

export const orderService = {
  // Создание нового заказа
  createOrder: async (orderData) => {
    try {
      const orderNumber = 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
      
      const orderWithMeta = {
        ...orderData,
        orderNumber,
        status: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      const docRef = await addDoc(ordersCollection, orderWithMeta);
      return { id: docRef.id, ...orderWithMeta };
      
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  },

  // Получение всех заказов
  getAllOrders: async () => {
    try {
      const q = query(ordersCollection, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
    } catch (error) {
      console.error('Error getting orders:', error);
      return [];
    }
  },

  // Обновление статуса заказа
  updateOrderStatus: async (orderId, status) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, {
        status,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
};