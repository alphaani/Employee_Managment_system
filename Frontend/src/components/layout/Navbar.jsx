import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineMenuAlt2, HiOutlineLogout, HiOutlineUser } from 'react-icons/hi';
import { SidebarContext } from '../../context/SidebarContext';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const { toggle } = useContext(SidebarContext);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-4 lg:px-6">
        <button
          onClick={toggle}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <HiOutlineMenuAlt2 className="w-5 h-5 text-gray-600" />
        </button>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <HiOutlineUser className="w-4 h-4 text-primary-600" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">
                {user?.fullName || 'User'}
              </p>
              <p className="text-gray-500 text-xs capitalize">{isAdmin ? 'Admin' : 'Employee'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-2 rounded-lg hover:bg-red-50 transition-colors text-gray-500 hover:text-red-600"
            title="Logout"
          >
            <HiOutlineLogout className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
