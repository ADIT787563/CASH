'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

// Plan details matching the ones from the pricing page
const PLANS = {
  basic: {
    name: 'Basic',
    price: 999,
    features: [
      'Up to 20 products',
      'Single image per product',
      '250 automated replies/mo',
      '1 WhatsApp Number linking',
      'Basic order form',
      'Basic Analytics'
    ]
  },
  growth: {
    name: 'Growth',
    price: 1699,
    features: [
      'Up to 40 products',
      'Variants & Multi-image support',
      '800 automated replies/m',
      'Connect up to 3 WhatsApp Numbers',
      'Custom checkout fields',
      'Advanced Invoice (GST, PDF)'
    ]
  },
  pro: {
    name: 'Pro / Agency',
    price: 3999,
    features: [
      'Up to 130 products',
      'Bulk upload (CSV/Excel)',
      'Unlimited automated replies',
      'AI-powered auto-reply',
      'Connect up to 10 WhatsApp numbers',
      'Branded Invoices'
    ]
  },
  enterprise: {
    name: 'Enterprise',
    price: 8999,
    features: [
      'Custom catalog limit',
      'AI Chatbot (NLP) & Smart Replies',
      'Multi-language support',
      'Unlimited WhatsApp numbers',
      'Fully customizable checkout API',
      'White-label & Custom Invoices'
    ]
  }
};

export default function InvoicePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [planId, setPlanId] = useState('');
  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const plan = searchParams.get('plan');
    const billing = searchParams.get('billing');
    
    if (plan && PLANS[plan as keyof typeof PLANS]) {
      setPlanId(plan);
      setIsYearly(billing === 'yearly');
    } else {
      // Redirect to pricing if no valid plan is provided
      router.push('/plans');
      return;
    }
    
    setIsLoading(false);
  }, [searchParams, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const plan = PLANS[planId as keyof typeof PLANS];
  const subtotal = isYearly ? plan.price * 12 * 0.8 : plan.price; // 20% discount for yearly
  const gst = subtotal * 0.18; // 18% GST
  const total = subtotal + gst;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-8">
          <Link href="/plans" className="flex items-center text-blue-600 hover:text-blue-800">
            <ArrowLeft className="h-5 w-5 mr-1" /> Back to Plans
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 ml-4">Order Summary</h1>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h2 className="text-xl font-semibold text-gray-900">{plan.name} Plan</h2>
            <p className="mt-1 text-gray-500">
              {isYearly ? 'Yearly Billing (20% OFF)' : 'Monthly Billing'}
            </p>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Plan Includes:</h3>
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 border-t border-gray-200 pt-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan Price ({isYearly ? 'Yearly' : 'Monthly'})</span>
                  <span className="font-medium">₹{plan.price.toLocaleString()}{isYearly ? ' × 12' : ''}</span>
                </div>
                {isYearly && (
                  <div className="flex justify-between text-green-600">
                    <span>Yearly Discount (20%)</span>
                    <span>-₹{(plan.price * 12 * 0.2).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-gray-200 pt-2">
                  <span className="font-medium">Subtotal</span>
                  <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (18%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-2 text-lg font-bold">
                  <span>Total</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => {
                    // Here you would typically integrate with a payment gateway
                    alert('Redirecting to payment gateway...');
                  }}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Proceed to Payment
                </button>
                <p className="mt-3 text-center text-sm text-gray-500">
                  Your subscription will automatically renew on {new Date(new Date().setMonth(new Date().getMonth() + (isYearly ? 12 : 1))).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Need help?</h3>
          <p className="text-gray-600 mb-4">
            If you have any questions about your order, please contact our support team at{' '}
            <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
              support@example.com
            </a>
          </p>
          <p className="text-sm text-gray-500">
            By completing your purchase, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:underline">Terms of Service</a> and{' '}
            <a href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
