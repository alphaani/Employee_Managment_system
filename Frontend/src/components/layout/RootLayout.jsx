import { Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { SidebarContext } from '../../context/SidebarContext';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const RootLayout = () => {
  const { collapsed } = useContext(SidebarContext);

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${
          collapsed ? 'ml-16' : 'ml-64'
        }`}
      >
        <Navbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RootLayout;
