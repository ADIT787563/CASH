# 🔍 How Plan Recognition Works

## Complete Flow: From Database to UI

### 📊 Database Structure

```
┌─────────────┐         ┌──────────────────┐         ┌───────────────┐
│   user      │         │  subscriptions   │         │ pricingPlans  │
├─────────────┤         ├──────────────────┤         ├───────────────┤
│ id          │◄────────│ userId           │         │ planId        │
│ email       │         │ planId           │────────►│ planName      │
│ name        │         │ status           │         │ monthlyPrice  │
└─────────────┘         │ provider         │         │ limits        │
                        │ currentPeriodEnd │         │ features      │
                        └──────────────────┘         └───────────────┘
```

When a user purchases a plan:

1. Record created in `subscriptions` table
2. Links `user.id` → `subscriptions.userId`
3. Links `subscriptions.planId` → `pricingPlans.planId`

---

## 🔐 Step-by-Step: How the System Knows

### 1️⃣ User Logs In

```typescript
// When user authenticates
// src/lib/auth.ts (or your auth file)

export async function getCurrentUser(request: NextRequest) {
  // Get session/token
  const session = await getServerSession();
  
  // Returns user object
  return {
    id: session.user.id,      // "oXCIwZONJx9D8kNWRJL805P7akdAllHV"
    email: session.user.email  // "wavegroww@gmail.com"
  };
}
```

### 2️⃣ Backend Fetches Plan

```typescript
// src/lib/plan-limits.ts

export async function getUserPlanLimits(userId: string) {
  // Step 1: Find subscription for this user
  const subscription = await db
    .select()
    .from(subscriptions)
    .where(and(
      eq(subscriptions.userId, userId),
      eq(subscriptions.status, 'active')
    ))
    .limit(1);

  // Step 2: No subscription? They're on free plan
  if (!subscription.length) {
    return {
      planId: 'free',
      planName: 'Free Trial',
      limits: { catalogs: 5, teamMembers: 1, ... }
    };
  }

  // Step 3: Get the plan details
  const plan = await db
    .select()
    .from(pricingPlans)
    .where(eq(pricingPlans.planId, subscription[0].planId))
    .limit(1);

  // Step 4: Return plan with limits
  return {
    planId: subscription[0].planId,    // "agency"
    planName: plan[0].planName,        // "Agency"
    limits: plan[0].limits             // { catalogs: 100, ... }
  };
}
```

**Example Result:**

```json
{
  "planId": "agency",
  "planName": "Agency",
  "limits": {
    "catalogs": 100,
    "teamMembers": 10,
    "aiAssistant": true,
    "bulkUpload": true,
    "apiAccess": true
  }
}
```

### 3️⃣ API Endpoint Enforces Limits

```typescript
// src/app/api/products/route.ts

export async function POST(request: NextRequest) {
  // Get authenticated user
  const user = await getCurrentUser(request);
  
  // Check if they can add a catalog
  const { allowed, reason, currentCount, limit } = await canAddCatalog(user.id);
  
  if (!allowed) {
    return NextResponse.json({
      error: reason,  // "You have reached your catalog limit of 10"
      code: "CATALOG_LIMIT_REACHED",
      details: { current: 10, limit: 10 }
    }, { status: 403 });
  }
  
  // Continue with creation...
}
```

**How `canAddCatalog()` works:**

```typescript
export async function canAddCatalog(userId: string) {
  // 1. Get user's plan limits
  const { limits } = await getUserPlanLimits(userId);
  
  // 2. Count current products
  const current = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.userId, userId));
  
  const currentCount = current[0]?.count || 0;
  const limit = limits.catalogs;  // e.g., 10 (starter), 100 (agency)
  
  // 3. Check if they can add more
  if (limit === -1) {  // Unlimited (Enterprise)
    return { allowed: true, currentCount, limit: -1 };
  }
  
  if (currentCount >= limit) {
    return {
      allowed: false,
      reason: `You have reached your limit of ${limit} products`,
      currentCount,
      limit
    };
  }
  
  return { allowed: true, currentCount, limit };
}
```

### 4️⃣ Frontend Gets Plan Info

```typescript
// src/hooks/usePlanUsage.ts

export function usePlanUsage() {
  useEffect(() => {
    // Call API to get plan info
    fetch('/api/plan/usage')
      .then(res => res.json())
      .then(data => {
        setData(data);
        // data = {
        //   plan: { id: "agency", name: "Agency", limits: {...} },
        //   usage: { catalogs: { used: 8, limit: 100 } }
        // }
      });
  }, []);
}
```

### 5️⃣ UI Displays Plan

```typescript
// Component usage
export function Header() {
  const { planName } = usePlan();  // "Agency"
  const { used, limit } = useCatalogLimit();  // used: 8, limit: 100
  
  return (
    <div>
      <p>{planName}</p>  {/* Shows "Agency" */}
      <p>{used} / {limit} products</p>  {/* Shows "8 / 100 products" */}
    </div>
  );
}
```

---

## 🔄 Complete Request Flow

### Example: User tries to add a product

```
1. User clicks "Add Product" button
   ↓
2. Frontend calls: POST /api/products
   ↓
3. Backend: getCurrentUser(request)
   → Returns: { id: "oXCIwZONJx9D...", email: "wavegroww@gmail.com" }
   ↓
4. Backend: canAddCatalog(user.id)
   ├─→ getUserPlanLimits(user.id)
   │   ├─→ Query subscriptions table
   │   │   WHERE userId = "oXCIwZONJx..." AND status = "active"
   │   │   RESULT: { planId: "agency", ... }
   │   │
   │   └─→ Query pricingPlans table
   │       WHERE planId = "agency"
   │       RESULT: { limits: { catalogs: 100, ... } }
   │
   └─→ Count products
       SELECT COUNT(*) FROM products WHERE userId = "oXCIwZONJx..."
       RESULT: 8
   
   Compare: 8 < 100 ✅ ALLOWED
   ↓
5. Create product in database
   ↓
6. Return success to frontend
```

### Example: User on Starter plan hits limit

```
1. User clicks "Add Product" (has 10 already)
   ↓
2. POST /api/products
   ↓
3. canAddCatalog(user.id)
   ├─→ getUserPlanLimits → { planId: "starter", limits: { catalogs: 10 } }
   └─→ Count products → 10
   
   Compare: 10 >= 10 ❌ BLOCKED
   ↓
4. Return error:
   {
     error: "You have reached your catalog limit of 10",
     code: "CATALOG_LIMIT_REACHED",
     details: { current: 10, limit: 10, upgradeRequired: true }
   }
   ↓
5. Frontend shows upgrade prompt
```

---

## 🎯 Key Points

### Database Tables

1. **`subscriptions`** - Stores who has which plan
2. **`pricingPlans`** - Stores plan details and limits
3. **`user`** - User information

### Recognition Process

1. ✅ User authenticates → Get `userId`
2. ✅ Query subscriptions → Get `planId`
3. ✅ Query pricingPlans → Get `limits`
4. ✅ Enforce limits → Allow/Block actions

### Why It Works

- **Server-side**: Cannot be bypassed (enforced in API)
- **Real-time**: Always checks current subscription status
- **Accurate**: Direct database queries
- **Secure**: User can't manipulate their plan

---

## 🔍 How to Check a User's Plan

### Method 1: Database Query

```sql
SELECT 
  u.email,
  s.planId,
  s.status,
  p.planName
FROM user u
JOIN subscriptions s ON s.userId = u.id
JOIN pricingPlans p ON p.planId = s.planId
WHERE u.email = 'wavegroww@gmail.com';
```

### Method 2: Admin Script

```bash
npx tsx src/db/verify-subscription.ts
```

### Method 3: API Endpoint

```bash
GET /api/plan/usage
Authorization: Bearer <token>

Response:
{
  "plan": {
    "id": "agency",
    "name": "Agency",
    "limits": { "catalogs": 100, ... }
  },
  "usage": {
    "catalogs": { "used": 8, "limit": 100 }
  }
}
```

### Method 4: Frontend Hook

```typescript
const { planId, planName } = usePlan();
console.log(planId);    // "agency"
console.log(planName);  // "Agency"
```

---

## 🛡️ Security

### How it's protected

1. **JWT/Session tokens** - Only authenticated users
2. **User ID binding** - Can only access their own plan
3. **Server-side checks** - Frontend can't fake it
4. **Database constraints** - Foreign keys ensure data integrity

### What happens if user manipulates frontend

```typescript
// Even if user changes this in browser console:
localStorage.setItem('plan', 'enterprise');

// API will still check database:
const realPlan = await getUserPlanLimits(user.id);  
// Returns: "agency" (from database, not localStorage)
```

---

## 📊 Plan Recognition Summary

```
User Login
    ↓
Get userId from session/token
    ↓
Query: subscriptions table
    WHERE userId = ? AND status = 'active'
    RESULT: planId = "agency"
    ↓
Query: pricingPlans table
    WHERE planId = "agency"
    RESULT: limits = { catalogs: 100, teamMembers: 10, ... }
    ↓
Store in memory/cache for request
    ↓
Use limits to:
    • Enforce API restrictions
    • Display available features
    • Show usage statistics
    • Gate premium features
```

---

## ✨ Your Setup (<wavegroww@gmail.com>)

**Database Record:**

```javascript
{
  userId: "oXCIwZONJx9D8kNWRJL805P7akdAllHV",
  planId: "agency",
  status: "active",
  currentPeriodEnd: "2026-11-29"
}
```

**System Recognizes:**

- ✅ You're on **Agency plan**
- ✅ You have **100 catalog limit**
- ✅ You can access **AI features**
- ✅ You can use **bulk upload**
- ✅ You get **10 team members**

**Enforced in every API call!**
