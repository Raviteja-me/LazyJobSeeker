import React, { useState } from 'react';
import { Download, Cpu, Shield, Zap, Monitor, Lock, Star, Coffee, Sparkles, Brain, Target, Users, Play, CheckCircle } from 'lucide-react';

export default function Angel() {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const downloads = [
    {
      platform: "macOS",
      url: "https://firebasestorage.googleapis.com/v0/b/lazy-job-seeker-4b29b.firebasestorage.app/o/angel-ai-assistant-1.0.0-arm64-1.dmg?alt=media&token=55f7e3d3-dcfa-49a5-9151-3ee69670d585",
      version: "1.0.0",
      size: "95MB",
      requirements: "macOS 10.15 or later"
    },
    {
      platform: "Windows",
      url: "#", // Will be updated later
      version: "1.0.0",
      size: "28MB",
      requirements: "Windows 10 or later"
    }
  ];

  const handleDownload = (platform: string, url: string) => {
    if (url === "#") {
      alert("Windows version coming soon!");
      return;
    }
  
    // Simply open the URL in a new tab
    window.open(url, '_blank');
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 5000);
  };

  const features = [
    {
      icon: <Monitor className="w-6 h-6" />,
      title: "Always On Top",
      description: "Floating interface that stays on Top Always during meetings"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Privacy First",
      description: "Completely invisible in screen sharing"
    },
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "AI-Powered Assistant",
      description: "Advanced AI capabilities for complex discussions"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Lightweight application that won't slow down your system"
    }
  ];

  const useCases = [
    {
      title: "Job Interviews",
      description: "Ace your technical interviews with real-time AI assistance",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Technical Meetings",
      description: "Handle complex technical discussions with confidence",
      image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      title: "Client Presentations",
      description: "Impress clients with well-informed responses",
      image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
  ];

  const testimonials = [
    {
      text: "Angel helped me land my dream job at a top tech company. It's like having an expert whispering in your ear!",
      author: "Sarah K.",
      role: "Senior Developer"
    },
    {
      text: "The privacy features are game-changing. I can get help during meetings without anyone knowing.",
      author: "Michael R.",
      role: "Product Manager"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black pt-24 text-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <Coffee className="h-16 w-16 text-purple-500" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full animate-pulse" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Meet Angel
          </h1>
          <div className="text-center mb-16">
          
          <h2 className="text-3xl font-bold mb-6">Take Your Meetings to the Next Level</h2>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-3xl p-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How Angel Works</h2>
            
          </div>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: <Download className="w-8 h-8" />, text: "Download & Install" },
              { icon: <Target className="w-8 h-8" />, text: "Open Angel" },
              { icon: <Brain className="w-8 h-8" />, text: "Start Meeting" },
              { icon: <Sparkles className="w-8 h-8" />, text: "Get Real-time Help" }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-purple-500/20 rounded-full p-4 inline-block mb-4">
                  {step.icon}
                </div>
                <p className="text-lg font-medium">{step.text}</p>
                
              </div>
            ))}
          </div>
        </div>
      </div>
        </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {features.map((feature, index) => (
            <div key={index} className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
              <div className="text-purple-500 mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Download Section */}
        <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-3xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Download Angel</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {downloads.map((download, index) => (
              <div key={index} className="bg-gray-800/30 rounded-xl p-6 border border-gray-700/50">
                <h3 className="text-xl font-semibold mb-4">{download.platform}</h3>
                <div className="space-y-2 text-gray-400 mb-6">
                  <p>Version: {download.version}</p>
                  <p>Size: {download.size}</p>
                  <p>Requirements: {download.requirements}</p>
                </div>
                <button
                  onClick={() => handleDownload(download.platform, download.url)}
                  className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors duration-200 w-full justify-center"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download for {download.platform}
                </button>
              </div>
            ))}
          </div>
        </div>

        
        
      </div>

      {/* Video Demo Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="relative rounded-2xl overflow-hidden aspect-video">
          <iframe
            className="w-full h-full absolute top-0 left-0"
            src="https://www.youtube.com/embed/JADwscWyXOo"
            title="Angel AI Assistant Demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* Add Use Cases Section */}
      
      {/* Add How It Works Section */}
      
    </div>
  );
}
