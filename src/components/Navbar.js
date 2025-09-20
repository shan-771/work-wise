import { Link } from 'react-router-dom';
import { FiHome, FiSettings } from 'react-icons/fi';
import { useState } from 'react';
import logo from '../images/logo.png';

const Navbar = () => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left side - Logo/Brand */}
          <div className="flex items-center space-x-3">
            <img 
              src={logo} 
              alt="WorkWise Logo"
              className="h-8 w-auto"
            />
            <span className="text-2xl font-bold text-gray-800">
              WorkWise
            </span>
          </div>

          {/* Right side - Icons */}
          <div className="flex items-center space-x-6">
            <Link 
              to="/dashboard" 
              className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
              title="Home"
            >
              <FiHome className="w-6 h-6" />
            </Link>
            
            <div className="relative">
              <button 
                className="text-gray-600 hover:text-blue-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Settings"
                onClick={() => setShowSettings(!showSettings)}
              >
                <FiSettings className="w-6 h-6" />
              </button>
              
              {showSettings && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-100"
                  onMouseLeave={() => setShowSettings(false)}
                >
                  <Link 
                    to="/profile" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowSettings(false)}
                  >
                    Profile
                  </Link>
                  <Link 
                    to="/" 
                    className="block px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    onClick={() => setShowSettings(false)}
                  >
                    Log Out
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;