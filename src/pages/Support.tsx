import React, { useState } from 'react';
import { 
  Search,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  MessageCircle
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">How Can We Help You?</h1>
          <p className="text-xl text-gray-600 mb-8">Find answers to common questions or get in touch with our support team.</p>
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

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-enhanced p-6 mb-12 animate-fade-in">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
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

        {/* Contact Support Section */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-enhanced p-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Support</h2>
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
                  placeholder="Your name"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
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
                  placeholder="How can we help you?"
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                />
              </div>
              {submitError && (
                <p className="text-red-600 text-sm">{submitError}</p>
              )}
              {submitSuccess && (
                <p className="text-green-600 text-sm">Message sent successfully! We'll get back to you soon.</p>
              )}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center space-x-2
                  ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-primary hover:opacity-90 transform hover:scale-[1.02] transition-all shadow-enhanced'}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-enhanced p-6 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Help</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
                <p className="text-gray-600">
                  For urgent inquiries, email us at:{' '}
                  <a href="mailto:help@lazyemployer.com" className="text-primary-600 hover:text-primary-700">
                    help@lazyemployer.com
                  </a>
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
                <div className="flex items-center space-x-2 text-gray-600">
                  <MessageCircle className="w-5 h-5 text-primary-500" />
                  <span>Available Monday to Friday, 9 AM - 5 PM EST</span>
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