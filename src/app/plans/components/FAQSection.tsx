"use client";

import { memo } from 'react';
import dynamic from 'next/dynamic';

// Lazy load the ChevronDown icon
const ChevronDown = dynamic(
  () => import('lucide-react').then(mod => mod.ChevronDown),
  { ssr: false }
);

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  expandedIndex: number | null;
  onToggle: (index: number) => void;
}

const FAQSection = memo(({ faqs, expandedIndex, onToggle }: FAQSectionProps) => {
  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div key={index} className="border-b border-border pb-4">
          <button
            onClick={() => onToggle(index)}
            className="w-full flex justify-between items-center text-left py-2"
            aria-expanded={expandedIndex === index}
            aria-controls={`faq-${index}`}
          >
            <h4 className="font-medium text-left">{faq.question}</h4>
            <ChevronDown
              className={`w-5 h-5 transition-transform flex-shrink-0 ${
                expandedIndex === index ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedIndex === index && (
            <div id={`faq-${index}`} className="mt-2 text-muted-foreground">
              {faq.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  );
});

FAQSection.displayName = 'FAQSection';

export default FAQSection;
