import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = ({ showNavbar = true }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200">
      {showNavbar && <Navbar />}
      <div className="max-w-6xl mx-auto p-6">
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;