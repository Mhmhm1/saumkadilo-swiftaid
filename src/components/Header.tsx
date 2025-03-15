
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Ambulance, Menu, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { toast } from "sonner";
import NotificationCenter from './NotificationCenter';

const Header = () => {
  const { currentUser, logout, isAdmin, isDriver } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Navigate to home page after logout
      navigate('/');
      // Close mobile menu if open
      if (isMenuOpen) {
        setIsMenuOpen(false);
      }
    } catch (error) {
      console.error('Logout error in Header:', error);
      // Still navigate to home page even if there was an error
      navigate('/');
    }
  };

  // Define navigation links based on user role
  const getNavLinks = () => {
    if (!currentUser) {
      return [
        { path: '/', label: 'Home' },
        { path: '/login', label: 'Login' },
        { path: '/register', label: 'Register' }
      ];
    }
    
    if (isAdmin) {
      return [
        { path: '/admin', label: 'Dashboard' },
        { path: '/admin/requests', label: 'All Requests' },
        { path: '/admin/drivers', label: 'Manage Drivers' }
      ];
    }
    
    if (isDriver) {
      return [
        { path: '/driver', label: 'My Assignments' },
        { path: '/driver/history', label: 'History' }
      ];
    }
    
    // Default for requesters
    return [
      { path: '/dashboard', label: 'Dashboard' },
      { path: '/request', label: 'Request Help' },
      { path: '/history', label: 'My Requests' }
    ];
  };

  const navLinks = getNavLinks();

  return (
    <header className="w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-30 border-b border-gray-200 dark:border-gray-800 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors">
            <Ambulance className="h-6 w-6" />
            <span className="font-semibold text-xl tracking-tight">SwiftAid</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
            
            {currentUser && (
              <>
                <NotificationCenter />
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary"
                >
                  Log out
                </Button>
              </>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {currentUser && <NotificationCenter />}
            <Button variant="ghost" size="icon" onClick={toggleMenu} aria-label="Toggle menu">
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 py-4 px-4 border-t border-gray-200 dark:border-gray-800 animate-fade-in">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-2 py-1 text-base font-medium rounded hover:bg-gray-100 dark:hover:bg-gray-800 ${
                  location.pathname === link.path
                    ? 'text-primary bg-gray-100 dark:bg-gray-800'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            
            {currentUser && (
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="justify-start px-2 py-1 h-auto font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                Log out
              </Button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
