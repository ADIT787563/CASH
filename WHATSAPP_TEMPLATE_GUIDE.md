# WhatsApp Template Management Guide

## Overview

WhatsApp templates are pre-approved message formats required for sending business messages. This system includes full validation to ensure your templates follow WhatsApp's strict rules.

---

## Template Categories

### 1. **Marketing** 
Use for: Offers, promotions, discounts, reminders

**Allowed:**
- ✅ Promotional content
- ✅ Discounts and offers
- ✅ "Buy now", "Limited time" language
- ✅ Emojis

**Example:**
```
Name: summer_sale_offer
Content: Hi {{1}}, unlock your special summer offer today! Get {{2}}% off. Click here: {{3}}
```

### 2. **Utility**
Use for: Order updates, payment updates, receipts, account notifications

**NOT Allowed:**
- ❌ Promotional content
- ❌ Discounts or offers
- ❌ Sales language

**Example:**
```
Name: order_shipped_update
Content: Hi {{1}}, your order {{2}} has been shipped. Track here: {{3}}
```

### 3. **Authentication**
Use for: OTP, verification codes, password resets

**Rules:**
- ❌ NO buttons allowed
- ❌ NO promotional content
- ✅ Must be concise
- ✅ Should include security warning

**Example:**
```
Name: otp_verification_code
Content: Your OTP is {{1}}. It will expire in 10 minutes. Do not share this code with anyone.
```

---

## Template Rules (MUST FOLLOW)

### 1. Template Name
- ✅ **Lowercase only**: `order_update_1`
- ✅ **Use underscores**: `summer_sale_2024`
- ❌ **No spaces**: ~~`Order Update`~~
- ❌ **No uppercase**: ~~`OrderUpdate`~~

### 2. Placeholders
- ✅ **Use numbers**: `{{1}}`, `{{2}}`, `{{3}}`
- ❌ **No words**: ~~`{{name}}`~~, ~~`{{order_id}}`~~
- ✅ **Sequential**: Start from {{1}}

**Correct:**
```
Hello {{1}}, your order {{2}} is ready
```

**Wrong:**
```
Hello {{name}}, your order {{order_id}} is ready
```

### 3. Content by Category

**Marketing:**
```
✅ "Get 20% off today only!"
✅ "Limited time offer for {{1}}"
✅ "Buy now and save {{2}}%"
```

**Utility:**
```
✅ "Your order {{1}} has been delivered"
✅ "Payment of {{1}} received"
❌ "Get 20% off" (promotional - use Marketing)
```

**Authentication:**
```
✅ "Your OTP is {{1}}"
✅ "Verification code: {{1}}"
❌ "Your OTP is {{1}}. Buy now!" (promotional)
```

### 4. Buttons

**Allowed Button Types:**
- `QUICK_REPLY` - Quick response buttons
- `URL` - Website links (must be HTTPS)
- `PHONE_NUMBER` - Call buttons

**Rules:**
- ✅ Maximum 3 buttons
- ✅ Button text max 25 characters
- ✅ URLs must use HTTPS
- ❌ NO buttons in Authentication templates

**Example:**
```json
{
  "buttons": [
    {
      "type": "URL",
      "text": "Track Order",
      "url": "https://example.com/track"
    },
    {
      "type": "QUICK_REPLY",
      "text": "Contact Support"
    }
  ]
}
```

### 5. Language
- ✅ Must match selected language
- ❌ No mixing languages

**Correct (English):**
```
Your order is ready
```

**Wrong (Mixed):**
```
Your order is ready bhai
```

### 6. Sensitive Data
**NEVER include:**
- ❌ Full card numbers
- ❌ SSN or government IDs
- ❌ Private medical results
- ❌ OTP + card details together

---

## API Usage

### Create Template

**POST** `/api/templates`

```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{
    "name": "order_shipped",
    "category": "utility",
    "language": "en",
    "content": "Hi {{1}}, your order {{2}} has been shipped. Track here: {{3}}",
    "buttons": [
      {
        "type": "URL",
        "text": "Track Order",
        "url": "https://example.com/track"
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "template": {
    "id": 1,
    "name": "order_shipped",
    "category": "utility",
    "status": "draft",
    ...
  },
  "validation": {
    "warnings": []
  }
}
```

### Get Template Examples

**GET** `/api/templates?examples=true`

```bash
curl http://localhost:3000/api/templates?examples=true
```

Returns ready-to-use examples for all 3 categories.

### List All Templates

**GET** `/api/templates`

```bash
curl http://localhost:3000/api/templates \
  -H "x-user-id: YOUR_USER_ID"
```

### Update Template

**PUT** `/api/templates?id=1`

```bash
curl -X PUT http://localhost:3000/api/templates?id=1 \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{
    "content": "Updated content with {{1}}",
    "status": "approved"
  }'
```

### Delete Template

**DELETE** `/api/templates?id=1`

```bash
curl -X DELETE http://localhost:3000/api/templates?id=1 \
  -H "x-user-id: YOUR_USER_ID"
```

---

## Validation Errors

The API automatically validates templates and returns helpful errors:

### Common Errors

**1. Invalid Template Name:**
```json
{
  "error": "Template validation failed",
  "errors": [
    "Template name must be lowercase",
    "Template name cannot contain spaces. Use underscores instead"
  ]
}
```

**2. Invalid Placeholders:**
```json
{
  "errors": [
    "Invalid placeholder {{name}}. Use {{1}}, {{2}}, {{3}}, etc. No words allowed"
  ]
}
```

**3. Category Mismatch:**
```json
{
  "errors": [
    "Promotional content \"discount\" is NOT allowed in utility templates. Use Marketing category instead"
  ]
}
```

**4. Button Errors:**
```json
{
  "errors": [
    "Authentication templates (OTP) cannot have buttons",
    "URL buttons must use HTTPS"
  ]
}
```

---

## Template Status Flow

1. **draft** - Created but not submitted
2. **pending** - Submitted to WhatsApp for approval
3. **approved** - Approved by WhatsApp (can be used)
4. **rejected** - Rejected by WhatsApp (check `rejectionReason`)

---

## Best Practices

### ✅ DO:
- Use clear, concise language
- Match content to category
- Use sequential placeholders ({{1}}, {{2}}, {{3}})
- Test with example data before submitting
- Keep authentication templates simple
- Use HTTPS for all URL buttons

### ❌ DON'T:
- Mix promotional content in utility templates
- Use words in placeholders
- Add buttons to OTP templates
- Include sensitive data
- Use uppercase in template names
- Exceed 25 characters for button text

---

## Testing Templates

### Test Validation

```bash
# Create a test template
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user" \
  -d '{
    "name": "test_template",
    "category": "utility",
    "content": "Test message for {{1}}"
  }'
```

If validation fails, you'll get detailed errors explaining what to fix.

### Get Examples

```bash
curl http://localhost:3000/api/templates?examples=true
```

Use these examples as starting points for your templates.

---

## Integration with Message Queue

Once a template is approved, use it with the message queue:

```bash
# Queue messages using approved template
curl -X POST http://localhost:3000/api/campaigns/send \
  -H "Content-Type: application/json" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{
    "campaignId": 123,
    "recipients": ["+919876543210"],
    "messageType": "template",
    "payload": {
      "template": {
        "name": "order_shipped",
        "language": "en",
        "components": [
          {
            "type": "body",
            "parameters": [
              { "type": "text", "text": "John" },
              { "type": "text", "text": "ORD123" },
              { "type": "text", "text": "https://track.com/ORD123" }
            ]
          }
        ]
      }
    }
  }'
```

---

## Troubleshooting

### Template Rejected by WhatsApp

**Check:**
1. Category matches content
2. No promotional keywords in utility/auth templates
3. Placeholders are {{1}}, {{2}}, not {{name}}
4. Template name is lowercase with underscores
5. No buttons in authentication templates
6. URLs use HTTPS

### Validation Errors

The API provides detailed error messages. Common fixes:

- **"Template name must be lowercase"** → Use `order_update` not `OrderUpdate`
- **"Invalid placeholder {{name}}"** → Use `{{1}}` instead
- **"Promotional content not allowed"** → Change category to Marketing
- **"URL must use HTTPS"** → Change `http://` to `https://`

---

## Summary

✅ **Template system is production-ready**
✅ **Full WhatsApp rule validation**
✅ **Automatic error detection**
✅ **Example templates included**
✅ **Integrated with message queue**

Start by getting examples, then create your own templates following the rules!
