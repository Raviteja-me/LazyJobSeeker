import React from 'react';
    import { Routes, Route, Link, useNavigate } from 'react-router-dom';
    import {
      Brain,
      LogOut,
      HelpCircle,
      Layout,
      Home,
      DollarSign,
      LogIn,
      Menu, // Import the Menu icon
      X // Import the X icon for closing the menu
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
      const [isMenuOpen, setIsMenuOpen] = React.useState(false); // State for mobile menu

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
                {/* Mobile Menu Button */}
                <div className="md:hidden">
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-black focus:outline-none">
                    {isMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
                  </button>
                </div>
                {/* Desktop Navigation */}
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

          {/* Mobile Menu (Off-canvas) */}
          <div
            className={`fixed top-0 left-0 w-full h-full bg-white z-40 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} md:hidden`}
          >
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 h-full flex flex-col">
              {/* Close Button (inside mobile menu) */}
              <div className="flex justify-end mb-8">
                <button onClick={() => setIsMenuOpen(false)} className="text-black focus:outline-none">
                  <X className="h-8 w-8" />
                </button>
              </div>
              <nav className="flex flex-col space-y-4">
                <Link to="/" className="px-4 py-2 text-lg font-medium rounded-md hover:bg-gray-100 text-gray-700 flex items-center" onClick={() => setIsMenuOpen(false)}>
                  <Home className="w-6 h-6 mr-2" />
                  Home
                </Link>
                {user && (
                  <Link to="/dashboard" className="px-4 py-2 text-lg font-medium rounded-md hover:bg-gray-100 text-gray-700 flex items-center" onClick={() => setIsMenuOpen(false)}>
                    <Layout className="w-6 h-6 mr-2" />
                    Dashboard
                  </Link>
                )}
                <Link to="/pricing" className="px-4 py-2 text-lg font-medium rounded-md hover:bg-gray-100 text-gray-700 flex items-center" onClick={() => setIsMenuOpen(false)}>
                  <DollarSign className="w-6 h-6 mr-2" />
                  Pricing
                </Link>
                <Link to="/support" className="px-4 py-2 text-lg font-medium rounded-md hover:bg-gray-100 text-gray-700 flex items-center" onClick={() => setIsMenuOpen(false)}>
                  <HelpCircle className="w-6 h-6 mr-2" />
                  Support
                </Link>
                {user ? (
                  <button
                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                    className="px-4 py-2 text-lg font-medium bg-black text-white rounded-lg hover:bg-gray-900 transition-all flex items-center"
                  >
                    <LogOut className="w-6 h-6 mr-2" />
                    Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="px-4 py-2 text-lg font-medium bg-black text-white rounded-lg hover:bg-gray-900 transition-all flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LogIn className="w-6 h-6 mr-2" />
                    Login
                  </Link>
                )}
              </nav>
            </div>
          </div>

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
