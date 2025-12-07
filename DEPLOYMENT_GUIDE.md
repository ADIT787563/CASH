# WhatsApp Auto-Reply Deployment Guide

## What We've Built

✅ **Chatbot Settings System** - Configure tone, language, keywords, welcome messages  
✅ **Auto-Reply Webhook** - `/api/webhooks/whatsapp/messages` receives incoming messages  
✅ **Token Refresh System** - Easy UI to update expired access tokens  
✅ **Message Logging** - All conversations saved to database  
✅ **Customer Management** - Auto-creates leads from WhatsApp conversations  

## Current Status

⚠️ **Auto-reply is NOT working yet because:**

- Your app is running on `localhost:3000` (not accessible from internet)
- Meta cannot send webhooks to localhost
- You need to deploy or use a tunnel

## Quick Start: Deploy to Vercel (Recommended)

### Step 1: Prepare for Deployment

1. **Install Vercel CLI:**

```bash
npm install -g vercel
```

2. **Login to Vercel:**

```bash
vercel login
```

### Step 2: Deploy

```bash
cd "c:\Users\A2Max\OneDrive\Desktop\FINAL\new final saas"
vercel
```

Follow the prompts:

- Set up and deploy? **Y**
- Which scope? (select your account)
- Link to existing project? **N**
- Project name? (press Enter for default)
- Directory? **./` (press Enter)
- Override settings? **N**

### Step 3: Add Environment Variables

After deployment, add these to Vercel:

```bash
vercel env add DATABASE_URL
vercel env add WHATSAPP_VERIFY_TOKEN
vercel env add WHATSAPP_APP_SECRET
vercel env add NEXTAUTH_SECRET
# ... add all your other env variables
```

Or use the Vercel dashboard: Project Settings → Environment Variables

### Step 4: Configure Meta Webhook

1. Go to <https://developers.facebook.com/apps>
2. Select your app → WhatsApp → Configuration
3. Set Webhook URL: `https://your-app.vercel.app/api/webhooks/whatsapp/messages`
4. Set Verify Token: (same as `WHATSAPP_VERIFY_TOKEN` in your env)
5. Click "Verify and Save"
6. Subscribe to "messages" field

### Step 5: Update Access Token

1. Go to your deployed app: `https://your-app.vercel.app/dashboard/settings/whatsapp`
2. Paste your access token in the "Refresh Access Token" section
3. Click "Update Token"

### Step 6: Enable Chatbot

1. Go to `/dashboard/settings` → Chatbot tab
2. Enable Chatbot ✅
3. Enable Auto-Reply ✅
4. Configure your settings
5. Click "Save Chatbot Settings"

### Step 7: Test

Send a WhatsApp message to your business number - you should get an auto-reply! 🎉

---

## Alternative: Use ngrok for Local Testing

If you want to test locally without deploying:

### Step 1: Install ngrok

Download from <https://ngrok.com/download>

### Step 2: Start ngrok

```bash
ngrok http 3000
```

Copy the HTTPS URL (e.g., `https://abc123.ngrok-free.app`)

### Step 3: Configure Meta Webhook

Use the ngrok URL: `https://abc123.ngrok-free.app/api/webhooks/whatsapp/messages`

### Step 4: Add Environment Variables

Add to your `.env`:

```
WHATSAPP_VERIFY_TOKEN=my_secure_token_123
WHATSAPP_APP_SECRET=your_meta_app_secret
```

Restart your dev server: `npm run dev`

### Step 5: Test

Send a WhatsApp message - you should get an auto-reply!

**Note:** ngrok URLs change every time you restart, so you'll need to update the webhook URL in Meta each time.

---

## Environment Variables Checklist

Make sure these are set in production:

```env
# Database
DATABASE_URL=your_database_url

# WhatsApp
WHATSAPP_VERIFY_TOKEN=your_custom_verify_token
WHATSAPP_APP_SECRET=your_meta_app_secret

# Auth
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-app.vercel.app

# Google OAuth (if using)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

---

## Troubleshooting

### Webhook Not Receiving Messages

1. ✅ Check webhook URL is correct in Meta dashboard
2. ✅ Verify `WHATSAPP_VERIFY_TOKEN` matches in both .env and Meta
3. ✅ Ensure "messages" field is subscribed
4. ✅ Check your app is accessible via HTTPS
5. ✅ Look at terminal/logs for webhook errors

### Auto-Reply Not Sending

1. ✅ Check chatbot is enabled in settings
2. ✅ Verify auto-reply is turned on
3. ✅ Ensure access token is not expired (check `/dashboard/settings/whatsapp`)
4. ✅ Verify WhatsApp credentials are correct
5. ✅ Check terminal logs for errors

### Token Expired

1. Go to `/dashboard/settings/whatsapp`
2. You'll see a red warning if expired
3. Get new token from Meta dashboard
4. Paste and click "Update Token"

---

## Features Overview

### Chatbot Settings

- **Response Tones:** Friendly, Professional, Casual, Formal
- **Languages:** English, Hindi, Spanish, French, German
- **Keyword Triggers:** Auto-respond to specific keywords
- **Welcome Message:** Custom greeting for new conversations
- **Typing Delay:** Simulate human response time

### Auto-Reply Flow

1. Customer sends WhatsApp message
2. Meta forwards to your webhook
3. Webhook checks chatbot settings
4. Generates response based on keywords/tone/language
5. Sends auto-reply via WhatsApp API
6. Logs conversation in database
7. Creates/updates customer & lead records

### Token Management

- Automatic expiration tracking
- Visual warnings when token expires soon
- Easy refresh UI with instructions
- Displays hours until expiry

---

## Next Steps

1. **Deploy to Vercel** (or use ngrok for testing)
2. **Configure Meta webhook** with your public URL
3. **Update access token** in the dashboard
4. **Enable chatbot** and configure settings
5. **Test** by sending a WhatsApp message

Your WhatsApp auto-reply chatbot will be live! 🚀

---

## Support

If you encounter issues:

1. Check terminal logs for errors
2. Verify all environment variables are set
3. Ensure access token is valid
4. Check Meta webhook configuration
5. Review `WHATSAPP_AUTOREPLY_SETUP.md` for detailed setup

Good luck! 🎉
