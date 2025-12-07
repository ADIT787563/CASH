# WhatsApp Auto-Reply Setup Guide

## Overview

Your chatbot will automatically respond to incoming WhatsApp messages when enabled. This guide shows you how to configure the webhook with Meta.

## Prerequisites

1. ✅ WhatsApp Business API account
2. ✅ Chatbot settings configured and enabled
3. ✅ Your application deployed with HTTPS (required by Meta)

## Step 1: Configure Environment Variables

Add these to your `.env` file:

```bash
# WhatsApp Webhook Security
WHATSAPP_VERIFY_TOKEN=your_custom_verify_token_here
WHATSAPP_APP_SECRET=your_app_secret_from_meta
```

- **WHATSAPP_VERIFY_TOKEN**: Create a random string (e.g., `my_secure_token_12345`)
- **WHATSAPP_APP_SECRET**: Get this from your Meta App Dashboard → Settings → Basic

## Step 2: Configure Webhook in Meta Dashboard

1. **Go to Meta for Developers:**
   - Visit: <https://developers.facebook.com/apps>
   - Select your WhatsApp app

2. **Navigate to WhatsApp → Configuration:**
   - Click on "WhatsApp" in the left sidebar
   - Go to "Configuration" tab

3. **Set Webhook URL:**

   ```
   https://yourdomain.com/api/webhooks/whatsapp/messages
   ```

4. **Set Verify Token:**
   - Enter the same token you used in `WHATSAPP_VERIFY_TOKEN`

5. **Click "Verify and Save"**

6. **Subscribe to Webhook Fields:**
   - Check the box for **"messages"**
   - This ensures you receive incoming message notifications

## Step 3: Enable Chatbot in Dashboard

1. Navigate to `/dashboard/settings`
2. Click the "Chatbot" tab
3. Configure your settings:
   - ✅ Enable Chatbot
   - ✅ Enable Auto-Reply
   - Select Response Tone (Friendly, Professional, etc.)
   - Set Typing Delay (optional)
   - Add Welcome Message (optional)
   - Add Keyword Triggers (optional)
4. Click **"Save Chatbot Settings"**

## Step 4: Test the Auto-Reply

1. **Send a WhatsApp message** to your business number
2. **The chatbot will automatically reply** based on your settings
3. **Check the dashboard** to see the conversation in Messages/Inbox

## How It Works

```
┌─────────────────┐
│  Customer sends │
│  WhatsApp msg   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Meta forwards   │
│ to your webhook │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Your webhook    │
│ receives message│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Check chatbot   │
│ settings        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate reply  │
│ based on:       │
│ - Keywords      │
│ - Welcome msg   │
│ - Tone/Language │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Send auto-reply │
│ via WhatsApp    │
└─────────────────┘
```

## Chatbot Features

### 1. **Keyword Triggers**

Set up automatic responses for specific keywords:

- "price" → "Our pricing starts at..."
- "hours" → "We're open Monday-Friday..."
- "support" → "Contact our support team at..."

### 2. **Welcome Message**

Custom greeting sent to new conversations

### 3. **Response Tones**

- **Friendly**: Warm and approachable
- **Professional**: Formal business tone
- **Casual**: Relaxed and informal
- **Formal**: Very professional and structured

### 4. **Multi-Language Support**

- English, Hindi, Spanish, French, German

### 5. **Typing Delay**

Simulate human-like response time (in milliseconds)

## Troubleshooting

### Webhook Not Receiving Messages

1. Check that webhook URL is correct and uses HTTPS
2. Verify that WHATSAPP_VERIFY_TOKEN matches in both .env and Meta dashboard
3. Ensure "messages" field is subscribed in Meta dashboard

### Auto-Reply Not Working

1. Check that chatbot is **enabled** in settings
2. Verify **auto-reply** is turned on
3. Check terminal/logs for errors
4. Ensure WhatsApp credentials are correct

### Messages Received But No Reply

1. Verify chatbot settings are saved
2. Check that user has WhatsApp settings configured
3. Look for errors in terminal logs

## Security Notes

- ✅ Webhook signature verification is enabled
- ✅ Only verified requests from Meta are processed
- ✅ User authentication required for all settings
- ✅ Messages are logged for audit trail

## Next Steps

1. **Monitor Performance**: Check Messages tab to see conversations
2. **Refine Responses**: Update keyword triggers and welcome messages
3. **Analyze Data**: Use Analytics to track message volume
4. **Scale**: Add more sophisticated AI responses (future feature)
