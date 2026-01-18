import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { FaBox, FaPlus, FaSignOutAlt, FaChartBar, FaCog } from 'react-icons/fa';
import { auth } from '../../services/firebase/config';
import { useAuthStore } from '../../store/store';

function AdminDashboard() {
  const navigate = useNavigate();
  const clearUser = useAuthStore((state) => state.clearUser);
  const [activeTab, setActiveTab] = useState('products');

  const handleLogout = async () => {
    try {
      await auth.signOut();
      clearUser();
      navigate('/admin/login');
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  const menuItems = [
    { id: 'products', label: 'Товары', icon: <FaBox />, path: '/admin/dashboard' },
    { id: 'add', label: 'Добавить товар', icon: <FaPlus />, path: '/admin/dashboard/add' },
    { id: 'stats', label: 'Статистика', icon: <FaChartBar />, path: '/admin/dashboard/stats' },
    { id: 'settings', label: 'Настройки', icon: <FaCog />, path: '/admin/dashboard/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar для десктопа */}
      <div className="hidden md:block fixed left-0 top-0 h-screen w-64 bg-white border-r">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-800">Админ-панель</h1>
          <p className="text-sm text-gray-600 mt-1">Магазин товаров из Китая</p>
        </div>
        
        <nav className="mt-8">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-red-600 hover:text-red-700 w-full"
          >
            <FaSignOutAlt />
            <span>Выйти</span>
          </button>
        </div>
      </div>

      {/* Мобильная навигация */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex justify-around py-3">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-2 ${
                activeTab === item.id ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <div className="text-xl">{item.icon}</div>
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Основной контент */}
      <div className="md:ml-64 pb-16 md:pb-0">
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;