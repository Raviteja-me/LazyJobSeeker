import React, { useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '@dotlottie/player-component';
import { Brain, Coffee, CheckCircle, ArrowRight, Star, Target, Shield } from 'lucide-react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'dotlottie-player': any;
    }
  }
}

export default function Home() {
  const { user } = useAuth();
  const lottieRef = useRef<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://unpkg.com/@dotlottie/player-component@2.7.12/dist/dotlottie-player.mjs";
    script.type = "module";
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // Remove the redirect
  // if (user) {
  //   return <Navigate to="/dashboard" />;
  // }

  return (
    <div className="min-h-screen bg-black overflow-hidden">
      {/* Hero Section */}
      <div className="relative px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-start pt-20 min-h-[70vh]">
        <div className="w-full max-w-[400px] sm:max-w-[500px] mx-auto relative overflow-hidden" style={{ height: '70%' }}>
          <dotlottie-player
            ref={lottieRef}
            src="https://lottie.host/e4bbe16a-f0db-4375-a220-7fa001aed110/EtOysYgk6b.lottie"
            background="transparent"
            speed="1"
            style={{
              width: '100%',
              height: '140%',
              marginTop: '-30%',
              marginBottom: '-30%'
            }}
            loop
            autoplay
            renderer="svg"
            rendererSettings={{
              preserveAspectRatio: 'xMidYMid slice',
              progressiveLoad: true
            }}
          ></dotlottie-player>
        </div>

        <div className="text-center z-10 mt-8">
          <div className="mb-6 inline-block">
            <span className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-white px-6 py-2 rounded-full text-sm font-semibold border border-purple-500/30">
              🎯 100% Privacy Guaranteed
            </span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Work Smart<br/>Not Hard
          </h1>

          <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-12">
          Two Powerful Tools One Mission 
          </p>

          {/* Product Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
            {/* Magic CV Card */}
            <div className="group relative bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-8 backdrop-blur-xl border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <Brain className="w-10 h-10 text-purple-400" />
                  <span className="text-purple-400 text-sm">90% Success Rate</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Magic CV</h3>
                <p className="text-gray-300 mb-6">
                  AI-powered resume optimizer that:
                </p>
                <ul className="text-gray-400 text-left space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-purple-400" />
                    Tailors your CV to job requirements
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-purple-400" />
                    Beats ATS systems with smart keywords
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-purple-400" />
                    Increases interview callback rate
                  </li>
                </ul>
                <Link 
                  to={user ? "/dashboard" : "/login"} 
                  className="inline-flex items-center text-purple-400 hover:text-purple-300"
                >
                  {user ? "Try Magic CV" : "Sign in to Use"} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>

            {/* Angel Assistant Card */}
            <div className="group relative bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-2xl p-8 backdrop-blur-xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <Coffee className="w-10 h-10 text-blue-400" />
                  <span className="text-blue-400 text-sm">Real-time Assistant</span>
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Angel Assistant</h3>
                <p className="text-gray-300 mb-6">
                  Your invisible interview companion:
                </p>
                <ul className="text-gray-400 text-left space-y-3 mb-6">
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-blue-400" />
                    Real-time interview assistance
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-blue-400" />
                    100% undetectable during calls
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-blue-400" />
                    AI-powered response suggestions
                  </li>
                </ul>
                <Link 
                  to={user ? "/angel" : "/login"} 
                  className="inline-flex items-center text-blue-400 hover:text-blue-300"
                >
                  {user ? "Download Angel" : "Sign in to Download"} <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </div>
            </div>
          </div>

          {/* Enhanced CTA Section */}
          <div className="flex flex-col items-center gap-6 mb-20">
            {!user ? (
              <>
                <Link
                  to="/login"
                  className="group relative px-12 py-4 bg-white text-black rounded-lg overflow-hidden transition-all duration-300 hover:text-white"
                >
                  <span className="absolute inset-0 w-0 bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 ease-out group-hover:w-full"></span>
                  <span className="relative flex items-center text-lg font-bold">
                    Get Started Free
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </span>
                </Link>
                <p className="text-gray-400 text-sm">
                  Join thousands who transformed their job search
                </p>
              </>
            ) : (
              <div className="px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
                <span className="text-white">Welcome back, {user.email?.split('@')[0]}!</span>
              </div>
            )}
          </div>

          {/* Social Proof */}
          <div className="flex flex-wrap justify-center gap-8 text-gray-400 text-sm">
            
            
          
          </div>
        </div>

        {/* Warning Banner */}
        
      </div>
    </div>
  );
}
