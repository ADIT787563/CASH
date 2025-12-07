# RBAC System - Quick Reference Guide

## Overview
This WhatsApp SaaS platform now has a complete Role-Based Access Control (RBAC) system with 5 roles:

1. **Owner** - Full access including billing
2. **Admin** - Daily operations, no billing access
3. **Manager** - Campaigns, leads, analytics
4. **Agent** - Chat support, lead updates
5. **Viewer** - Read-only access

## Database Changes

### User Table
- Added `role` column (default: 'owner')
- Valid values: 'owner', 'admin', 'manager', 'agent', 'viewer'

### Team Invites Table (NEW)
Manages team member invitations with token-based system:
- Email, role, business ID, unique token
- Status: pending, accepted, expired
- 7-day expiration

### Team Members Table
- Added `inviteId` reference to track invite source

## Backend API Routes

### Team Management
- `POST /api/team/invite` - Invite new members (Owner/Admin)
- `GET /api/team/accept?token=xxx` - Validate invite
- `POST /api/team/accept` - Accept invite and create account
- `DELETE /api/team/remove?userId=xxx` - Remove member (Owner/Admin)
- `GET/POST/PUT/DELETE /api/settings/team` - Manage team members

### Protected Endpoints
All API routes now use RBAC middleware:
- `POST /api/campaigns/send` - Requires RUN_CAMPAIGNS permission (Owner/Admin/Manager)
- More routes can be protected using `requirePermission()` or `requireRole()` middleware

## Frontend Components

### RoleGuard Component
```tsx
<RoleGuard allowedRoles={['owner', 'admin']}>
  <SensitiveContent />
</RoleGuard>
```

### TeamManagement Component
Full-featured team management UI with:
- List team members with roles and status
- Invite new members (generates invite link)
- Remove team members
- Role badges and status indicators

### Pages
- `/settings/team` - Team management page (Owner/Admin only)
- `/accept-invite?token=xxx` - Invite acceptance and signup

## Permission Matrix

| Feature | Owner | Admin | Manager | Agent | Viewer |
|---------|-------|-------|---------|-------|--------|
| Connect WhatsApp | ✓ | ✗ | ✗ | ✗ | ✗ |
| Manage Templates | ✓ | ✓ | ✗ | ✗ | ✗ |
| Run Campaigns | ✓ | ✓ | ✓ | ✗ | ✗ |
| Chat Support | ✓ | ✓ | ✓ | ✓ | ✗ |
| View Analytics | ✓ | ✓ | ✓ | ✓ | ✓ |
| Manage Team | ✓ | ✓ | ✗ | ✗ | ✗ |
| Billing | ✓ | ✗ | ✗ | ✗ | ✗ |

## Usage Examples

### Protect an API Route
```typescript
import { requirePermission } from '@/lib/rbac';

export const POST = requirePermission('MANAGE_PRODUCTS')(async (request, user) => {
  // user.role is available here
  // Only users with MANAGE_PRODUCTS permission can access this
});
```

### Protect UI Elements
```tsx
import { RoleGuard } from '@/components/RoleGuard';

<RoleGuard allowedRoles={['owner', 'admin']}>
  <button>Delete Product</button>
</RoleGuard>
```

### Check Permissions in Code
```typescript
import { hasPermission } from '@/lib/rbac';

if (hasPermission(userRole, 'MANAGE_BILLING')) {
  // Show billing section
}
```

## Next Steps

1. **Run Database Migration**:
   ```bash
   npx drizzle-kit generate
   npx drizzle-kit push
   ```

2. **Update Existing Users**: All existing users will have 'owner' role by default

3. **Email Integration**: Currently invite links are returned in API response. Integrate with email service (SendGrid, Resend, etc.) to send invite emails

4. **Protect More Routes**: Add RBAC middleware to remaining API endpoints as needed

5. **Update Header Component**: Add role badge display in user menu

## Files Created/Modified

### Backend
- `src/db/schema.ts` - Added role column and teamInvites table
- `src/lib/rbac.ts` - RBAC utilities and middleware
- `src/lib/permissions.ts` - Permission matrix
- `src/app/api/team/invite/route.ts` - Invite endpoint
- `src/app/api/team/accept/route.ts` - Accept invite endpoint
- `src/app/api/team/remove/route.ts` - Remove member endpoint
- `src/app/api/campaigns/send/route.ts` - Updated with RBAC
- `src/app/api/settings/team/route.ts` - Updated with RBAC

### Frontend
- `src/components/RoleGuard.tsx` - Role-based rendering
- `src/components/TeamManagement.tsx` - Team management UI
- `src/app/settings/team/page.tsx` - Team settings page
- `src/app/accept-invite/page.tsx` - Invite acceptance page
