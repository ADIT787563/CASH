# 🚀 Plan-Based Feature Implementation Guide

## Quick Integration Checklist

### ✅ Step 1: Run Database Seeds

```bash
cd src/db
npx tsx seed-config.ts
```

This populates your pricing plans with all the limits and features.

---

### ✅ Step 2: Update Catalog Page

Replace the "Add Product" button in `src/app/catalog/page.tsx`:

**Before:**

```tsx
<Link
  href="/catalog/products/new"
  className="px-6 py-3 bg-primary..."
>
  <Plus className="w-5 h-5" />
  Add Product
</Link>
```

**After:**

```tsx
import { AddProductButton, CatalogHeader } from '@/components/catalog/PlanGatedFeatures';

// At the top of your content (after the page header):
<CatalogHeader />

// Replace the Add Product button:
<AddProductButton />
```

---

### ✅ Step 3: Add AI Feature Gating

Replace the AI Catalog Builder section:

**Before:**

```tsx
<div className="mt-8 glass-card...">
  {/* AI Builder CTA */}
</div>
```

**After:**

```tsx
import { AIFeaturesSection } from '@/components/catalog/PlanGatedFeatures';

<AIFeaturesSection />
```

---

### ✅ Step 4: Add Bulk Upload (Optional)

In the toolbar section, add:

```tsx
import { BulkUploadButton } from '@/components/catalog/PlanGatedFeatures';

// In the toolbar alongside Add Product:
<div className="flex gap-3">
  <BulkUploadButton />
  <AddProductButton />
</div>
```

---

### ✅ Step 5: Gate Analytics Page

For `src/app/analytics/page.tsx`:

```tsx
import { FeatureGate } from '@/components/FeatureGate';

export default function AnalyticsPage() {
  return (
    <ProtectedPage>
      <FeatureGate 
        feature="advancedAnalytics"
        upgradeMessage="Advanced analytics is available on Agency plan and above"
      >
        <AnalyticsContent />
      </FeatureGate>
    </ProtectedPage>
  );
}
```

---

### ✅ Step 6: Gate Team Management

For `src/app/settings/page.tsx` or team management sections:

```tsx
import { FeatureGate, PlanBadge } from '@/components/FeatureGate';

<FeatureGate feature="roleBasedAccess">
  <TeamManagementSection />
</FeatureGate>

// Or show badge:
<h3>
  Team Management 
  <PlanBadge requiredPlan="agency" />
</h3>
```

---

### ✅ Step 7: Gate API Access

In your API/webhooks settings:

```tsx
<FeatureGate 
  feature="apiAccess"
  upgradeMessage="API access is available on Agency plan and above"
>
  <div>
    <h3>API Keys</h3>
    <p>Your API key: {apiKey}</p>
  </div>
</FeatureGate>
```

---

### ✅ Step 8: Show Plan Info in Dashboard

Add to `src/app/dashboard/page.tsx`:

```tsx
import { usePlan, useCatalogLimit } from '@/hooks/usePlanUsage';
import { UsageStatsCard } from '@/components/UpgradePrompt';

function DashboardContent() {
  const { planName } = usePlan();
  const catalogStats = useCatalogLimit();

  return (
    <div>
      <div className="mb-4">
        <p className="text-sm text-muted-foreground">
          Current Plan: <span className="font-semibold">{planName}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <UsageStatsCard
          used={catalogStats.used}
          limit={catalogStats.limit}
          isUnlimited={catalogStats.isUnlimited}
          label="Product Catalogs"
          description="Number of products in your catalog"
        />
        {/* Add more usage stats as needed */}
      </div>
    </div>
  );
}
```

---

## Feature-Specific Implementation

### 📦 Product Fields Based on Plan

In product form (`src/app/catalog/products/new/page.tsx`):

```tsx
import { useFeatureAccess } from '@/hooks/usePlanUsage';
import { FeatureGate } from '@/components/FeatureGate';

function ProductForm() {
  const { hasAccess: advancedFields } = useFeatureAccess('productFields');

  return (
    <form>
      {/* Basic fields - always available */}
      <input name="name" placeholder="Product Name" />
      <input name="price" placeholder="Price" />
      <textarea name="description" placeholder="Description" />

      {/* Advanced fields - Growth+ */}
      <FeatureGate feature="productFields">
        <div>
          <label>Product Variants</label>
          <VariantsInput />
        </div>
        <div>
          <label>Tags</label>
          <TagsInput />
        </div>
        <div>
          <label>Offer Price</label>
          <input name="offerPrice" />
        </div>
      </FeatureGate>

      {/* AI Description - Agency+ */}
      <FeatureGate feature="aiDescriptions">
        <button type="button" onClick={generateAIDescription}>
          <Sparkles /> Generate AI Description
        </button>
      </FeatureGate>
    </form>
  );
}
```

---

### 👥 Team Size Limits

For team invitation/management:

```tsx
import { usePlanUsage } from '@/hooks/usePlanUsage';

function TeamManagement() {
  const { data } = usePlanUsage();
  const maxTeamMembers = data?.plan.limits.teamMembers || 1;
  const currentMembers = 2; // Fetch from your team API

  const canInvite = maxTeamMembers === -1 || currentMembers < maxTeamMembers;

  return (
    <div>
      <h3>Team Members ({currentMembers}/{maxTeamMembers === -1 ? '∞' : maxTeamMembers})</h3>
      
      <button disabled={!canInvite}>
        {canInvite ? 'Invite Member' : 'Upgrade to Add More Members'}
      </button>

      {!canInvite && (
        <UpgradePrompt
          message="You've reached your team size limit"
          currentLimit={currentMembers}
          maxLimit={maxTeamMembers}
          feature="team members"
        />
      )}
    </div>
  );
}
```

---

### 📝 Template Limits (Monthly)

For WhatsApp templates:

```tsx
import { usePlanUsage } from '@/hooks/usePlanUsage';

function TemplatesPage() {
  const { data } = usePlanUsage();
  const monthlyLimit = data?.plan.limits.templates || 3;
  const usedThisMonth = 2; // Fetch from API

  const canCreate = usedThisMonth < monthlyLimit;

  return (
    <div>
      <div className="mb-4">
        <p>Templates Used This Month: {usedThisMonth}/{monthlyLimit}</p>
        <div className="h-2 bg-muted rounded-full">
          <div 
            className="h-full bg-primary"
            style={{ width: `${(usedThisMonth/monthlyLimit) * 100}%` }}
          />
        </div>
      </div>

      <button disabled={!canCreate}>
        {canCreate ? 'Create Template' : 'Monthly Limit Reached'}
      </button>
    </div>
  );
}
```

---

## Common Patterns

### Pattern 1: Conditional Rendering

```tsx
const { hasAccess } = useFeatureAccess('bulkUpload');

{hasAccess && <BulkUploadButton />}
```

### Pattern 2: Feature Gate Wrapper

```tsx
<FeatureGate feature="aiAssistant">
  <AIFeaturesSection />
</FeatureGate>
```

### Pattern 3: Button with Lock

```tsx
import { FeatureButton } from '@/components/FeatureGate';

<FeatureButton 
  feature="apiAccess"
  onClick={generateAPIKey}
>
  Generate API Key
</FeatureButton>
```

### Pattern 4: Show Upgrade Modal

```tsx
const { canAdd, used, limit } = useCatalogLimit();

{!canAdd && (
  <UpgradePrompt
    variant="modal"
    title="Catalog Limit Reached"
    message="Upgrade to add more products!"
    currentLimit={used}
    maxLimit={limit}
  />
)}
```

---

## Testing Scenarios

### Test 1: Starter User Creates 11th Product

1. Login with starter plan user
2. Create 10 products
3. Try to create 11th product
4. **Expected**: API returns error, button disabled, upgrade prompt shown

### Test 2: Growth User Accesses AI Features

1. Login with growth plan user
2. Go to catalog page
3. AI section should be accessible
4. **Expected**: Can click "Upload & Generate"

### Test 3: Starter User Tries Bulk Upload

1. Login with starter plan user
2. Look for bulk upload button
3. **Expected**: Button shown with lock icon, click shows upgrade modal

### Test 4: Agency User Full Access

1. Login with agency plan user
2. Check all features
3. **Expected**: Everything accessible, no limitations

---

## API Error Handling

When hitting limits, your API will return:

```json
{
  "error": "You have reached your catalog limit of 10. Please upgrade your plan.",
  "code": "CATALOG_LIMIT_REACHED",
  "details": {
    "current": 10,
    "limit": 10,
    "upgradeRequired": true
  }
}
```

Handle in your frontend:

```tsx
try {
  const response = await fetch('/api/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  });

  if (!response.ok) {
    const error = await response.json();
    
    if (error.code === 'CATALOG_LIMIT_REACHED') {
      // Show upgrade modal
      setShowUpgradeModal(true);
      toast.error(error.error);
    } else {
      toast.error(error.error);
    }
  }
} catch (err) {
  toast.error('Failed to create product');
}
```

---

## Customization

### Custom Upgrade Messages

```tsx
<FeatureGate 
  feature="bulkUpload"
  upgradeMessage="Bulk upload CSV files with up to 1000 products at once - available on Agency plan!"
>
  <BulkUploadSection />
</FeatureGate>
```

### Custom Fallback UI

```tsx
<FeatureGate 
  feature="advancedAnalytics"
  fallback={
    <div className="text-center p-8">
      <Lock className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
      <h3>Advanced Analytics</h3>
      <p>Upgrade to Agency to unlock detailed insights</p>
      <Link href="/pricing">View Plans</Link>
    </div>
  }
>
  <AdvancedAnalyticsDashboard />
</FeatureGate>
```

---

## Summary

### Files Created

- ✅ `src/hooks/usePlanUsage.ts` - React hooks for plan access
- ✅ `src/components/FeatureGate.tsx` - Gating components
- ✅ `src/components/catalog/PlanGatedFeatures.tsx` - Catalog-specific components
- ✅ `src/lib/plan-limits.ts` - Backend helpers
- ✅ `src/app/api/plan/usage/route.ts` - Usage API
- ✅ `src/components/UpgradePrompt.tsx` - UI components

### Integration Points

1. **Catalog Page** - Add header, button, AI section
2. **Product Form** - Gate advanced fields
3. **Analytics** - Gate entire page or features
4. **Team Management** - Gate role-based access
5. **Settings** - Gate API access, webhooks
6. **Dashboard** - Show usage stats
7. **Templates** - Enforce monthly limits

### Next Steps

1. Run seed script
2. Update catalog page with new components
3. Add gates to other features
4. Test each plan thoroughly
5. Monitor upgrade conversion rates

🎯 **Everything is ready - just plug in the components!**
