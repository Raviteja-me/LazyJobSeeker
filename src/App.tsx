import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { 
  Brain,
  LogOut,
  HelpCircle,
  Layout,
  Home,
  DollarSign,
  LogIn
} from 'lucide-react';
import { useAuth } from './context/AuthContext';

// Import pages
import HomePage from './pages/Home';
import DashboardPage from './pages/Dashboard';
import PricingPage from './pages/Pricing';
import LoginPage from './pages/Login';
import SupportPage from './pages/Support';

function App() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Logo />
            <nav className="hidden md:flex items-center">
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <Link to="/" className="px-4 py-2 text-sm font-medium rounded-md transition-all hover:bg-white hover:shadow-md text-gray-700 hover:text-black flex items-center">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Link>
                {user && (
                  <Link to="/dashboard" className="px-4 py-2 text-sm font-medium rounded-md transition-all hover:bg-white hover:shadow-md text-gray-700 hover:text-black flex items-center">
                    <Layout className="w-4 h-4 mr-2" />
                    Dashboard
                  </Link>
                )}
                <Link to="/pricing" className="px-4 py-2 text-sm font-medium rounded-md transition-all hover:bg-white hover:shadow-md text-gray-700 hover:text-black flex items-center">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Pricing
                </Link>
                <Link to="/support" className="px-4 py-2 text-sm font-medium rounded-md transition-all hover:bg-white hover:shadow-md text-gray-700 hover:text-black flex items-center">
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Support
                </Link>
              </div>
              <div className="ml-6">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-900 transition-all flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-900 transition-all flex items-center"
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Routes>
    </div>
  );
}

export default App;