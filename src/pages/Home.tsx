import React, { useEffect, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '@dotlottie/player-component';

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

  if (user) {
    return <Navigate to="/dashboard" />;
  }

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
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-white mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
  Work Smarter,<br/>Not Harder
</h1>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12">
            Transform your Resume/CV optimized and tailor-made specifically for your dream job..
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl relative group overflow-hidden transform hover:scale-105 transition-all duration-200"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="relative flex items-center justify-center text-white font-bold text-lg">
                Get Started Free
                <svg className="w-6 h-6 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                </svg>
              </div>
            </Link>

            <Link
              to="/pricing"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl relative group overflow-hidden transform hover:scale-105 transition-all duration-200 border border-gray-700"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <div className="relative flex items-center justify-center text-white font-bold text-lg">
                View Pricing
                <svg className="w-6 h-6 ml-2 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16">
            <div>
              <h2 className="text-3xl font-bold mb-6">AI-Powered Resume Enhancement</h2>
              <p className="text-gray-600 mb-4">
                Our advanced AI technology analyzes job descriptions and optimizes your resume in real-time. Get tailored suggestions that highlight your relevant skills and experience, increasing your chances of landing interviews.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Automated keyword optimization
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  ATS-friendly formatting
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Industry-specific suggestions
                </li>
              </ul>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">Smart Cover Letter Generation</h2>
              <p className="text-gray-600 mb-4">
                Create compelling cover letters in minutes with our AI-powered system. Our technology understands job requirements and crafts personalized cover letters that showcase your unique value proposition.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Personalized content generation
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Professional tone and style
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  Company-specific customization
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}