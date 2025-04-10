import React, { useState } from 'react';
import { 
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  MessageCircle,
  Mail,
  Phone,
  Coffee,
  Brain
} from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
}

export default function Support() {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const faqs: FAQ[] = [
    {
      question: 'What is Angel AI Assistant?',
      answer: 'Angel is our new AI-powered meeting assistant that helps you excel in interviews and meetings. It provides real-time assistance while staying completely invisible during screen sharing. Perfect for job interviews, technical discussions, and client presentations.'
    },
    {
      question: 'How do I download and install Angel?',
      answer: 'Angel is available for both macOS and Windows (coming soon). Visit our Angel page to download the latest version. For macOS users, simply download the DMG file and follow the installation instructions.'
    },
    {
      question: 'How do I upload my job description?',
      answer: 'On the Dashboard page, use the drag-and-drop feature or the upload button. Simply drag your job description file into the designated area or click to browse and select your file.'
    },
    {
      question: 'What file formats are supported?',
      answer: 'We currently support PDF (.pdf), Microsoft Word (.doc, .docx), and plain text (.txt) file formats for job descriptions.'
    },
    {
      question: 'How do I use a LinkedIn job URL?',
      answer: 'Copy the job URL from LinkedIn and paste it into the designated field on the Dashboard page. The URL should look like "https://www.linkedin.com/jobs/view/..." You can find this by clicking on the job posting you\'re interested in and copying the URL from your browser\'s address bar.'
    },
    {
      question: 'What happens to my data?',
      answer: 'Your data is securely stored and encrypted using industry-standard protocols. We never share your job descriptions or candidate data with third parties without your explicit consent. All files are automatically deleted after 30 days for your privacy.'
    },
    {
      question: 'How can I contact support?',
      answer: 'You can reach our support team through multiple channels: Use the contact form below to send us a direct message, email us at help@lazyemployer.com, or use the live chat feature during business hours.'
    },
    {
      question: 'Is Angel visible during screen sharing?',
      answer: 'No, Angel is designed with privacy in mind. It remains completely invisible during screen sharing while still providing real-time assistance.'
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    if (!formData.name || !formData.email || !formData.message) {
      setSubmitError('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmitError('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section - Updated styling */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex justify-center items-center mb-6 space-x-3">
            <Brain className="h-10 w-10 text-purple-600" />
            <Coffee className="h-8 w-8 text-purple-400" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            How Can We Help You?
          </h1>
          <p className="text-xl text-gray-600 mb-8">Find answers, get support, or learn about our latest AI tools.</p>
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-enhanced"
            />
          </div>
        </div>

        {/* Contact Cards - New Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* WhatsApp Card */}
          <a
            href="https://wa.me/919876543040"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-br from-green-400 to-green-600 rounded-xl p-6 text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-3 mb-4">
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-lg font-semibold">WhatsApp</span>
            </div>
            <p className="text-white/90">Chat with us on WhatsApp</p>
          </a>

          {/* Phone Card */}
          <a
            href="tel:+919876543040"
            className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl p-6 text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Phone className="w-8 h-8" />
              <span className="text-lg font-semibold">Phone</span>
            </div>
            <p className="text-white/90">Call us directly</p>
          </a>

          {/* Email Card */}
          <a
            href="mailto:ravitejabeere@gmail.com"
            className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-xl p-6 text-white hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex items-center space-x-3 mb-4">
              <Mail className="w-8 h-8" />
              <span className="text-lg font-semibold">Email</span>
            </div>
            <p className="text-white/90">Send us an email</p>
          </a>
        </div>

        {/* Keep existing FAQ section with updated styling */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-enhanced p-8 mb-12 animate-fade-in">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg overflow-hidden hover:border-primary-200 transition-colors"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-primary-50"
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  {expandedFaq === index ? (
                    <ChevronUp className="h-5 w-5 text-primary-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-primary-500" />
                  )}
                </button>
                {expandedFaq === index && (
                  <div className="px-6 py-4 bg-primary-50 border-t border-primary-100">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form and Additional Help Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-enhanced p-8 animate-fade-in">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  required
                />
              </div>
              {submitError && (
                <p className="text-red-600 text-sm">{submitError}</p>
              )}
              {submitSuccess && (
                <p className="text-green-600 text-sm">Message sent successfully!</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-lg text-white font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transform transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Sending...
                  </div>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-enhanced p-8 animate-fade-in">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
              Additional Help
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
                <p className="text-gray-600">
                  For urgent inquiries, email us at:{' '}
                  <a href="mailto:ravitejabeere@gmail.com" className="text-primary-600 hover:text-primary-700">
                    ravitejabeere@gmail.com
                  </a>
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MessageCircle className="w-5 h-5 text-primary-500" />
                  <span>Available Monday to Friday, 9 AM - 5 PM IST</span>
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Response Time</h3>
                <p className="text-gray-600">
                  We typically respond to all inquiries within 24 hours during business days.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
