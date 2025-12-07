# Wave Groww - SaaS Master Blueprint

## ⭐ 1. ABSOLUTE MUST-HAVE FEATURES

*(Without these, your SaaS is incomplete or unusable)*

### A) Authentication

- [ ] Email + password
- [ ] Google OAuth login
- [ ] Forgot password
- [x] Email verification (API Ready)
- [ ] JWT session or Supabase session
- [x] Device tracking (Schema Ready)

### B) User Roles

- [x] Super Admin
- [x] Business Owner / Brand
- [ ] Creator (for Wave Groww creator module)
- [x] Team members

### C) Onboarding

- [ ] A guided onboarding wizard
  - [ ] Business details
  - [ ] Connect WhatsApp API
  - [ ] Add first product or catalog item
  - [ ] Choose plan
  - [ ] Dashboard tour

### D) Subscription Billing

- [ ] Razorpay or Stripe integration
- [x] Plans: Starter → Pro → Business (Schema Ready)
- [ ] Auto plan upgrade/downgrade
- [ ] Monthly subscription renewal
- [ ] Webhooks for payment success/failure
- [ ] Invoice generation
- [ ] Billing history
- [ ] Credit system (optional)

### E) WhatsApp Cloud API Core

- [x] WhatsApp Cloud API integration (Basic Setup)
- [ ] Permanent token setup
- [x] Phone number ID, WABA ID (Schema Ready)
- [ ] Incoming message webhook
- [ ] Outgoing message API
- [ ] Template sending API
- [ ] Conversation tracking

### F) AI Integration (ChatGPT)

- [ ] AI auto-replies
- [ ] AI for product suggestions
- [ ] AI for summarizing chats
- [ ] AI workflow in flow-builder
- [ ] Limit AI usage per plan
- [ ] Token usage logging per user

### G) Dashboard

- [ ] Overview (messages, contacts, revenue, automations)
- [ ] WhatsApp inbox (one unified chat UI)
- [ ] Templates manager
- [ ] Products/catalog manager
- [ ] Automations (flow builder)
- [ ] Orders or lead tracking
- [ ] Settings page
- [ ] Billing page
- [ ] Team management

### H) Backend Infrastructure

- [ ] Secure API routes
- [x] Role-based access (Schema Ready)
- [ ] Rate limiting
- [ ] Logging system
- [ ] Error monitoring
- [ ] Queues (message sending jobs)
- [ ] Database backup

### I) Creator / Brand Features (WaveGroww)

- [ ] Creator Profile (Social links, Niche, Followers, Deals)
- [ ] Brand Campaign posting
- [ ] Creator search/discovery
- [ ] Proposals
- [ ] Payments to creators
- [ ] Commission system (4–8%)

---

## ⭐ 2. SHOULD-HAVE FEATURES

*(These make your SaaS competitive and professional)*

### A) Advanced WhatsApp Features

- [ ] Keyword-based automation
- [ ] Auto fallback reply
- [ ] Business hours automation
- [ ] Product list messages
- [ ] Catalog sync
- [ ] Quick replies
- [ ] Buttons (CTA / Reply buttons)
- [ ] Broadcast campaigns (limit per plan)

### B) Flow Builder (Visual)

- [ ] Drag-and-drop style
- [ ] Welcome message
- [ ] If/Else conditions
- [ ] Send product list
- [ ] Capture user details
- [ ] Human takeover
- [ ] End flow

### C) Marketing Tools

- [ ] Landing page with pricing
- [ ] Testimonials
- [ ] SEO-optimized blog
- [ ] Google Analytics integration
- [ ] Facebook Pixel integration

### D) Team & Staff Roles

- [x] Owner, Manager, Staff, Read-only (Schema Ready)

### E) User Activity Logging

- [x] Track Messages sent, Templates used, Automations triggered (Audit Logs)

### F) Email System

- [x] SendGrid Integration
- [x] Welcome email
- [ ] Payment success/failed email
- [ ] Trial ending email

### G) Security

- [ ] JWT rotation
- [ ] Brute force prevention
- [ ] IP monitoring
- [ ] Device history
- [ ] API key rotation

---

## ⭐ 5. Database Tables REQUIRED

### Core

- [x] users
- [ ] businesses (Partial: business_settings)
- [ ] creators
- [x] plans (pricing_plans)
- [ ] subscriptions
- [ ] invoices
- [x] templates
- [x] products
- [x] categories
- [x] contacts (customers/leads)
- [ ] conversations
- [x] messages
- [ ] flows
- [ ] flow_nodes
- [ ] flow_runs
- [x] team_members

### Logging

- [ ] ai_usage_logs
- [ ] whatsapp_usage_logs
- [x] audit_log

### Billing

- [ ] payment_records
- [ ] subscription_cycles

### Admin

- [ ] fraud_flags

---

## ⭐ 4. API YOU MUST BUILD

### Auth

- [ ] POST /auth/signup
- [ ] POST /auth/login
- [ ] POST /auth/logout
- [ ] POST /auth/google
- [x] POST /auth/verify-email (OTP Ready)
- [ ] POST /auth/reset-password

### Business

- [ ] GET /business/me
- [ ] POST /business/update
- [ ] POST /business/onboarding

### WhatsApp

- [ ] POST /whatsapp/send
- [ ] POST /whatsapp/send-template
- [ ] POST /whatsapp/broadcast
- [ ] POST /whatsapp/flow/start
- [ ] POST /whatsapp/flow/stop
- [ ] POST /whatsapp/test-message
- [ ] POST /webhook/whatsapp
- [ ] GET /whatsapp/templates
- [ ] POST /whatsapp/templates/create

### AI

- [ ] POST /ai/auto-reply
- [ ] POST /ai/suggest
- [ ] POST /ai/summarize
- [ ] POST /ai/product-suggestion

### Products / Catalog

- [ ] GET /products
- [ ] POST /products/create
- [ ] PUT /products/:id
- [ ] DELETE /products/:id
- [ ] GET /categories
- [ ] POST /categories/create

### Contact / Leads

- [ ] GET /contacts
- [ ] POST /contacts/add
- [ ] PUT /contacts/:id

### Flow Builder

- [ ] GET /flows
- [ ] POST /flows/create
- [ ] POST /flows/:id/update
- [ ] POST /flows/:id/run

### Billing

- [ ] GET /billing/plans
- [ ] POST /billing/subscribe
- [ ] POST /billing/cancel
- [ ] POST /billing/upgrade
- [ ] POST /billing/webhook
- [ ] GET /billing/history

### Admin

- [ ] GET /admin/users
- [ ] POST /admin/block-user
- [ ] POST /admin/update-plan
