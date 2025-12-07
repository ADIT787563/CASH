import { ArrowRight } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  faqs: FAQItem[];
  expandedFAQ: number | null;
  toggleFAQ: (index: number) => void;
}

export default function FAQSection({ faqs, expandedFAQ, toggleFAQ }: FAQSectionProps) {
  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="border border-border rounded-lg overflow-hidden transition-all"
        >
          <button
            onClick={() => toggleFAQ(index)}
            className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
            aria-expanded={expandedFAQ === index}
            aria-controls={`faq-${index}`}
          >
            <span className="font-medium text-left">{faq.question}</span>
            <span 
              className={`transition-transform ${expandedFAQ === index ? 'rotate-90' : ''} ml-4 flex-shrink-0`}
              aria-hidden="true"
            >
              <ArrowRight className="w-5 h-5" />
            </span>
          </button>
          
          <div
            id={`faq-${index}`}
            className={`px-4 pb-4 pt-0 overflow-hidden transition-all duration-300 ${
              expandedFAQ === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
            role="region"
            aria-labelledby={`faq-${index}-button`}
          >
            <p className="text-muted-foreground">{faq.answer}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
