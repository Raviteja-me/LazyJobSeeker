import React from 'react';
import { Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import {
  Brain,
  LogOut,
  HelpCircle,
  Layout,
  Home,
  Coffee,
  LogIn,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from './context/AuthContext';

// Import pages
// Fix the import paths with correct case sensitivity
import HomePage from './pages/home';
import MagicCVPage from './pages/Dashboard';
import AngelPage from './pages/angel';  // Changed from Angel to angel
import LoginPage from './pages/login';
import SupportPage from './pages/support';
import Footer from './components/Footer';


function App() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const Logo = () => (
    <Link to="/" className="flex items-center">
      <div className="relative">
        <Brain className="h-8 w-8 text-black" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-black rounded-full animate-pulse" />
      </div>
      <span className="ml-2 text-xl font-bold text-black">
        Lazy Job Seeker
      </span>
    </Link>
  );

  // Add a protected route wrapper
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    if (!user) {
      return <Navigate to="/login" />;
    }
    return <>{children}</>;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Logo />
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-black focus:outline-none">
                {isMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
              </button>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <Link to="/" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black">
                  Home
                </Link>
                <Link to="/dashboard" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black">
                  Magic CV
                </Link>
                <Link to="/angel" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black">
                  Angel
                </Link>
                <Link to="/support" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black">
                  Support
                </Link>
              </div>
              {user ? (
                <button
                  onClick={handleLogout}
                  className="ml-4 flex items-center text-sm font-medium text-gray-700 hover:text-black"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="ml-4 flex items-center text-sm font-medium text-gray-700 hover:text-black"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/support" element={<SupportPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <MagicCVPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/angel"
            element={
              <ProtectedRoute>
                <AngelPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
