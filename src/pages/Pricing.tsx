import React from 'react';

const plans = [
  {
    name: 'Starter',
    price: 'Free',
    features: [
      '3 resumes per day',
      'Basic AI enhancement',
      'Email support',
      'Basic analytics'
    ]
  },
  {
    name: 'Professional',
    price: '$12',
    features: [
      '10 resumes per day',
      'Advanced AI enhancement',
      'Priority support',
      'Advanced analytics',
      'Custom templates'
    ]
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: [
      'Unlimited resumes',
      'Premium AI enhancement',
      '24/7 dedicated support',
      'Full analytics suite',
      'Custom integration',
      'Team collaboration'
    ]
  }
];

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50 pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-gray-600">Choose the plan that's right for your business</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className="bg-white rounded-lg shadow-enhanced p-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-4xl font-bold text-primary-600 mb-6">{plan.price}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center text-gray-600">
                    <svg className="w-5 h-5 text-primary-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 px-4 rounded-lg text-white font-medium bg-gradient-primary hover:opacity-90 transform hover:scale-[1.02] transition-all shadow-enhanced">
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}