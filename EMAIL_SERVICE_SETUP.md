# Email Service Documentation

## Overview

This project uses SendGrid for sending transactional emails. The email service is integrated and ready to use.

## Setup Complete ✅

- ✅ SendGrid package installed (`@sendgrid/mail`)
- ✅ API route created (`/api/send-email`)
- ✅ Email utility library created (`src/lib/email.ts`)
- ✅ Environment variables configured

## Configuration

### Environment Variables

Add these to your `.env.local` file (already configured):

```env
SENDGRID_API_KEY=your_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Wavegroww
```

⚠️ **Important:** Replace `noreply@yourdomain.com` with a verified sender email in your SendGrid account.

## Usage Examples

### 1. Send Welcome Email (After User Registration)

```typescript
import { sendWelcomeEmail } from '@/lib/email';

// In your registration API route
export async function POST(req: NextRequest) {
  // ... user registration logic ...
  
  // Send welcome email
  await sendWelcomeEmail(user.email, user.name);
  
  return NextResponse.json({ success: true });
}
```

### 2. Send Team Invitation Email

```typescript
import { sendTeamInvitationEmail } from '@/lib/email';

// In your team invitation API route
const invitationLink = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`;

await sendTeamInvitationEmail(
  'newmember@example.com',
  'John Doe',
  'Marketing Team',
  invitationLink
);
```

### 3. Send Password Reset Email

```typescript
import { sendPasswordResetEmail } from '@/lib/email';

// In your password reset API route
const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;

await sendPasswordResetEmail(user.email, resetLink);
```

### 4. Send Custom Notification Email

```typescript
import { sendNotificationEmail } from '@/lib/email';

await sendNotificationEmail(
  user.email,
  'New Message Received',
  'You have a new WhatsApp message from a customer.',
  `${process.env.NEXT_PUBLIC_APP_URL}/inbox`,
  'View Message'
);
```

### 5. Send Custom Email (Direct API Call)

```typescript
import { sendEmail } from '@/lib/email';

await sendEmail({
  to: 'user@example.com',
  subject: 'Custom Subject',
  html: '<h1>Hello!</h1><p>This is a custom email.</p>',
  text: 'Hello! This is a custom email.', // Optional plain text version
});
```

### 6. Send to Multiple Recipients

```typescript
await sendEmail({
- 🔘 Call-to-action buttons
- 🎯 Professional styling

## SendGrid Dashboard Setup

### Required Steps

1. **Verify Sender Email:**
   - Go to SendGrid Dashboard → Settings → Sender Authentication
   - Verify your domain or single sender email
   - Update `SENDGRID_FROM_EMAIL` in `.env.local`

2. **Monitor Email Activity:**
   - Dashboard → Activity Feed
   - Track sent, delivered, and bounced emails

3. **Set Up Templates (Optional):**
   - Dashboard → Email API → Dynamic Templates
   - Create reusable templates with variables

## Testing

### Test Email Sending

```typescript
// Create a test API route or use in a component
const testEmail = async () => {
  const response = await fetch('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: 'your-email@example.com',
      subject: 'Test Email from Wavegroww',
      html: '<h1>Test Email</h1><p>If you receive this, email is working!</p>',
    }),
  });
  
  const result = await response.json();
  console.log(result);
};
```

## Common Use Cases in Your App

### 1. User Registration Flow

```typescript
// src/app/api/auth/register/route.ts
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(req: NextRequest) {
  const { email, name, password } = await req.json();
  
  // Create user in database
  const user = await createUser({ email, name, password });
  
  // Send welcome email
  await sendWelcomeEmail(email, name);
  
  return NextResponse.json({ success: true });
}
```

### 2. Team Member Invitation

```typescript
// When inviting team members
import { sendTeamInvitationEmail } from '@/lib/email';

const inviteToken = generateInviteToken();
const inviteLink = `${process.env.NEXT_PUBLIC_APP_URL}/accept-invite/${inviteToken}`;

await sendTeamInvitationEmail(
  inviteeEmail,
  currentUser.name,
  team.name,
  inviteLink
);
```

### 3. WhatsApp Message Notifications

```typescript
// Notify users of new WhatsApp messages
import { sendNotificationEmail } from '@/lib/email';

await sendNotificationEmail(
  user.email,
  'New WhatsApp Message',
  `You received a new message from ${customerName}`,
  `${process.env.NEXT_PUBLIC_APP_URL}/inbox/${customerId}`,
  'View Conversation'
);
```

## Troubleshooting

### Email Not Sending?

1. Check SendGrid API key is correct in `.env.local`
2. Verify sender email in SendGrid dashboard
3. Check server logs for error messages
4. Ensure `.env.local` is loaded (restart dev server)

### Email Goes to Spam?

1. Verify your domain in SendGrid
2. Set up SPF and DKIM records
3. Use a professional sender email (not @gmail.com)

### Rate Limits?

- Free tier: 100 emails/day
- Upgrade SendGrid plan for higher limits

## Next Steps

1. **Verify Sender Email** in SendGrid dashboard
2. **Update** `SENDGRID_FROM_EMAIL` in `.env.local`
3. **Test** email sending with the test function above
4. **Integrate** email functions into your existing features

## Support

For SendGrid documentation: <https://docs.sendgrid.com/>
For API reference: <https://docs.sendgrid.com/api-reference/mail-send/mail-send>

---

✅ **Email service is ready to use!** Start integrating emails into your user flows.
