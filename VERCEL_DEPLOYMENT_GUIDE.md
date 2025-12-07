# Vercel Deployment Guide

This guide covers how to deploy your Next.js application to Vercel.

## Prerequisites

1. A [Vercel Account](https://vercel.com/signup).
2. A [GitHub/GitLab/Bitbucket Account](https://github.com/) (to push your code).
3. Your database credentials (e.g., Turso/LibSQL URL and Token).

## Step 1: Push Code to GitHub

1. Initialize a git repository if you haven't (VS Code usually handles this).
2. Commit all your changes:

    ```bash
    git add .
    git commit -m "Ready for deployment"
    ```

3. Push to a new repository on GitHub.

## Step 2: Import Project in Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** -> **"Project"**.
3. Connect your GitHub account and select the repository you just created.
4. Vercel will detect `Next.js`. Leave the "Build and Output Settings" as default.

## Step 3: Configure Environment Variables

**CRITICAL:** You must add these variables in the "Environment Variables" section before clicking Deploy.

### Database

* `DATABASE_URL`: `libsql://your-database-url.turso.io` (Use your real cloud URL, not file:./local.db)
* `DATABASE_AUTH_TOKEN`: `your-turso-auth-token`

### Authentication (Important: Generate NEW secrets for production)

* `BETTER_AUTH_SECRET`: Generate a random string (min 32 chars).
* `BETTER_AUTH_URL`: `https://your-project-name.vercel.app` (You can update this after first deploy if the URL changes).
* `JWT_ACCESS_SECRET`: Generate a random string.
* `JWT_REFRESH_SECRET`: Generate a random string.

### WhatsApp API (Use your real values)

* `WHATSAPP_API_URL`: `https://graph.facebook.com/v18.0`
* `WHATSAPP_PHONE_NUMBER_ID`: Your ID
* `WHATSAPP_BUSINESS_ACCOUNT_ID`: Your ID
* `WHATSAPP_ACCESS_TOKEN`: Your Token
* `WHATSAPP_VERIFY_TOKEN`: Your chosen verify token

### Other Secrets

* `WEBHOOK_SECRET`: Your random secret
* `WORKER_SECRET`: Your random secret
* `CRON_SECRET`: Your random secret
* `NEXT_PUBLIC_APP_URL`: `https://your-project-name.vercel.app`

## Step 4: Deploy

1. Click **"Deploy"**.
2. Wait for the build to complete.
3. Once live, copy your domain name (e.g., `https://wavegroww.vercel.app`).

## Step 5: Post-Deployment Setup

1. **Update Callbacks:** Go to your WhatsApp/Facebook Developer Console and update the **Webhook URL** to `https://your-project-name.vercel.app/api/webhooks/whatsapp`.
2. **Google Auth:** If using Google Login, go to Google Cloud Console and add your Vercel domain to "Authorized JavaScript origins" and "Authorized redirect URIs".
3. **Razorpay:** Submit your website URL (`https://your-project-name.vercel.app`) for verification.
