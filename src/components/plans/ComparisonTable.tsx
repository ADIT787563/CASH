import { Check, X } from "lucide-react";

interface Feature {
  category: string;
  name: string;
  starter: boolean | string;
  growth: boolean | string;
  pro: boolean | string;
  scale: boolean | string;
  highlight?: boolean;
}

interface ComparisonTableProps {
  features: Feature[];
}

export default function ComparisonTable({ features }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-card rounded-xl overflow-hidden">
        <thead className="bg-muted/50 sticky top-0">
          <tr>
            <th className="text-left p-4 font-semibold min-w-[250px]">Feature</th>
            <th className="text-center p-4 font-semibold min-w-[150px]">Starter</th>
            <th className="text-center p-4 font-semibold bg-primary/5 min-w-[150px]">Growth</th>
            <th className="text-center p-4 font-semibold min-w-[150px]">Pro</th>
            <th className="text-center p-4 font-semibold min-w-[150px]">Scale</th>
          </tr>
        </thead>
        <tbody>
          {(() => {
            let lastCategory = '';
            return features.map((feature, index) => {
              const showCategoryHeader = feature.category && feature.category !== lastCategory;
              if (feature.category) lastCategory = feature.category;

              return (
                <tr key={index}>
                  {showCategoryHeader && (
                    <td colSpan={5} className="p-3 font-semibold text-sm uppercase tracking-wider bg-muted/20">
                      {feature.category}
                    </td>
                  )}
                  {!showCategoryHeader && (
                    <td className="p-4 text-sm font-medium">{feature.name}</td>
                  )}
                  {!showCategoryHeader && (['starter', 'growth', 'pro', 'scale'] as const).map((plan) => (
                    <td key={plan} className={`p-4 text-center ${feature.highlight ? 'bg-primary/5' : ''}`}>
                      {typeof feature[plan] === 'boolean' ? (
                        feature[plan] ? (
                          <Check className="w-5 h-5 text-primary mx-auto" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground/50 mx-auto" />
                        )
                      ) : (
                        <span className="text-sm">{String(feature[plan])}</span>
                      )}
                    </td>
                  ))}
                </tr>
              );
            });
          })()}
        </tbody>
      </table>
    </div>
  );
}
