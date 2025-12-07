# Catalog Limits & Plan-Based Restrictions

## Overview

WaveGroww now implements comprehensive plan-based catalog (product) limits across all pricing tiers. Each plan has specific limits on the number of products users can create, along with feature restrictions.

## Pricing Plans & Catalog Limits

### 🟢 Starter Plan (₹999/month)

**Catalog Limit: 10 products**

#### Features

- Maximum 10 product catalogs
- Basic product fields only (Name, Price, Image, Description)
- Basic analytics dashboard
- Single user only
- 5 WhatsApp templates/month
- No AI assistant
- Up to 2,000 messages/month
- 1 WhatsApp number
- Email + chat support

#### Restrictions

- ❌ No variants, tags, or offer pricing
- ❌ No bulk upload
- ❌ No AI descriptions
- ❌ No role-based access
- ❌ No advanced analytics
- ❌ No API access

---

### 🔵 Growth Plan (₹1,699/month) ⭐ MOST POPULAR

**Catalog Limit: 20 products**

#### Features

- Maximum 20 product catalogs
- Advanced product fields (Variants, Tags, Offer Price)
- Customer notes & labels
- Priority chat automation
- AI reply suggestions
- Auto-follow up messages
- Up to 5,000 messages/month
- 3 WhatsApp numbers
- Up to 3 team members
- Priority support
- Campaign scheduling + templates

#### Includes

- ✅ Product variants
- ✅ Customer management
- ✅ AI automations
- ❌ No bulk upload
- ❌ No AI descriptions
- ❌ No role-based access

---

### 🟣 Agency Plan (₹3,999/month)

**Catalog Limit: 100 products**

#### Features

- Maximum 100 product catalogs
- **Bulk upload (Excel/CSV)**
- **AI auto-description generator**
- **Role-based access** (Manager / Staff)
- Team roles & permissions
- Advanced sales analytics
- Inbox automation workflows
- Product analytics dashboard
- Up to 15,000 messages/month
- 10 WhatsApp numbers
- Up to 10 team members
- 24/7 priority support
- API & webhooks access

#### Includes

- ✅ Everything from Growth
- ✅ Bulk operations
- ✅ AI-powered features
- ✅ Advanced team management
- ✅ Full API access

---

### 🟡 Enterprise Plan (₹8,999+/month)

**Catalog Limit: Custom (200 / 500 / Unlimited)**

#### Features

- **Custom catalog limit** (configurable per client)
- Dedicated account manager
- Custom workflow automation
- Team size as needed
- API access + Webhooks
- WhatsApp approved green-tick support
- **White-label** (remove WaveGroww branding)
- Dedicated server resources
- Priority WhatsApp approval
- Up to 40,000+ messages/month
- Unlimited WhatsApp numbers
- Custom integrations & SLAs

#### Includes

- ✅ Everything from Agency
- ✅ White-label option
- ✅ Custom limits
- ✅ Dedicated support
- ✅ Priority everything

---

## Technical Implementation

### 1. Database Schema

```typescript
// pricingPlans table includes limits field
limits: {
  catalogs: 10 | 20 | 100 | 999999,
  messages: number,
  templates: number,
  teamMembers: number,
  aiAssistant: boolean,
  productFields: 'basic' | 'advanced' | 'full',
  bulkUpload: boolean,
  aiDescriptions: boolean,
  roleBasedAccess: boolean,
  // ... more features
}
```

### 2. Helper Functions

Located in `src/lib/plan-limits.ts`:

```typescript
// Check if user can add a catalog
const { allowed, reason, currentCount, limit } = await canAddCatalog(userId);

// Get user's plan limits
const { planId, planName, limits } = await getUserPlanLimits(userId);

// Check feature access
const hasAccess = await canAccessFeature(userId, 'bulkUpload');

// Get usage stats
const stats = await getCatalogUsageStats(userId);
// Returns: { used, limit, percentage, isUnlimited }
```

### 3. API Protection

The `/api/products` POST endpoint is protected:

```typescript
// Before creating a product
const catalogCheck = await canAddCatalog(user.id);
if (!catalogCheck.allowed) {
  return NextResponse.json({
    error: catalogCheck.reason,
    code: "CATALOG_LIMIT_REACHED",
    details: {
      current: catalogCheck.currentCount,
      limit: catalogCheck.limit,
      upgradeRequired: true
    }
  }, { status: 403 });
}
```

### 4. UI Components

#### UpgradePrompt Component

```tsx
import { UpgradePrompt } from '@/components/UpgradePrompt';

<UpgradePrompt
  title="Catalog Limit Reached"
  message="You've reached your limit of 10 products. Upgrade to add more!"
  currentLimit={10}
  maxLimit={10}
  feature="catalogs"
  variant="inline" // or "banner" or "modal"
/>
```

#### Usage Stats Card

```tsx
import { UsageStatsCard } from '@/components/UpgradePrompt';

<UsageStatsCard
  used={8}
  limit={10}
  label="Product Catalogs"
  description="Number of products in your catalog"
/>
```

#### Catalog Limit Badge

```tsx
import { CatalogLimitBadge } from '@/components/UpgradePrompt';

<CatalogLimitBadge current={8} limit={10} />
```

### 5. Frontend Usage

```typescript
// Fetch user's plan and usage
const response = await fetch('/api/plan/usage');
const { plan, usage } = await response.json();

console.log(plan.limits.catalogs); // 10, 20, 100, or 999999
console.log(usage.catalogs.used); // Current count
console.log(usage.catalogs.percentage); // 80%
```

---

## Enforcement Logic

### Product Creation Flow

1. User clicks "Add New Product"
2. API checks `canAddCatalog(userId)`
3. If limit reached:
   - ❌ **Block action**
   - Show error: "You have reached your catalog limit of X. Please upgrade."
   - Display upgrade prompt with current plan vs available plans
4. If within limit:
   - ✅ **Allow creation**
   - Show remaining quota (e.g., "3 of 10 products used")

### Admin Override (Enterprise)

Enterprise customers can have custom limits set via admin panel:

```typescript
// Admin can update enterprise limit
await db.update(subscriptions)
  .set({ customLimits: { catalogs: 500 } })
  .where(eq(subscriptions.userId, enterpriseUserId));
```

---

## Feature Gating

### Product Fields

Different plans have access to different fields:

#### Basic Fields (Starter)

- Name, Price, Image, Description, Stock, Category

#### Advanced Fields (Growth+)

- Variants, Tags, Offer Price, Compare At Price, Discount %

#### Full Fields (Agency+)

- Everything + Bulk Upload, AI Descriptions, Advanced SEO

### Implementation Example

```typescript
const { limits } = await getUserPlanLimits(userId);

// In UI
{limits.productFields === 'full' && (
  <div>
    <label>AI Description Generator</label>
    <button onClick={generateWithAI}>Generate</button>
  </div>
)}

{limits.productFields === 'basic' && (
  <UpgradePrompt
    message="Upgrade to Growth to access product variants!"
  />
)}
```

---

## Premium Feature Access

### Bulk Upload (Agency+)

```tsx
const canBulkUpload = await canAccessFeature(userId, 'bulkUpload');

if (!canBulkUpload) {
  return <UpgradePrompt 
    message="Bulk upload is available on Agency plan and above" 
  />;
}
```

### AI Features

```tsx
const hasAI = await canAccessFeature(userId, 'aiAssistant');

// Auto-hide AI buttons for Starter users
{hasAI && (
  <button>Generate AI Description</button>
)}
```

---

## Migration & Seed Data

### Running Seeds

```bash
cd src/db
npx tsx seed-config.ts
```

This will populate:

- ✅ 4 pricing plans with all limits
- ✅ Feature flags
- ✅ Content settings

---

## Testing

### Test Scenarios

1. **Starter User Creates 11th Product**
   - ❌ Should be blocked
   - Should see upgrade prompt
   - Error code: `CATALOG_LIMIT_REACHED`

2. **Growth User Creates 21st Product**
   - ❌ Should be blocked
   - Should see upgrade to Agency prompt

3. **Enterprise User Creates 1000th Product**
   - ✅ Should succeed (if custom limit allows)

4. **Free Trial User**
   - Gets 5 catalogs maximum
   - All premium features disabled

---

## Future Enhancements

### Potential Additional Restrictions

#### Starter Plan

- Limited WhatsApp templates (5/month) ✅ Implemented
- No AI assistant ✅ Implemented
- Watermark on catalog PDFs

#### Growth Plan

- Auto-follow up messages ✅ Implemented
- Customer notes & labels ✅ Implemented

#### Agency Plan

- Workflow automation ✅ Implemented
- Advanced analytics ✅ Implemented

#### Enterprise Plan

- White-label branding ✅ Implemented
- Priority approval queue ✅ Implemented
- Dedicated resources ✅ Implemented

---

## Error Handling

### Example Error Responses

#### Catalog Limit Reached

```json
{
  "error": "You have reached your catalog limit of 10. Please upgrade your plan to add more products.",
  "code": "CATALOG_LIMIT_REACHED",
  "details": {
    "current": 10,
    "limit": 10,
    "upgradeRequired": true
  }
}
```

#### Feature Not Available

```json
{
  "error": "Bulk upload is only available on Agency plan and above",
  "code": "FEATURE_UNAVAILABLE",
  "requiredPlan": "agency",
  "currentPlan": "growth"
}
```

---

## Support & Upgrade Flow

### When User Hits Limit

1. **Show Inline Banner**

   ```tsx
   <UpgradePrompt variant="banner" ... />
   ```

2. **Block New Product Button**

   ```tsx
   <button disabled={!canAdd}>
     Add Product
   </button>
   {!canAdd && <p>Upgrade to add more products</p>}
   ```

3. **Redirect to Pricing**
   - Highlight recommended plan (next tier up)
   - Show feature comparison
   - One-click upgrade

---

## Admin Tools

### View User Limits

```typescript
// Admin endpoint to check any user's limits
GET /api/admin/users/:userId/limits

Response:
{
  "userId": "...",
  "plan": "starter",
  "limits": { ... },
  "usage": {
    "catalogs": { used: 8, limit: 10 }
  }
}
```

### Override Limits (Enterprise Only)

```typescript
// Admin can set custom limits for enterprise
PATCH /api/admin/subscriptions/:id

Body:
{
  "customLimits": {
    "catalogs": 500
  }
}
```

---

## Summary

✅ **Implemented:**

- 4 pricing tiers with distinct catalog limits
- Automatic enforcement on product creation
- UI components for upgrade prompts
- API protection and error handling
- Usage tracking and statistics
- Feature gating system

🎯 **Ready to Use:**

- All limits are enforced server-side
- Frontend components ready for integration
- Database schema includes all necessary fields
- Seed data includes complete configuration

📈 **Next Steps:**

1. Run seed script to populate pricing plans
2. Integrate UpgradePrompt in catalog page
3. Add usage stats to dashboard
4. Test each plan's restrictions
5. Set up payment integration for upgrades
