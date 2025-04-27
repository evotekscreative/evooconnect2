import { useState } from 'react';
import { Check, Star, Crown, Shield, Zap } from 'lucide-react';
import Case from '../components/Case.jsx';

export default function PremiumPage() {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      name: 'Basic',
      icon: <Star className="h-6 w-6 text-blue-500" />,
      price: billingCycle === 'monthly' ? 9.99 : 99.99,
      description: 'Perfect for beginners',
      features: [
        'Access to basic features',
        '2 projects',
        'Community support',
        '1GB storage'
      ],
      highlighted: false,
      buttonColor: 'bg-gray-600'
    },
    {
      name: 'Pro',
      icon: <Crown className="h-6 w-6 text-yellow-500" />,
      price: billingCycle === 'monthly' ? 19.99 : 199.99,
      description: 'Most popular choice',
      features: [
        'All Basic features',
        'Unlimited projects',
        'Priority support',
        '10GB storage',
        'Advanced analytics'
      ],
      highlighted: true,
      buttonColor: 'bg-blue-600'
    },
    {
      name: 'Enterprise',
      icon: <Shield className="h-6 w-6 text-purple-500" />,
      price: billingCycle === 'monthly' ? 49.99 : 499.99,
      description: 'For serious professionals',
      features: [
        'All Pro features',
        'Dedicated account manager',
        'Custom integrations',
        'Unlimited storage',
        'Advanced security',
        'API access'
      ],
      highlighted: false,
      buttonColor: 'bg-purple-600'
    }
  ];

  return (
    <Case>
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-8 w-8 text-yellow-400 mr-2" />
            <h1 className="text-4xl font-bold">Premium Features</h1>
          </div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mt-4">
            Unlock the full potential of our platform with premium features tailored to your needs
          </p>
          
          {/* Billing Toggle */}
          <div className="mt-10 flex items-center justify-center">
            <div className="bg-gray-800 p-1 rounded-lg inline-flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'monthly' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'annual' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Annual <span className="text-xs text-green-400">Save 20%</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div 
              key={index}
              className={`rounded-2xl p-8 backdrop-blur-sm transition-all transform hover:-translate-y-1 ${
                plan.highlighted 
                  ? 'bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500 shadow-lg shadow-blue-500/20' 
                  : 'bg-gray-800/50 border border-gray-700'
              }`}
            >
              <div className="flex items-center mb-4">
                {plan.icon}
                <h3 className="text-xl font-bold ml-2">{plan.name}</h3>
                {plan.highlighted && (
                  <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                    Popular
                  </span>
                )}
              </div>
              
              <div className="mb-6">
                <div className="flex items-end">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-400 ml-2">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                </div>
                <p className="text-gray-400 mt-2">{plan.description}</p>
              </div>
              
              <ul className="mb-8 space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button 
                className={`${plan.buttonColor} w-full py-3 rounded-lg font-medium hover:opacity-90 transition-opacity`}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-gray-400">
            Have questions? <a href="#" className="text-blue-400 hover:underline">Contact our sales team</a>
          </p>
          <div className="flex justify-center space-x-8 mt-4">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-gray-300">30-day money back</span>
            </div>
            <div className="flex items-center">
              <Zap className="h-5 w-5 text-green-400 mr-2" />
              <span className="text-gray-300">Instant access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    </Case>
  );
}