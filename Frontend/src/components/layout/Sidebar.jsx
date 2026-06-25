import { NavLink } from 'react-router-dom';
import { useContext } from 'react';
import { SidebarContext } from '../../context/SidebarContext';
import { useAuth } from '../../hooks/useAuth';
import { SIDEBAR_LINKS } from '../../utils/constants';
import {
  HiOutlineChartBar, HiOutlineUsers, HiOutlineOfficeBuilding,
  HiOutlineClock, HiOutlineCalendar, HiOutlineCurrencyDollar,
  HiOutlineTrendingUp, HiOutlineUser, HiOutlineDocumentReport,
  HiOutlineCog,
} from 'react-icons/hi';

const iconMap = {
  HiOutlineChartBar, HiOutlineUsers, HiOutlineOfficeBuilding,
  HiOutlineClock, HiOutlineCalendar, HiOutlineCurrencyDollar,
  HiOutlineTrendingUp, HiOutlineUser, HiOutlineDocumentReport,
  HiOutlineCog,
};

const Sidebar = () => {
  const { collapsed } = useContext(SidebarContext);
  const { isAdmin } = useAuth();
  const userRole = isAdmin ? 'admin' : 'employee';

  const filteredLinks = SIDEBAR_LINKS.filter(
    (link) => link.roles.includes(userRole)
  );

  return (
    <aside
      className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="flex items-center h-16 px-4 border-b border-gray-200">
        {!collapsed && (
          <h1 className="text-lg font-bold text-primary-600 truncate">EMS</h1>
        )}
      </div>

      <nav className="p-3 space-y-1 mt-2">
        {filteredLinks.map((link) => {
          const Icon = iconMap[link.icon];
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'sidebar-link-active' : 'sidebar-link-inactive'}`
              }
              title={collapsed ? link.label : undefined}
            >
              {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
              {!collapsed && <span>{link.label}</span>}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
