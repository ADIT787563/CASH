"use client";

import { memo } from 'react';
import { Check } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface PlanCardProps {
  plan: {
    id: string;
    name: string;
    description: string;
    price: number;
    features: string[];
    isPopular?: boolean;
    isCustom?: boolean;
  };
  isPending: boolean;
  onStartTrial: () => void;
  onContactSales: () => void;
  session: any;
}

const PlanCard = memo(({
  plan,
  isPending,
  onStartTrial,
  onContactSales,
  session
}: PlanCardProps) => {
  const router = useRouter();

  const handleClick = () => {
    if (plan.isCustom) {
      onContactSales();
    } else if (plan.price === 0) {
      // Free plan - go to dashboard
      router.push('/dashboard');
    } else {
      // Paid plan - go to payment page
      router.push(`/payment/checkout?plan=${plan.id}`);
    }
  };

  return (
    <div
      className={`relative glass-card rounded-2xl p-6 hover:shadow-2xl transition-all hover:scale-105 ${plan.isPopular ? "border-2 border-primary" : ""
        }`}
    >
      {plan.isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="px-4 py-1 bg-gradient-to-r from-primary to-accent text-white text-xs font-bold rounded-full">
            MOST POPULAR
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-2xl font-bold">{plan.name}</h3>
        <p className="text-muted-foreground">{plan.description}</p>

        <div className="my-4">
          <span className="text-3xl font-bold">₹{plan.price}</span>
          <span className="text-muted-foreground">/month</span>
        </div>

        <button
          onClick={handleClick}
          disabled={!plan.isCustom && isPending}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${plan.isPopular
            ? "bg-gradient-to-r from-primary to-accent text-white"
            : "bg-card border border-border hover:bg-muted"
            }`}
        >
          {plan.isCustom ? "Contact Sales" : (plan.price === 0 ? "Start NOW" : "Subscribe Now")}
        </button>

        <ul className="space-y-2 mt-6">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2">
              <Check className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
});

PlanCard.displayName = 'PlanCard';

export default PlanCard;
