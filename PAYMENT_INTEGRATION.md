# Payment Integration Guide

## Overview

This application includes a complete payment integration using Razorpay for processing subscriptions.

## Features Implemented

### 1. **Plans Page** (`/plans`)

- Clean, modern pricing page with three tiers (Starter, Pro, Enterprise)
- Responsive design with plan comparison
- FAQ section
- Direct navigation to payment page

### 2. **Payment Page** (`/payment`)

- Secure checkout flow with Razorpay integration
- Billing cycle selection (Monthly/Yearly with 20% discount)
- Coupon code support
- Real-time price calculation
- Trust badges and security indicators
- Multiple payment methods (Credit/Debit Cards, UPI, Net Banking)

### 3. **Payment Success Page** (`/payment/success`)

- Confirmation page with next steps
- Links to dashboard and billing settings
- Professional success animation

### 4. **Payment Failed Page** (`/payment/failed`)

- Error handling with helpful information
- Retry options
- Support contact information

### 5. **Backend API Routes**

- `/api/payment/create-order` - Creates Razorpay orders
- `/api/payment/verify` - Verifies payment signatures

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Razorpay

1. Sign up at [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Get your API keys from the Keys section
3. Update the `.env` file with your keys:

```env
RAZORPAY_KEY_ID=your_actual_key_id
RAZORPAY_KEY_SECRET=your_actual_key_secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_actual_key_id
```

### 3. Test Mode

For testing, use Razorpay's test mode keys. Test cards:

- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## Usage

### Navigating to Payment

Users can access the payment page in two ways:

1. Click "Subscribe Now" on any paid plan card in `/plans`
2. Direct URL: `/payment?plan=pro` (or `starter`, `enterprise`)

### Payment Flow

1. User selects a plan on `/plans`
2. Clicks "Subscribe Now" button
3. Redirected to `/payment?plan={planId}`
4. User can:
   - Toggle between monthly/yearly billing
   - Apply coupon codes (SAVE10 for 10%, SAVE20 for 20%)
   - Review order summary
5. Click "Proceed to Payment"
6. Razorpay checkout modal opens
7. User completes payment
8. Redirected to success or failure page

### Coupon Codes

Currently supported test coupons:

- `SAVE10` - 10% discount
- `SAVE20` - 20% discount

## File Structure

```
src/
├── app/
│   ├── plans/
│   │   ├── page.tsx                 # Pricing page
│   │   └── components/
│   │       ├── PlanCard.tsx         # Individual plan card
│   │       └── FAQSection.tsx       # FAQ component
│   ├── payment/
│   │   ├── page.tsx                 # Payment checkout page
│   │   ├── success/
│   │   │   └── page.tsx            # Success page
│   │   └── failed/
│   │       └── page.tsx            # Failure page
│   └── api/
│       └── payment/
│           ├── create-order/
│           │   └── route.ts        # Create Razorpay order
│           └── verify/
│               └── route.ts        # Verify payment
```

## Security Features

1. **Signature Verification**: All payments are verified using HMAC SHA256 signatures
2. **Server-side Validation**: Payment verification happens on the backend
3. **Environment Variables**: Sensitive keys stored in environment variables
4. **HTTPS Required**: Production should use HTTPS only

## Next Steps

### Database Integration

Currently, the payment verification API logs successful payments. To persist subscriptions:

1. Create a `subscriptions` table in your database:

```sql
CREATE TABLE subscriptions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  billing_cycle TEXT NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

2. Update `/api/payment/verify/route.ts` to save to database
3. Implement subscription status checks in your middleware

### Webhooks

For production, implement Razorpay webhooks to handle:

- Payment failures
- Subscription renewals
- Refunds
- Chargebacks

### Additional Features to Implement

- [ ] Subscription management dashboard
- [ ] Invoice generation and email
- [ ] Payment history
- [ ] Auto-renewal handling
- [ ] Proration for plan changes
- [ ] Grace period for failed payments
- [ ] Email notifications for payment events

## Testing Checklist

- [ ] Plans page loads correctly
- [ ] Plan cards navigate to payment page with correct plan ID
- [ ] Payment page shows correct plan details
- [ ] Billing cycle toggle works
- [ ] Coupon codes apply correctly
- [ ] Razorpay checkout opens
- [ ] Test payment succeeds
- [ ] Success page shows correct information
- [ ] Test payment failure
- [ ] Failure page shows with retry option
- [ ] Free plan redirects to dashboard

## Support

For Razorpay integration issues:

- [Razorpay Documentation](https://razorpay.com/docs/)
- [Razorpay Support](https://razorpay.com/support/)

## License

This payment integration is part of your SaaS application.
