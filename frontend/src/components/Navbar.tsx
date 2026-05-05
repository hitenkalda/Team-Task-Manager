import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, LayoutDashboard, FolderKanban } from 'lucide-react';

const Navbar = () => {
  const { state, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 fixed left-0 right-0 top-0 z-50">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex justify-start items-center">
          <Link to="/dashboard" className="flex items-center justify-between mr-4">
            <span className="self-center text-2xl font-semibold whitespace-nowrap text-indigo-600">TeamTask</span>
          </Link>
          <div className="hidden md:flex space-x-4 ml-10">
            <Link to="/dashboard" className="flex items-center text-gray-700 hover:text-indigo-600">
              <LayoutDashboard className="w-5 h-5 mr-1" /> Dashboard
            </Link>
            <Link to="/projects" className="flex items-center text-gray-700 hover:text-indigo-600">
              <FolderKanban className="w-5 h-5 mr-1" /> Projects
            </Link>
          </div>
        </div>
        <div className="flex items-center lg:order-2">
          <div className="flex items-center mr-3 text-sm font-medium text-gray-900 rounded-full md:mr-0">
            <User className="w-6 h-6 mr-2 text-gray-500" />
            <span className="hidden md:inline">{state.user?.name}</span>
            <button
              onClick={handleLogout}
              className="ml-4 text-gray-500 hover:text-red-600"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
