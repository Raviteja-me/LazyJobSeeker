import React from 'react';
import { Link } from 'react-router-dom';
import { Brain, Coffee, Heart, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-transparent to-gray-100 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Brain className="h-6 w-6 text-purple-600" />
              <Coffee className="h-5 w-5 text-purple-400 ml-1" />
            </div>
            <p className="text-gray-600">
              Making job hunting smarter and more efficient with AI-powered tools.
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Products</h3>
            <ul className="space-y-2">
              <li><Link to="/dashboard" className="text-gray-600 hover:text-purple-600">Magic CV</Link></li>
              <li><Link to="/angel" className="text-gray-600 hover:text-purple-600">Angel AI Assistant</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/support" className="text-gray-600 hover:text-purple-600">Help Center</Link></li>
              <li><a href="mailto:ravitejabeere@gmail.com" className="text-gray-600 hover:text-purple-600">Contact</a></li>
              <li><a href="tel:+919876543040" className="text-gray-600 hover:text-purple-600">Phone</a></li>
              <li><a href="https://wa.me/919876543040" className="text-gray-600 hover:text-purple-600">WhatsApp</a></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a 
                href="https://github.com/Raviteja-me/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-600 hover:text-purple-600"
              >
                <Github className="h-5 w-5" />
              </a>
              <a 
                href="https://x.com/Raviteja__Beere" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-600 hover:text-purple-600"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a 
                href="https://www.linkedin.com/in/raviteja-beere-89a420167/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-gray-600 hover:text-purple-600"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm">
              © {currentYear} Lazy Job Seeker. All rights reserved.
            </p>
            <div className="flex items-center mt-4 md:mt-0">
              <span className="text-gray-600 text-sm">Made with</span>
              <Heart className="h-4 w-4 text-red-500 mx-1" />
              <span className="text-gray-600 text-sm">Ravi Teja Beere</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}