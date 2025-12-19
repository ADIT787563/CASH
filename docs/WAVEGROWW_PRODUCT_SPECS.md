# WaveGroww – Detailed Website & Platform Note

## 1. What is WaveGroww

WaveGroww is a **WhatsApp E-commerce Automation Platform** that helps small and medium businesses sell, manage orders, collect payments, and support customers directly on WhatsApp.

WaveGroww is **NOT** WhatsApp marketing automation. It focuses strictly on:

* Customer-initiated conversations
* E-commerce workflows
* Orders, payments, delivery, and support

## 2. Core Problem WaveGroww Solves

Small businesses struggle with:

* Managing WhatsApp orders manually
* Tracking payments from chat
* Handling order status updates
* Responding quickly to customers
* Verifying payments
* Maintaining order history

WaveGroww converts WhatsApp chats into a **structured e-commerce system**.

## 3. Target Users

* Small business owners
* D2C brands
* Home businesses
* Local sellers
* Instagram / WhatsApp sellers
* Service-based sellers with order flow

## 4. Platform Architecture (High Level)

### Frontend

* Web-based dashboard
* Seller login & onboarding
* Order, payment, chat management

### Backend

* Secure APIs
* Database with multi-tenant support
* Razorpay integration
* Meta WhatsApp Cloud API
* Webhooks & background jobs

## 5. Website Pages (wavegroww.online)

### Public Pages

* Home
* Pricing
* Features
* Contact / Support
* FAQ
* Privacy Policy
* Terms of Service
* Refund Policy

### Auth & Onboarding

* Login
* Register
* Onboarding (Profile → Business → Payments → Setup Complete)

### Dashboard (After Login)

* Dashboard overview
* Orders
* Products / Catalog
* Customers
* Conversations (Inbox)
* Payments
* Chatbot configuration
* Templates
* Team management
* Settings

## 6. Core Features (E-commerce Only)

### A. WhatsApp Conversation Inbox

* Centralized chat system
* View all customer messages
* Reply directly from dashboard
* Message status tracking (sent/delivered/read)
* Order & payment context inside chat
* **Purpose:** Turn conversations into orders.

### B. AI Chatbot (Commerce Focused)

* Product details
* Price & stock information
* Variant selection
* Address collection
* Order creation
* Payment guidance
* **Bot rules:**
  * Responds only to customer-initiated chats
  * No marketing messages
  * No cold outreach

### C. Product Catalog

* Add / edit products
* Variants (size, color, etc.)
* Pricing & stock
* Product images
* Categories
* **Used inside:** Chat, Orders, Customer queries

### D. Orders Management

* Create orders from chat
* Manual or automatic order creation
* Order status lifecycle: Pending, Paid, Confirmed, Shipped, Delivered, Cancelled
* Order timeline
* Customer-linked orders

### E. Payments (Razorpay)

* Online payments via UPI / cards
* Razorpay order creation
* Auto payment verification via webhook
* Payment status synced to order
* Invoice & receipt support
* *WaveGroww does not require sellers to enable payments immediately (beta allowed).*

### F. WhatsApp Templates (Transactional Only)

* **Allowed templates:** Order confirmation, Payment received, Order shipped, Delivered, Refund processed
* **Not allowed:** Promotional messages, Bulk marketing, Cold outreach

### G. Customers (CRM Lite)

* Customer profiles
* Order history
* Address history
* Notes
* Conversation linkage

### H. Analytics (Commerce Focused)

* Orders count
* Revenue
* Payments status
* Conversation → order conversion
* Daily / monthly summaries
* *No marketing analytics.*

## 7. Plans & Permissions

* **Plans are based on:** Number of active conversations, Orders per month, AI replies usage, Product count
* **Plans do NOT control:** Marketing campaigns, Bulk messaging
* **Plan enforcement:** Frontend UI locks, Backend API permission checks

## 8. Meta WhatsApp Integration

* Uses WhatsApp Cloud API
* Requires: Callback URL, Verify token, Meta billing method
* Business verification: Not required for launch (Required later for scale)
* **WaveGroww follows Meta-safe e-commerce messaging rules.**

## 9. Security & Compliance

* Secure authentication
* Role-based access (Owner, Admin, Agent)
* Encrypted API keys
* Webhook signature verification
* Audit logs
* No sensitive data exposed on frontend

## 10. Current Launch Status

* Core platform built
* Razorpay integrated
* WhatsApp API integration in progress
* Payments optional for beta
* Required for early users
* **WaveGroww is suitable for:** Closed beta, Early access launch, Feedback-driven iteration

## 11. Long-Term Vision

* Become the **Shopify of WhatsApp commerce**
* Replace manual WhatsApp selling
* Power small businesses with structured e-commerce on chat

## 12. One-Line Definition (Final)

**WaveGroww is a WhatsApp-based e-commerce automation platform that helps businesses sell, manage orders, collect payments, and support customers—all inside WhatsApp.**
