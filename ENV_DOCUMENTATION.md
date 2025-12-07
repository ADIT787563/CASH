# Environment Variables Documentation

## Required Variables

### Database
- **DATABASE_URL**: Path to SQLite database file
  - Example: `file:./local.db`
  - Production: Use absolute path or cloud database URL

- **DATABASE_AUTH_TOKEN**: Authentication token for database (if using Turso/LibSQL)
  - Leave empty for local SQLite

### Authentication
- **BETTER_AUTH_SECRET**: Secret key for better-auth (minimum 32 characters)
  - Generate: `openssl rand -base64 32`
  - Must be kept secret and never committed to git

- **BETTER_AUTH_URL**: Base URL of your application
  - Development: `http://localhost:3000`
  - Production: `https://yourdomain.com`

### JWT Configuration
- **JWT_ACCESS_SECRET**: Secret for signing access tokens (minimum 32 characters)
  - Generate: `openssl rand -base64 32`
  
- **JWT_REFRESH_SECRET**: Secret for signing refresh tokens (minimum 32 characters)
  - Generate: `openssl rand -base64 32`
  - Should be different from ACCESS_SECRET

- **JWT_ACCESS_EXPIRY**: Access token expiration time
  - Default: `30m` (30 minutes)
  - Format: `15m`, `1h`, `2d`

- **JWT_REFRESH_EXPIRY**: Refresh token expiration time
  - Default: `30d` (30 days)
  - Format: `7d`, `30d`, `90d`

### WhatsApp Cloud API
- **WHATSAPP_API_URL**: WhatsApp API endpoint
  - Format: `https://graph.facebook.com/v18.0/{PHONE_NUMBER_ID}/messages`
  - Get from Meta Business Suite

- **WHATSAPP_ACCESS_TOKEN**: Permanent access token from Meta
  - Get from Meta Business Suite → WhatsApp → API Setup
  - Keep this secret!

- **WHATSAPP_PHONE_NUMBER_ID**: Your WhatsApp phone number ID
  - Get from Meta Business Suite

- **WHATSAPP_BUSINESS_ACCOUNT_ID**: Your WhatsApp Business Account ID
  - Get from Meta Business Suite

### Webhook Configuration
- **WHATSAPP_VERIFY_TOKEN**: Token for webhook verification
  - Choose any random string
  - Must match the token you set in Meta Business Suite

- **WHATSAPP_APP_SECRET**: App secret for HMAC signature verification
  - Get from Meta App Dashboard → Settings → Basic

- **WEBHOOK_SECRET**: Secret for internal webhook HMAC
  - Generate: `openssl rand -base64 32`

### Worker Configuration
- **WORKER_SECRET**: Secret for queue worker authentication
  - Generate: `openssl rand -base64 32`
  - Used to protect `/api/queue/worker` endpoint

- **CRON_SECRET**: Secret for cron job authentication
  - Generate: `openssl rand -base64 32`
  - Used to protect automated cleanup endpoints

## Optional Variables

### AI Chatbot
- **OPENAI_API_KEY**: OpenAI API key for chatbot
  - Get from https://platform.openai.com/api-keys
  - Only needed if using AI chatbot feature

- **AI_MODEL**: OpenAI model to use
  - Default: `gpt-4-turbo-preview`
  - Options: `gpt-3.5-turbo`, `gpt-4`, `gpt-4-turbo-preview`

- **AI_MAX_TOKENS**: Maximum tokens for AI responses
  - Default: `1000`
  - Adjust based on your needs and budget

### Email Configuration
- **SMTP_HOST**: SMTP server hostname
  - Gmail: `smtp.gmail.com`
  - Outlook: `smtp-mail.outlook.com`

- **SMTP_PORT**: SMTP server port
  - TLS: `587`
  - SSL: `465`

- **SMTP_USER**: Email address for sending
  - Example: `noreply@yourdomain.com`

- **SMTP_PASSWORD**: Email password or app password
  - Gmail: Use App Password (not regular password)

- **ADMIN_EMAIL**: Email address for admin notifications
  - Receives security alerts and system notifications

### Security Alerts
- **SECURITY_ALERT_EMAIL**: Email for security alerts
  - Can be same as ADMIN_EMAIL

- **SECURITY_ALERT_TELEGRAM**: Telegram bot token for alerts
  - Optional: Get from @BotFather on Telegram

### Key Rotation
- **KEY_ROTATION_ENABLED**: Enable automatic key rotation
  - Default: `true`
  - Set to `false` to disable

- **KEY_ROTATION_DAYS**: Days between key rotations
  - Default: `90`
  - Recommended: 60-90 days

- **KEY_GRACE_PERIOD_DAYS**: Grace period for old keys
  - Default: `7`
  - Old keys remain valid during this period

### System Configuration
- **NODE_ENV**: Node environment
  - Options: `development`, `production`, `test`

- **NEXT_PUBLIC_APP_URL**: Public URL of your app
  - Used for client-side API calls
  - Development: `http://localhost:3000`
  - Production: `https://yourdomain.com`

- **MAINTENANCE_MODE**: Enable maintenance mode
  - Default: `false`
  - Set to `true` to block all operations

### Rate Limiting
- **RATE_LIMIT_ENABLED**: Enable rate limiting
  - Default: `true`
  - Set to `false` to disable (not recommended)

### Logging
- **LOG_LEVEL**: Logging level
  - Options: `error`, `warn`, `info`, `debug`
  - Default: `info`

- **ENABLE_AUDIT_LOGS**: Enable audit logging
  - Default: `true`
  - Set to `false` to disable

## Security Best Practices

1. **Never commit `.env` file to git**
   - Add `.env` to `.gitignore`
   - Use `.env.example` for documentation

2. **Use strong secrets**
   - Minimum 32 characters
   - Use `openssl rand -base64 32` to generate

3. **Rotate secrets regularly**
   - Every 90 days recommended
   - Use grace period for smooth transition

4. **Different secrets for different environments**
   - Development secrets ≠ Production secrets

5. **Limit access to production secrets**
   - Use environment variable management tools
   - Examples: Vercel Environment Variables, AWS Secrets Manager

## Quick Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Generate secrets:
   ```bash
   openssl rand -base64 32  # Run this for each secret
   ```

3. Fill in WhatsApp credentials from Meta Business Suite

4. Configure webhook URL in Meta:
   - URL: `https://yourdomain.com/api/webhooks/whatsapp/status`
   - Verify Token: Same as `WHATSAPP_VERIFY_TOKEN`

5. Test configuration:
   ```bash
   npm run dev
   ```

## Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` path is correct
- Ensure database file has write permissions

### WhatsApp API Errors
- Verify `WHATSAPP_ACCESS_TOKEN` is valid
- Check `WHATSAPP_PHONE_NUMBER_ID` is correct
- Ensure phone number is registered with Meta

### Webhook Not Receiving Events
- Verify `WHATSAPP_VERIFY_TOKEN` matches Meta configuration
- Check `WHATSAPP_APP_SECRET` is correct
- Ensure webhook URL is publicly accessible

### Authentication Issues
- Verify `BETTER_AUTH_SECRET` is set
- Check `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are different
- Ensure secrets are at least 32 characters
