import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-white text-xl font-bold">BarcodeApp</Link>
            </div>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden md:flex items-center">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link to="/" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md font-medium">
                Home
              </Link>
              <Link to="/menu" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md font-medium">
                Menu
              </Link>
              <Link to="/offers" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md font-medium">
                Offers
              </Link>
              <Link to="/about" className="text-white hover:bg-blue-700 px-3 py-2 rounded-md font-medium">
                About
              </Link>
              
              {isLoggedIn ? (
                <div className="relative ml-3">
                  <div>
                    <button 
                      onClick={toggleDropdown}
                      className="flex items-center text-white hover:bg-blue-700 px-3 py-2 rounded-md font-medium"
                    >
                      <span>{user?.name || 'User'}</span>
                      <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                  
                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        {user?.role === 'owner' || user?.role === 'manager' ? (
                          <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            Dashboard
                          </Link>
                        ) : null}
                        <Link to="/dashboard/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link to="/login" className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-md font-medium">
                  Login
                </Link>
              )}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-blue-700 focus:outline-none"
            >
              <svg
                className={`${isOpen ? 'hidden' : 'block'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg
                className={`${isOpen ? 'block' : 'hidden'} h-6 w-6`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/" className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md font-medium">
            Home
          </Link>
          <Link to="/menu" className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md font-medium">
            Menu
          </Link>
          <Link to="/offers" className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md font-medium">
            Offers
          </Link>
          <Link to="/about" className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md font-medium">
            About
          </Link>
          
          {isLoggedIn ? (
            <>
              {user?.role === 'owner' || user?.role === 'manager' ? (
                <Link to="/dashboard" className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md font-medium">
                  Dashboard
                </Link>
              ) : null}
              <Link to="/dashboard/settings" className="text-white hover:bg-blue-700 block px-3 py-2 rounded-md font-medium">
                Settings
              </Link>
              <button
                onClick={handleLogout}
                className="text-white hover:bg-blue-700 block w-full text-left px-3 py-2 rounded-md font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="bg-white text-blue-600 hover:bg-gray-100 block px-3 py-2 rounded-md font-medium">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;