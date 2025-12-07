# Pre-Deployment Cleanup Checklist

This list contains files and folders that are generally **safe to delete** from your production server or before zipping your project for upload. These files are for documentation, development configuration, or local testing only.

## 🗑️ Safe to Delete (Documentation & Guides)

These files are for your reference only and do not affect the application's functionality.

* `CATALOG_LIMITS.md`
* `CATALOG_LIMITS_SUMMARY.md`
* `CHANGES_SUMMARY.md`
* `DEPLOYMENT_GUIDE.md`
* `EMAIL_SERVICE_SETUP.md`
* `ENV_DOCUMENTATION.md`
* `FIXES_COMPLETE.md`
* `HOW_PLAN_RECOGNITION_WORKS.md`
* `IMPLEMENTATION_GUIDE.md`
* `IMPLEMENTATION_SUMMARY.md`
* `INBOX_SCHEMA_ADDITIONS.txt`
* `MESSAGE_QUEUE_SETUP.md`
* `PAYMENT_INTEGRATION.md`
* `PLAN_FEATURES_COMPLETE.md`
* `PRICING_PAGE_UPDATED.md`
* `PROJECT_BLUEPRINT.md`
* `RBAC_GUIDE.md`
* `README.md`
* `SUBSCRIPTION_ACTIVATED.md`
* `THEME_LOGO_IMPLEMENTATION.md`
* `WEBSITE_UPDATED_TO_PLANS.md`
* `WHATSAPP_AUTOREPLY_SETUP.md`
* `WHATSAPP_TEMPLATE_GUIDE.md`

## ⚠️ Conditional Deletion (Read Carefully)

### 1. `node_modules`

* **DELETE IF:** You plan to run `npm install` (or `bun install`) on your server. This is the recommended way.
* **KEEP IF:** You are dragging and dropping files via FTP and cannot run commands on the server (not recommended, but sometimes necessary).

### 2. `.next`

* **DELETE IF:** You plan to run `npm run build` on the server.
* **KEEP IF:** You have already built the app locally and are uploading the built artifacts.

### 3. `.env` files

* **DELETE:** `.env.example`, `.env.queue.example` (These are just templates).
* **KEEP:** `.env` (Contains your actual secrets). *Note: In professional deployments, these variables are usually set in the hosting dashboard, not uploaded as a file.*

### 4. Scripts & Dev Configs

These are usually needed for the *build* process. Only delete them if you are uploading a pre-built application (e.g., just the `.next` folder and `public`).

* `scripts/` folder
* `drizzle/` folder (unless running migrations on server)
* `drop-orders.ts`
* `seed.ts`
* `eslint.config.mjs`
* `tsconfig.json`

## ✅ Critical Files (DO NOT DELETE)

* `src/` (Source code)
* `public/` (Images, fonts, static assets)
* `package.json` & `package-lock.json` (Dependencies)
* `next.config.ts` (Next.js configuration)
* `middleware.ts` (Routing logic)
