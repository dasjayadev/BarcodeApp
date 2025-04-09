import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  // Check if user is staff
  const isStaff = currentUser && ['owner', 'manager', 'staff'].includes(currentUser.role);

  return (
    <nav className="bg-white shadow-md fixed w-full z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-xl font-bold">Restaurant App</Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link 
              to="/" 
              className="px-3 py-2 hover:text-orange-500 rounded" 
              //style={{ transition: 'color 0.3s' }}
              //onMouseEnter={(e) => e.target.style.color = '#F57400'}
             // onMouseLeave={(e) => e.target.style.color = ''}
            >
              Home
            </Link>
            <Link 
              to="/menu" 
              className="px-3 py-2" 
              style={{ transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = '#F57400'}
              onMouseLeave={(e) => e.target.style.color = ''}
            >
              Menu
            </Link>
            <Link 
              to="/offers" 
              className="px-3 py-2" 
              style={{ transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = '#F57400'}
              onMouseLeave={(e) => e.target.style.color = ''}
            >
              Offers
            </Link>
            <Link 
              to="/about" 
              className="px-3 py-2" 
              style={{ transition: 'color 0.3s' }}
              onMouseEnter={(e) => e.target.style.color = '#F57400'}
              onMouseLeave={(e) => e.target.style.color = ''}
            >
              About
            </Link>
            
            {isAuthenticated && isStaff && (
              <Link 
                to="/dashboard" 
                className="px-3 py-2 text-white rounded" 
                style={{ 
                  backgroundColor: '#F57400', 
                  transition: 'background-color 0.3s' 
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#FF8753'}
                onMouseOut={(e) => e.target.style.backgroundColor = '#F57400'}
              >
                Dashboard
              </Link>
            )}
            
            {isAuthenticated ? (
              <div className="relative inline-block text-left">
                <button 
                  onClick={toggleDropdown}
                  className="flex items-center space-x-1 px-3 py-2  focus:outline-none"
                  style={{ transition: 'color 0.3s' }}
                  onMouseEnter={(e) => e.target.style.color = '#F57400'}
                  onMouseLeave={(e) => e.target.style.color = ''}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                >
                  <span>{currentUser?.name || 'User'}</span>
                  <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {dropdownOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Login
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="text-gray-500 hover:text-gray-600 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-3 ">
            <Link to="/" className="block px-3 py-2 hover:bg-gray-100">Home</Link>
            <Link to="/menu" className="block px-3 py-2 hover:bg-gray-100">Menu</Link>
            <Link to="/offers" className="block px-3 py-2 hover:bg-gray-100">Offers</Link>
            <Link to="/about" className="block px-3 py-2 hover:bg-gray-100">About</Link>
            
            {isAuthenticated && isStaff && (
              <Link 
                to="/dashboard" 
                className="block px-3 py-2 hover:bg-gray-100" 
                style={{ 
                  backgroundColor: '#F57400', 
                  transition: 'background-color 0.3s' 
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#FF8753'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#F57400'}
              >
                Dashboard
              </Link>
            )}
            
            {isAuthenticated && (
              <button 
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 hover:bg-gray-100"
              >
                Logout ({currentUser?.role || "User"})
              </button>
            )}
            
            {!isAuthenticated && (
              <Link to="/login" className="block px-3 py-2 hover:bg-gray-100">Login</Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;