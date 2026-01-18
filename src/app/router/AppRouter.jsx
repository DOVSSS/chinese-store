import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import BottomNav from '../../components/BottomNav/BottomNav';
import Loader from '../../components/Loader/Loader';
import { useAuthStore } from '../../store/store';

// Ленивая загрузка страниц
const Home = lazy(() => import('../../pages/Home/Home'));
const ProductPage = lazy(() => import('../../pages/Product/ProductPage'));
const Cart = lazy(() => import('../../pages/Cart/Cart'));
const Favorites = lazy(() => import('../../pages/Favorites/Favorites'));
const AdminLogin = lazy(() => import('../../pages/Admin/AdminLogin'));
const AdminDashboard = lazy(() => import('../../pages/Admin/AdminDashboard'));
const AdminProducts = lazy(() => import('../../pages/Admin/AdminProducts'));
const AddProduct = lazy(() => import('../../pages/Admin/AddProduct'));

// Защищенный роут для админа
const AdminRoute = ({ children }) => {
  const { isAdmin, user } = useAuthStore();
  
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }
  
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function AppRouter() {
  return (
    <BrowserRouter>
      <div className="min-h-screen pb-16">
        <Suspense fallback={<Loader />}>
          <Routes>
            {/* Публичные маршруты */}
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductPage />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/favorites" element={<Favorites />} />
            
            {/* Админские маршруты */}
            <Route path="/admin/login" element={<AdminLogin />} />
            
            <Route path="/admin/dashboard" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }>
              <Route index element={<AdminProducts />} />
              <Route path="add" element={<AddProduct />} />
              <Route path="products" element={<AdminProducts />} />
            </Route>
            
            {/* 404 */}
            <Route path="*" element={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold mb-4">404</h1>
                  <p className="text-gray-600 mb-8">Страница не найдена</p>
                  <a href="/" className="btn-primary">На главную</a>
                </div>
              </div>
            } />
          </Routes>
        </Suspense>
      </div>
      
      {/* Навигация для мобильных (скрываем в админке) */}
      <Routes>
        <Route path="/admin/*" element={null} />
        <Route path="*" element={<BottomNav />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;