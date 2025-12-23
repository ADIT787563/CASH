import { sqliteTable, integer, text, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import crypto from 'crypto';



// Auth tables for better-auth
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"), // Personal phone
  phoneVerified: integer("phone_verified", { mode: "boolean" }).default(false),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  role: text("role").notNull().default('owner'), // 'owner', 'admin', 'agent'
  plan: text("plan").notNull().default('starter'), // 'starter', 'growth', 'pro', 'enterprise'
  authProvider: text("auth_provider").notNull().default('email'), // 'email', 'google'
  onboardingStep: integer("onboarding_step").notNull().default(0), // 0: Auth, 1: Profile, 2: Business, 3: Payments, 4: Complete
  subscriptionStatus: text("subscription_status").notNull().default('inactive'), // 'active', 'inactive', 'past_due', 'trial'
  trialEndsAt: integer("trial_ends_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

// Businesses Table (Step 2)
export const businesses = sqliteTable('businesses', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  ownerId: text('owner_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  displayName: text('display_name'),
  slug: text('slug').notNull().unique(),
  sellerCode: text('seller_code').notNull().unique(), // WG-XXXXXX
  type: text('type'), // 'Individual', 'MSME', 'Company'
  category: text('category'),
  address: text('address', { mode: 'json' }), // { line1, line2, city, state, pincode, country }
  gstin: text('gstin'),
  phone: text('phone').notNull(), // Business phone
  email: text('email').notNull(), // Business email
  timezone: text('timezone').default('Asia/Kolkata'),
  logoUrl: text('logo_url'),
  logoUrlDark: text('logo_url_dark'),
  onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Order Sequences (Atomic increment)
export const orderSequences = sqliteTable('order_sequences', {
  businessId: text('business_id').primaryKey().references(() => businesses.id, { onDelete: 'cascade' }),
  lastSeqNumber: integer('last_seq_number').notNull().default(0),
});

// WhatsApp Settings table (Item 5, but needed for Onboarding Step 2)
export const whatsappSettings = sqliteTable('whatsapp_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  phoneNumberId: text('phone_number_id').notNull(),
  wabaId: text('waba_id').notNull(),
  accessToken: text('access_token').notNull(),
  businessProfileId: integer('business_profile_id').references(() => businessProfiles.id),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: integer("access_token_expires_at", {
    mode: "timestamp",
  }),
  refreshTokenExpiresAt: integer("refresh_token_expires_at", {
    mode: "timestamp",
  }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(
    () => new Date(),
  ),
});

// Team Invites table for RBAC
export const teamInvites = sqliteTable('team_invites', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull(),
  role: text('role').notNull(), // 'admin', 'manager', 'agent', 'viewer' (not 'owner')
  businessId: text('business_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  status: text('status').notNull().default('pending'), // 'pending', 'accepted', 'expired'
  expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Categories table (Item 4)
export const categories = sqliteTable('categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  slug: text('slug').notNull(),
  description: text('description'),
  imageUrl: text('image_url'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'), // Soft delete
}, (table) => ({
  userIdIdx: index('categories_user_id_idx').on(table.userId),
  slugIdx: index('categories_slug_idx').on(table.slug),
}));

// Products table - Updated with comprehensive fields
export const products = sqliteTable('products', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),

  // Basic Information
  name: text('name').notNull(),
  description: text('description'),
  shortDescription: text('short_description'),
  longDescription: text('long_description'),

  // Pricing
  price: integer('price', { mode: 'number' }).notNull(),
  compareAtPrice: integer('compare_at_price'),
  discountPercentage: integer('discount_percentage'),
  discountValidFrom: text('discount_valid_from'),
  discountValidTo: text('discount_valid_to'),
  bulkPricing: text('bulk_pricing', { mode: 'json' }),
  currencyCode: text('currency_code').notNull().default('INR'),

  // Inventory
  stock: integer('stock').notNull(),
  sku: text('sku'),
  barcode: text('barcode'),

  // Categorization
  category: text('category').notNull(), // Legacy text field, keeping for backward compatibility
  categoryId: integer('category_id').references(() => categories.id, { onDelete: 'set null' }),
  subcategory: text('subcategory'),
  tags: text('tags', { mode: 'json' }),
  vendor: text('vendor'),

  // Media
  imageUrl: text('image_url'),
  galleryImages: text('gallery_images', { mode: 'json' }),

  // Variants
  colors: text('colors', { mode: 'json' }),
  sizes: text('sizes', { mode: 'json' }),
  variants: text('variants', { mode: 'json' }),

  // Shipping & Physical
  weight: integer('weight'),
  dimensions: text('dimensions', { mode: 'json' }),
  shippingClass: text('shipping_class'),

  // Tax & Compliance
  hsnCode: text('hsn_code'),
  taxRate: integer('tax_rate'),
  gstInclusive: integer('gst_inclusive', { mode: 'boolean' }).notNull().default(false),
  ageRestricted: integer('age_restricted', { mode: 'boolean' }).notNull().default(false),
  returnPolicy: text('return_policy'),

  // Visibility & Publishing
  status: text('status').notNull().default('active'),
  visibility: text('visibility').notNull().default('draft'),
  publishDate: text('publish_date'),

  // Sharing
  shareableSlug: text('shareable_slug'),
  shareablePassword: text('shareable_password'),
  utmParams: text('utm_params', { mode: 'json' }),
  template: text('template').notNull().default('basic'),

  // SEO
  seoTitle: text('seo_title'),
  seoDescription: text('seo_description'),
  canonicalUrl: text('canonical_url'),

  // Integration
  autoSyncEnabled: integer('auto_sync_enabled', { mode: 'boolean' }).notNull().default(false),
  lastSyncedAt: text('last_synced_at'),
  externalUrl: text('external_url'),

  // Custom
  customAttributes: text('custom_attributes', { mode: 'json' }),
  viewTrackingEnabled: integer('view_tracking_enabled', { mode: 'boolean' }).notNull().default(true),

  // Timestamps
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'), // Soft delete timestamp
}, (table) => ({
  userIdIdx: index('products_user_id_idx').on(table.userId),
  categoryIdx: index('products_category_idx').on(table.category),
  statusIdx: index('products_status_idx').on(table.status),
}));

// Leads table
export const leads = sqliteTable('leads', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  email: text('email'),
  source: text('source').notNull(),
  status: text('status').notNull().default('new'),
  interest: text('interest'),
  lastMessage: text('last_message'),
  lastContacted: text('last_contacted'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'), // Soft delete timestamp
}, (table) => ({
  userIdIdx: index('leads_user_id_idx').on(table.userId),
  statusIdx: index('leads_status_idx').on(table.status),
  phoneUniqueIdx: uniqueIndex('leads_phone_user_unique_idx').on(table.userId, table.phone),
}));

// Lead Activity Log table - AG-302
export const leadActivityLog = sqliteTable('lead_activity_log', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  leadId: integer('lead_id').notNull().references(() => leads.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // 'status_change', 'note_added', 'contacted'
  oldStatus: text('old_status'),
  newStatus: text('new_status'),
  metadata: text('metadata', { mode: 'json' }),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  leadIdIdx: index('lead_activity_lead_id_idx').on(table.leadId),
  userIdIdx: index('lead_activity_user_id_idx').on(table.userId),
}));

// Messages table
export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  leadId: integer('lead_id').references(() => leads.id, { onDelete: 'set null' }),
  customerId: integer('customer_id').references(() => customers.id, { onDelete: 'cascade' }),

  // Message details
  direction: text('direction').notNull(), // 'inbound' or 'outbound'
  fromNumber: text('from_number').notNull(),
  toNumber: text('to_number').notNull(),
  content: text('content').notNull(),
  messageType: text('message_type').notNull(), // text, image, video, document, template, button, list

  // Status tracking
  status: text('status').notNull().default('sent'), // sent, delivered, read, failed
  phoneNumber: text('phone_number').notNull(),
  whatsappMessageId: text('whatsapp_message_id'),
  errorMessage: text('error_message'),

  // Metadata
  rawPayload: text('raw_payload', { mode: 'json' }),
  mediaUrl: text('media_url'),

  // Timestamps
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  userIdIdx: index('messages_user_id_idx').on(table.userId),
  customerIdIdx: index('messages_customer_id_idx').on(table.customerId),
  leadIdIdx: index('messages_lead_id_idx').on(table.leadId),
  fromNumberIdx: index('messages_from_number_idx').on(table.fromNumber),
  toNumberIdx: index('messages_to_number_idx').on(table.toNumber),
}));

// Templates table
export const templates = sqliteTable('templates', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),

  // Template identification
  name: text('name').notNull(), // lowercase_with_underscores
  whatsappTemplateId: text('whatsapp_template_id'), // ID from WhatsApp after approval

  // Content
  content: text('content').notNull(), // Body text with {{1}}, {{2}} placeholders
  header: text('header'), // Optional header text
  footer: text('footer'), // Optional footer text

  // Category (determines approval rules)
  category: text('category').notNull(), // 'marketing', 'utility', 'authentication'

  // Language
  language: text('language').notNull().default('en'), // 'en', 'hi', etc.

  // Variables/Placeholders
  variables: text('variables', { mode: 'json' }), // Array of placeholder descriptions

  // Buttons
  buttons: text('buttons', { mode: 'json' }), // Array of button objects

  // Status
  status: text('status').notNull().default('draft'), // 'draft', 'pending', 'approved', 'rejected'
  rejectionReason: text('rejection_reason'),

  // Usage
  usageCount: integer('usage_count').notNull().default(0),

  // Timestamps
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'), // Soft delete timestamp
});

// Campaigns table
export const campaigns = sqliteTable('campaigns', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  templateId: integer('template_id').references(() => templates.id, { onDelete: 'set null' }),
  status: text('status').notNull().default('draft'),
  audienceConfig: text('audience_config', { mode: 'json' }), // { type: 'all' | 'tag', value: string }
  scheduledAt: text('scheduled_at'),
  targetCount: integer('target_count').notNull().default(0),
  sentCount: integer('sent_count').notNull().default(0),
  deliveredCount: integer('delivered_count').notNull().default(0),
  readCount: integer('read_count').notNull().default(0),
  failedCount: integer('failed_count').notNull().default(0),
  clickedCount: integer('clicked_count').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Message Queue table
export const messageQueue = sqliteTable('message_queue', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  campaignId: integer('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }),

  // Message details
  phone: text('phone').notNull(),
  messageType: text('message_type').notNull(), // 'text', 'template', 'image', 'button'
  payload: text('payload', { mode: 'json' }).notNull(),

  // Queue management
  status: text('status').notNull().default('pending'), // 'pending', 'processing', 'sent', 'failed'
  attempts: integer('attempts').notNull().default(0),
  maxAttempts: integer('max_attempts').notNull().default(3),
  lastAttemptAt: text('last_attempt_at'),
  errorMessage: text('error_message'),

  // Delivery tracking (from webhooks)
  deliveryStatus: text('delivery_status'), // 'sent', 'delivered', 'read', 'failed'
  sentAt: text('sent_at'),
  deliveredAt: text('delivered_at'),
  readAt: text('read_at'),
  failedAt: text('failed_at'),
  errorCode: text('error_code'),

  // Scheduling
  scheduledFor: text('scheduled_for'),
  processedAt: text('processed_at'),

  // WhatsApp message ID (for webhook matching)
  whatsappMessageId: text('whatsapp_message_id'),

  // Timestamps
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Webhook Logs table
export const webhookLogs = sqliteTable('webhook_logs', {
  id: text('id').primaryKey(),

  // Webhook details
  source: text('source').notNull(), // 'whatsapp', 'meta', '360dialog'
  eventId: text('event_id').notNull().unique(), // For idempotency

  // Payload
  rawPayload: text('raw_payload', { mode: 'json' }).notNull(),

  // Processing
  processed: integer('processed', { mode: 'boolean' }).notNull().default(false),
  processedAt: text('processed_at'),
  errorMessage: text('error_message'),

  // Timestamps
  createdAt: text('created_at').notNull(),
});

// Analytics table
export const analytics = sqliteTable('analytics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  totalMessages: integer('total_messages').notNull().default(0),
  inboundMessages: integer('inbound_messages').notNull().default(0),
  outboundMessages: integer('outbound_messages').notNull().default(0),
  newLeads: integer('new_leads').notNull().default(0),
  convertedLeads: integer('converted_leads').notNull().default(0),
  totalRevenue: integer('total_revenue').default(0), // in paise
  totalOrders: integer('total_orders').default(0),
  paidOrders: integer('paid_orders').default(0),
  uniqueConversations: integer('unique_conversations').default(0),
  productClicks: integer('product_clicks').default(0),
  templateSends: integer('template_sends').default(0),
  failureReasons: text('failure_reasons', { mode: 'json' }),
  topProducts: text('top_products', { mode: 'json' }), // [{ id, name, sales, revenue }]
  createdAt: text('created_at').notNull(),
}, (table) => ({
  //   userIdDateIdx: uniqueIndex('analytics_user_id_date_idx').on(table.userId, table.date),
}));

// Business Settings table
export const businessSettings = sqliteTable('business_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  businessName: text('business_name').notNull(),
  whatsappNumber: text('whatsapp_number').notNull(),
  businessCategory: text('business_category'),
  businessDescription: text('business_description'),
  shortBio: text('short_bio'),
  storeUrl: text('store_url'),
  logoUrl: text('logo_url'),
  logoUrlDark: text('logo_url_dark'),
  coverImageUrl: text('cover_image_url'),
  socialLinks: text('social_links', { mode: 'json' }),
  businessHours: text('business_hours', { mode: 'json' }),
  catalogUrl: text('catalog_url'),
  themeConfig: text('theme_config', { mode: 'json' }), // Added for store aesthetics
  maintenanceMode: integer('maintenance_mode', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Business profiles table for user onboarding
export const businessProfiles = sqliteTable('business_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),

  // Personal Information
  fullName: text('full_name').notNull(),

  // Business Information
  businessName: text('business_name').notNull(),
  businessCategory: text('business_category').notNull(),

  // Contact Information
  phoneNumber: text('phone_number').notNull(),
  businessEmail: text('business_email').notNull(),

  // Address Information
  street: text('street').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  pincode: text('pincode').notNull(),

  // Optional Tax Information
  gstNumber: text('gst_number'),

  // Profile Completion Status
  isComplete: integer('is_complete', { mode: 'boolean' }).notNull().default(false),

  // Timestamps
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Chatbot Settings table
export const chatbotSettings = sqliteTable('chatbot_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(true),
  autoReply: integer('auto_reply', { mode: 'boolean' }).notNull().default(true),
  language: text('language').notNull().default('en'),
  tone: text('tone').notNull().default('friendly'),
  typingDelay: integer('typing_delay').notNull().default(2),
  businessHoursOnly: integer('business_hours_only', { mode: 'boolean' }).notNull().default(false),
  welcomeMessage: text('welcome_message'),
  awayMessage: text('away_message'),
  defaultResponseTone: text('default_response_tone').notNull().default('friendly'),
  languageFallback: text('language_fallback', { mode: 'json' }),
  keywordTriggers: text('keyword_triggers', { mode: 'json' }),
  autoReplyTemplates: text('auto_reply_templates', { mode: 'json' }),

  // New AI Persistence Fields
  businessContext: text('business_context'),
  handoverRule: text('handover_rule'),
  confidenceThreshold: integer('confidence_threshold').default(85), // 0-100
  businessHoursConfig: text('business_hours_config', { mode: 'json' }), // { start, end, enabled }
  fallbackMode: text('fallback_mode').notNull().default('template'), // 'template', 'human', 'hybrid'
  fallbackMessage: text('fallback_message'), // The content of the template response

  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// AI Settings History - AG-206
export const chatbotSettingsHistory = sqliteTable('chatbot_settings_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  settingId: integer('setting_id').notNull().references(() => chatbotSettings.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  configSnapshot: text('config_snapshot', { mode: 'json' }).notNull(),
  versionName: text('version_name'), // e.g., "Holiday Sale Settings"
  createdAt: text('created_at').notNull(),
}, (table) => ({
  userIdIdx: index('chatbot_history_user_id_idx').on(table.userId),
  settingIdIdx: index('chatbot_history_setting_id_idx').on(table.settingId),
}));

// Orders table
// Orders table (Header)
export const orders = sqliteTable('orders', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  leadId: integer('lead_id').references(() => leads.id, { onDelete: 'set null' }),

  // Customer Details (Snapshot)
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerEmail: text('customer_email'),
  shippingAddress: text('shipping_address'),

  // Financials
  subtotal: integer('subtotal').notNull(),
  discountAmount: integer('discount_amount').default(0),
  shippingAmount: integer('shipping_amount').default(0),
  taxAmount: integer('tax_amount').default(0),
  totalAmount: integer('total_amount').notNull(),
  currency: text('currency').default('INR'),

  // Meta
  channel: text('channel').default('whatsapp'), // 'whatsapp', 'web', 'app'
  source: text('source').default('ai_chat'), // 'ai_chat', 'manual_dashboard', 'landing_page'
  notes: text('notes', { mode: 'json' }), // Added for generic notes/metadata
  notesFromCustomer: text('notes_from_customer'),
  notesInternal: text('notes_internal'),

  status: text('status').notNull().default('pending'), // 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled', 'paid'
  paymentStatus: text('payment_status').default('unpaid'), // 'unpaid', 'paid', 'refunded'
  paymentMethod: text('payment_method'), // 'cod', 'upi', 'card', 'razorpay'

  // New Fields for Order & Payment System
  businessId: text('business_id').references(() => businesses.id, { onDelete: 'cascade' }),
  orderSeqNumber: integer('order_seq_number'), // Per-business sequence
  reference: text('reference'), // WG-XXXXXX-000123

  invoiceUrl: text('invoice_url'),
  invoiceNumber: text('invoice_number').unique(),

  paymentProofUrl: text('payment_proof_url'), // AG-704
  utrNumber: text('utr_number'), // UPI Reference

  orderDate: text('order_date').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  userIdIdx: index('orders_user_id_idx').on(table.userId),
  businessIdIdx: index('orders_business_id_idx').on(table.businessId),
  statusIdx: index('orders_status_idx').on(table.status),
  createdAtIdx: index('orders_created_at_idx').on(table.createdAt),
}));

// Order Items (Line Items)
export const orderItems = sqliteTable('order_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  productId: integer('product_id').references(() => products.id, { onDelete: 'set null' }),

  productName: text('product_name').notNull(),
  quantity: integer('quantity').notNull(),
  unitPrice: integer('unit_price').notNull(),
  totalPrice: integer('total_price').notNull(),

  createdAt: text('created_at').notNull(),
});

// Order Timeline (History)
export const orderTimeline = sqliteTable('order_timeline', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  status: text('status').notNull(), // 'confirmed', 'shipped', 'delivered', etc.
  note: text('note'),
  createdBy: text('created_by').references(() => user.id, { onDelete: 'set null' }),
  createdAt: text('created_at').notNull(),
});

// Business Settings table (End)
export const productViews = sqliteTable('product_views', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  productId: integer('product_id').notNull().references(() => products.id, { onDelete: 'cascade' }),
  productName: text('product_name').notNull(),
  viewDate: text('view_date').notNull(),
  viewCount: integer('view_count').notNull().default(1),
  clickCount: integer('click_count').notNull().default(0),
  source: text('source'),
  createdAt: text('created_at').notNull(),
});

// Traffic Sources table
export const trafficSources = sqliteTable('traffic_sources', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  source: text('source').notNull(),
  visits: integer('visits').notNull().default(0),
  date: text('date').notNull(),
  createdAt: text('created_at').notNull(),
});

// Account settings table
export const accountSettings = sqliteTable('account_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  fullName: text('full_name'),
  phone: text('phone'),
  phoneVerified: integer('phone_verified', { mode: 'boolean' }).notNull().default(false),
  timezone: text('timezone').notNull().default('Asia/Kolkata'),
  language: text('language').notNull().default('en'),
  logoUrl: text('logo_url'),
  logoUrlDark: text('logo_url_dark'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Catalog settings table
export const catalogSettings = sqliteTable('catalog_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  defaultTemplate: text('default_template').notNull().default('modern'),
  autoUpdate: integer('auto_update', { mode: 'boolean' }).notNull().default(true),
  pdfDownloadEnabled: integer('pdf_download_enabled', { mode: 'boolean' }).notNull().default(false),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Integrations table
export const integrations = sqliteTable('integrations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  integrationType: text('integration_type').notNull(),
  status: text('status').notNull().default('disconnected'),
  config: text('config', { mode: 'json' }),
  lastSyncAt: text('last_sync_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Analytics settings table
export const analyticsSettings = sqliteTable('analytics_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  retentionDays: integer('retention_days').notNull().default(30),
  realtimeEnabled: integer('realtime_enabled', { mode: 'boolean' }).notNull().default(false),
  defaultTimezone: text('default_timezone').notNull().default('Asia/Kolkata'),
  csvExportEnabled: integer('csv_export_enabled', { mode: 'boolean' }).notNull().default(false),
  pngExportEnabled: integer('png_export_enabled', { mode: 'boolean' }).notNull().default(false),
  anonymizePii: integer('anonymize_pii', { mode: 'boolean' }).notNull().default(false),
  webhookUrl: text('webhook_url'),
  webhookSecret: text('webhook_secret'),
  scheduledReportEnabled: integer('scheduled_report_enabled', { mode: 'boolean' }).notNull().default(false),
  reportFrequency: text('report_frequency').notNull().default('weekly'),
  reportTime: text('report_time').notNull().default('09:00'),
  reportRecipients: text('report_recipients', { mode: 'json' }),
  demoMode: integer('demo_mode', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Team members table
export const teamMembers = sqliteTable('team_members', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  memberUserId: text('member_user_id').references(() => user.id, { onDelete: 'set null' }),
  inviteId: integer('invite_id').references(() => teamInvites.id, { onDelete: 'set null' }),
  email: text('email').notNull(),
  name: text('name').notNull(),
  role: text('role').notNull().default('viewer'), // 'owner', 'admin', 'manager', 'agent', 'viewer'
  status: text('status').notNull().default('pending'),
  permissions: text('permissions', { mode: 'json' }),
  invitedAt: text('invited_at').notNull(),
  acceptedAt: text('accepted_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Security settings table
export const securitySettings = sqliteTable('security_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  twoFactorEnabled: integer('two_factor_enabled', { mode: 'boolean' }).notNull().default(false),
  twoFactorMethod: text('two_factor_method'),
  twoFactorSecret: text('two_factor_secret'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// User sessions table
export const userSessions = sqliteTable('user_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  sessionToken: text('session_token').notNull(),
  deviceName: text('device_name'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  lastActiveAt: text('last_active_at').notNull(),
  createdAt: text('created_at').notNull(),
});

// User Devices table for persistent device tracking
export const userDevices = sqliteTable('user_devices', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  deviceId: text('device_id').notNull(), // UUID from local storage
  deviceName: text('device_name'), // e.g. "Chrome on Windows"
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  lastLoginAt: integer('last_login_at', { mode: 'timestamp' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// Export jobs table
export const exportJobs = sqliteTable('export_jobs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  jobType: text('job_type').notNull(),
  status: text('status').notNull().default('pending'),
  fileUrl: text('file_url'),
  dateRangeStart: text('date_range_start'),
  dateRangeEnd: text('date_range_end'),
  errorMessage: text('error_message'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Backup schedules table
export const backupSchedules = sqliteTable('backup_schedules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),
  enabled: integer('enabled', { mode: 'boolean' }).notNull().default(false),
  frequency: text('frequency').notNull().default('weekly'),
  storageProvider: text('storage_provider'),
  storageConfig: text('storage_config', { mode: 'json' }),
  lastBackupAt: text('last_backup_at'),
  nextBackupAt: text('next_backup_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Audit Logs table for comprehensive activity tracking
export const auditLogs = sqliteTable('audit_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }), // Nullable for system actions

  // Action details
  action: text('action').notNull(), // e.g., 'login_success', 'product_create', 'campaign_send'
  description: text('description').notNull(), // Human-readable description

  // Item tracking
  itemType: text('item_type'), // 'product', 'lead', 'order', 'template', 'campaign', 'user', etc.
  itemId: text('item_id'), // ID of the affected item

  // Additional context
  metadata: text('metadata', { mode: 'json' }), // Additional data (old/new values, counts, etc.)

  // Request details
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),

  // Classification
  severity: text('severity').notNull().default('info'), // 'info', 'warning', 'critical'
  category: text('category').notNull(), // 'auth', 'user_action', 'message', 'admin'

  // Timestamp
  createdAt: text('created_at').notNull(),
});

// Rate Limit Tracking table
export const rateLimitTracking = sqliteTable('rate_limit_tracking', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  identifier: text('identifier').notNull(), // User ID or IP address
  limitType: text('limit_type').notNull(), // 'auth', 'api', 'message', 'chatbot', 'webhook'
  count: integer('count').notNull().default(0),
  windowStart: text('window_start').notNull(), // ISO timestamp
  windowEnd: text('window_end').notNull(), // ISO timestamp
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Webhook Events table for deduplication
export const webhookEvents = sqliteTable('webhook_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  eventId: text('event_id').notNull().unique(), // Unique event ID from WhatsApp/Provider
  provider: text('provider'), // 'razorpay', 'whatsapp'
  eventType: text('event_type'), // 'payment.captured'
  rawPayload: text('raw_payload', { mode: 'json' }), // Added raw payload

  messageId: text('message_id'), // WhatsApp message ID
  source: text('source').notNull(), // 'whatsapp', 'meta', '360dialog', 'razorpay'
  processed: integer('processed', { mode: 'boolean' }).notNull().default(false), // Changed default to false (needs processing)
  processedAt: text('processed_at'),
  processedBy: text('processed_by'),

  createdAt: text('created_at').notNull(),
});

// Chatbot Usage table for daily tracking (Legacy/Compatibility)
export const chatbotUsage = sqliteTable('chatbot_usage', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // YYYY-MM-DD format
  count: integer('count').notNull().default(0),
  limit: integer('limit').notNull(), // Daily limit based on plan
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// AG-901: Comprehensive Business Usage Tracking
export const businessUsage = sqliteTable('business_usage', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  metric: text('metric').notNull(), // 'conversations', 'ai_replies', 'orders', 'messages'
  period: text('period').notNull(), // 'daily', 'monthly'
  key: text('key').notNull(), // '2023-10-27' or '2023-10'
  count: integer('count').notNull().default(0),
  limit: integer('limit').notNull().default(0),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  userMetricIdx: index('business_usage_user_metric_idx').on(table.userId, table.metric),
  userMetricPeriodKeyIdx: uniqueIndex('business_usage_unique_idx').on(table.userId, table.metric, table.period, table.key),
}));

// Customers table for inbox
export const customers = sqliteTable('customers', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  phone: text('phone').notNull(),
  whatsappId: text('whatsapp_id'), // whatsapp:+91xxxxxxxxxx
  name: text('name'),
  email: text('email'),
  address: text('address'), // Added for order flow

  // Conversation State Tracking
  conversationState: text('conversation_state').default('browsing'), // 'browsing', 'collecting_order_details', 'support'
  conversationContext: text('conversation_context', { mode: 'json' }), // Store temp data like partial order details

  status: text('status').notNull().default('new'),
  assignedTo: text('assigned_to').references(() => user.id),
  tags: text('tags', { mode: 'json' }),
  labels: text('labels', { mode: 'json' }),
  lastMessage: text('last_message'),
  lastMessageTime: text('last_message_time'),
  unreadCount: integer('unread_count').notNull().default(0),
  notes: text('notes'),
  totalOrders: integer('total_orders').notNull().default(0),
  totalSpent: integer('total_spent').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => ({
  userIdIdx: index('customers_user_id_idx').on(table.userId),
  phoneIdx: index('customers_phone_idx').on(table.phone),
  statusIdx: index('customers_status_idx').on(table.status),
}));

// Conversation assignments table
export const conversationAssignments = sqliteTable('conversation_assignments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  customerId: integer('customer_id').notNull().references(() => customers.id, { onDelete: 'cascade' }),
  assignedTo: text('assigned_to').notNull().references(() => user.id),
  assignedBy: text('assigned_by').notNull().references(() => user.id),
  assignedAt: text('assigned_at').notNull(),
  notes: text('notes'),
});

// ============================================
// GLOBAL CONFIGURATION TABLES
// ============================================

// Pricing Plans Configuration (Single Source of Truth)
export const pricingPlans = sqliteTable('pricing_plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  planId: text('plan_id').notNull().unique(), // 'starter', 'growth', 'pro', 'enterprise'
  planName: text('plan_name').notNull(),
  monthlyPrice: integer('monthly_price').notNull(), // in paise (₹999 = 99900)
  yearlyPrice: integer('yearly_price'), // in paise, null if not applicable
  features: text('features', { mode: 'json' }).notNull().$type<string[]>(), // Array of feature strings
  limits: text('limits', { mode: 'json' }).notNull().$type<Record<string, any>>(),
  isActive: integer('is_active', { mode: 'boolean' }).default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  isPopular: integer('is_popular', { mode: 'boolean' }).default(false),
  icon: text('icon'),
  color: text('color'),
  bgColor: text('bg_color'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// Content Settings (Global Content Store)
export const contentSettings = sqliteTable('content_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  key: text('key').notNull().unique(), // 'hero_title', 'hero_subtitle', 'product_page_info', etc.
  value: text('value', { mode: 'json' }).notNull(), // Can be string, object, or array
  category: text('category').notNull(), // 'hero', 'product', 'pricing', 'features', etc.
  description: text('description'), // Admin helper text
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// Feature Flags
export const featureFlags = sqliteTable('feature_flags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  featureKey: text('feature_key').notNull().unique(),
  isEnabled: integer('is_enabled', { mode: 'boolean' }).default(false).notNull(),
  config: text('config', { mode: 'json' }).$type<Record<string, any>>(), // Additional config
  description: text('description'),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// ============================================
// RBAC (Role-Based Access Control) TABLES
// ============================================

// Roles table (if you want dynamic roles, otherwise enum in code is fine)


// ============================================
// STORE PAYMENTS & SETTINGS
// ============================================

export const paymentSettings = sqliteTable('payment_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),

  // UPI
  upiEnabled: integer('upi_enabled', { mode: 'boolean' }).default(false).notNull(),
  upiId: text('upi_id'),
  upiAccountName: text('upi_account_name'),
  upiQrImageUrl: text('upi_qr_image_url'),

  // COD
  codEnabled: integer('cod_enabled', { mode: 'boolean' }).default(true).notNull(),

  // Razorpay
  razorpayEnabled: integer('razorpay_enabled', { mode: 'boolean' }).default(false).notNull(),
  razorpayMode: text('razorpay_mode').default('test'), // 'test' | 'live'
  razorpayKeyId: text('razorpay_key_id'),
  razorpayKeySecretEncrypted: text('razorpay_key_secret_encrypted'),
  razorpayWebhookSecretEncrypted: text('razorpay_webhook_secret_encrypted'),

  updatedAt: text('updated_at').notNull(),
});

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: integer('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }), // Buyer User ID if applicable
  sellerId: text('seller_id').references(() => user.id, { onDelete: 'cascade' }), // Seller

  method: text('method').notNull(), // 'UPI', 'RAZORPAY', 'COD'
  amount: integer('amount').notNull(), // in paise
  currency: text('currency').default('INR').notNull(),

  status: text('status').notNull().default('created'), // 'created', 'captured', 'failed', 'refunded'

  // UPI Manual
  upiReference: text('upi_reference'),

  // Razorpay
  razorpayOrderId: text('razorpay_order_id'),
  razorpayPaymentId: text('razorpay_payment_id'),
  razorpaySignature: text('razorpay_signature'),

  // Legacy (Keep to avoid data loss during migration)
  gatewayName: text('gateway_name'),
  gatewayOrderId: text('gateway_order_id'),
  gatewayPaymentId: text('gateway_payment_id'),
  gatewaySignature: text('gateway_signature'),

  rawPayload: text('raw_payload', { mode: 'json' }), // For audit

  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ============================================
// BILLING & SUBSCRIPTIONS
// ============================================

export const subscriptions = sqliteTable('subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  planId: text('plan_id').notNull(), // references pricingPlans.planId
  status: text('status').notNull().default('pending'), // 'active', 'canceled', 'past_due', 'incomplete'

  startDate: text('start_date'),

  // Provider details (Stripe/Razorpay)
  provider: text('provider'), // 'stripe', 'razorpay'
  providerSubscriptionId: text('provider_subscription_id').unique(),
  providerCustomerId: text('provider_customer_id'),

  // Period tracking
  currentPeriodStart: text('current_period_start'),
  currentPeriodEnd: text('current_period_end'),
  cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).default(false),
  canceledAt: text('canceled_at'),

  // AG-1002: Grace Period & Renewal Tracking
  gracePeriodEndsAt: text('grace_period_ends_at'),
  lastRenewalAt: text('last_renewal_at'),

  createdAt: text('created_at').$defaultFn(() => new Date().toISOString()).notNull(),
  updatedAt: text('updated_at').$defaultFn(() => new Date().toISOString()).notNull(),
});

export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: integer('order_id').references(() => orders.id), // Added order link
  subscriptionId: text('subscription_id').references(() => subscriptions.id),
  userId: text('user_id').notNull().references(() => user.id),

  invoiceNo: text('invoice_no'), // Added explicit invoice number
  amount: integer('amount').notNull(), // in smallest currency unit (e.g., paise)
  currency: text('currency').notNull().default('INR'),
  status: text('status').notNull(), // 'paid', 'open', 'void', 'uncollectible'

  providerInvoiceId: text('provider_invoice_id'),
  pdfUrl: text('pdf_url'), // Renamed/Aliased as per blueprint
  invoicePdfUrl: text('invoice_pdf_url'), // Keeping for backward compat if needed

  paidAt: integer('paid_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const paymentRecords = sqliteTable('payment_records', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => user.id),
  invoiceId: text('invoice_id').references(() => invoices.id),

  amount: integer('amount').notNull(),
  currency: text('currency').notNull().default('INR'),
  status: text('status').notNull(), // 'success', 'failed', 'pending'
  method: text('method'), // 'card', 'upi', 'netbanking'

  providerPaymentId: text('provider_payment_id'), // e.g., razorpay_payment_id
  metadata: text('metadata', { mode: 'json' }),

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// Seller Payment Methods - For seller-side Razorpay onboarding
export const sellerPaymentMethods = sqliteTable('seller_payment_methods', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sellerId: text('seller_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),

  // Payment Preference
  paymentPreference: text('payment_preference').notNull().default('both'), // 'online', 'cod', 'both'

  // Razorpay Configuration
  razorpayLink: text('razorpay_link'),
  razorpayConnectedAccountId: text('razorpay_connected_account_id'),
  razorpayKeyId: text('razorpay_key_id'),
  razorpayKeySecret: text('razorpay_key_secret'),

  // Webhook Configuration
  webhookConsent: integer('webhook_consent', { mode: 'boolean' }).notNull().default(false),
  webhookUrl: text('webhook_url'), // Generated WaveGroww webhook URL for display
  webhookSecretHash: text('webhook_secret_hash'), // Hashed secret if seller provided

  // UPI Configuration
  upiId: text('upi_id'),
  phoneNumber: text('phone_number'),
  qrImageUrl: text('qr_image_url'),

  // COD Configuration
  codNotes: text('cod_notes'),

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// ============================================
// FLOW BUILDER (Visual Automation)
// ============================================

export const flows = sqliteTable('flows', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),

  name: text('name').notNull(),
  description: text('description'),
  triggerType: text('trigger_type').notNull(), // 'keyword', 'event', 'manual'
  triggerConfig: text('trigger_config', { mode: 'json' }), // Specific keyword or event details

  isActive: integer('is_active', { mode: 'boolean' }).default(false),
  publishStatus: text('publish_status').default('draft'), // 'draft', 'published'
  version: integer('version').default(1),

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const flowNodes = sqliteTable('flow_nodes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  flowId: text('flow_id').notNull().references(() => flows.id, { onDelete: 'cascade' }),

  type: text('type').notNull(), // 'message', 'condition', 'delay', 'input', 'api_request'
  label: text('label'),

  // Visual positioning
  positionX: integer('position_x').notNull().default(0),
  positionY: integer('position_y').notNull().default(0),

  // Configuration
  data: text('data', { mode: 'json' }).notNull(), // The actual content/logic of the node

  // Connections (Adjacency List)
  parentId: text('parent_id'), // For simple linear flows
  nextId: text('next_id'), // ID of the next node

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const flowEdges = sqliteTable('flow_edges', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  flowId: text('flow_id').notNull().references(() => flows.id, { onDelete: 'cascade' }),

  sourceNodeId: text('source_node_id').notNull().references(() => flowNodes.id, { onDelete: 'cascade' }),
  targetNodeId: text('target_node_id').notNull().references(() => flowNodes.id, { onDelete: 'cascade' }),

  handleType: text('handle_type'), // 'default', 'true', 'false' (for conditions)

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const flowRuns = sqliteTable('flow_runs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  flowId: text('flow_id').notNull().references(() => flows.id, { onDelete: 'cascade' }),
  contactId: integer('contact_id').references(() => customers.id), // The user in the flow

  status: text('status').notNull().default('active'), // 'active', 'completed', 'failed', 'paused'
  currentNodeId: text('current_node_id'),

  variables: text('variables', { mode: 'json' }), // Captured data during the flow
  logs: text('logs', { mode: 'json' }), // Execution history

  startedAt: integer('started_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
});

// ============================================
// CREATOR & BRAND MARKETPLACE
// ============================================

export const creators = sqliteTable('creators', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().unique().references(() => user.id, { onDelete: 'cascade' }),

  // Profile
  bio: text('bio'),
  niche: text('niche'), // 'tech', 'fashion', 'food', etc.
  location: text('location'),
  languages: text('languages', { mode: 'json' }),

  // Social Stats
  instagramHandle: text('instagram_handle'),
  instagramFollowers: integer('instagram_followers'),
  youtubeChannel: text('youtube_channel'),
  youtubeSubscribers: integer('youtube_subscribers'),

  // Commercials
  minBudget: integer('min_budget'),
  currency: text('currency').default('INR'),
  mediaKitUrl: text('media_kit_url'),

  isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
  rating: integer('rating'), // 1-5 scale

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const brandCampaigns = sqliteTable('brand_campaigns', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  brandId: text('brand_id').notNull().references(() => user.id, { onDelete: 'cascade' }),

  title: text('title').notNull(),
  description: text('description').notNull(),
  requirements: text('requirements'),

  budget: integer('budget'),
  currency: text('currency').default('INR'),

  status: text('status').default('open'), // 'open', 'closed', 'completed'
  deadline: integer('deadline', { mode: 'timestamp' }),

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const proposals = sqliteTable('proposals', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  campaignId: text('campaign_id').notNull().references(() => brandCampaigns.id, { onDelete: 'cascade' }),
  creatorId: text('creator_id').notNull().references(() => creators.id, { onDelete: 'cascade' }),

  coverLetter: text('cover_letter'),
  bidAmount: integer('bid_amount').notNull(),
  currency: text('currency').default('INR'),

  status: text('status').default('pending'), // 'pending', 'accepted', 'rejected', 'negotiating'

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// ============================================
// USAGE & ANALYTICS LOGS
// ============================================

export const aiUsageLogs = sqliteTable('ai_usage_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),

  feature: text('feature').notNull(), // 'auto_reply', 'summary', 'generation'
  model: text('model'), // 'gpt-4', 'gpt-3.5-turbo'

  inputTokens: integer('input_tokens').default(0),
  outputTokens: integer('output_tokens').default(0),
  totalTokens: integer('total_tokens').default(0),

  cost: integer('cost'), // Estimated cost in smallest currency unit

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

export const whatsappUsageLogs = sqliteTable('whatsapp_usage_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => user.id),

  messageType: text('message_type').notNull(), // 'marketing', 'utility', 'authentication', 'service'
  direction: text('direction').notNull(), // 'inbound', 'outbound'

  cost: integer('cost'), // Estimated cost

  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// Roles Table - Defines available roles and their permissions
export const roles = sqliteTable('roles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  businessId: text('business_id').references(() => user.id, { onDelete: 'cascade' }), // null for system roles
  roleName: text('role_name').notNull(),
  description: text('description'),
  permissions: text('permissions', { mode: 'json' }).notNull().$type<{
    products?: { view?: boolean; edit?: boolean; delete?: boolean };
    orders?: { view?: boolean; edit?: boolean; delete?: boolean };
    whatsapp?: { send?: boolean; manage?: boolean };
    billing?: { access?: boolean; manage?: boolean };
    team?: { manage?: boolean; invite?: boolean; remove?: boolean };
    dashboard?: { access?: boolean };
    settings?: { access?: boolean; manage?: boolean };
    campaigns?: { view?: boolean; create?: boolean; manage?: boolean };
    analytics?: { access?: boolean };
  }>(),
  parentRoleId: text('parent_role_id').references((): any => roles.id, { onDelete: 'set null' }),
  isSystemRole: integer('is_system_role', { mode: 'boolean' }).default(false).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// Team Members Table - Links users to businesses with roles (RBAC Enhanced)
export const rbacTeamMembers = sqliteTable('rbac_team_members', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  businessId: text('business_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  userId: text('user_id').references(() => user.id, { onDelete: 'set null' }), // null if not yet accepted
  email: text('email').notNull(),
  name: text('name').notNull(),
  roleId: text('role_id').notNull().references(() => roles.id, { onDelete: 'restrict' }),
  status: text('status').notNull().default('invited'), // 'invited', 'active', 'removed'
  inviteToken: text('invite_token').unique(),
  inviteExpiresAt: integer('invite_expires_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// Role Hierarchy Table - Defines parent-child relationships between roles
export const roleHierarchy = sqliteTable('role_hierarchy', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  businessId: text('business_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
  parentRoleId: text('parent_role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  childRoleId: text('child_role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
  orderPosition: integer('order_position').default(0).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});


// Reviews table
export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => user.id),
  userName: text("user_name").notNull(),
  userRole: text("user_role"), // e.g. "Shopify Seller", "Reseller"
  location: text("location"),
  rating: integer("rating").notNull(), // 1-5
  comment: text("comment").notNull(),
  status: text("status").default("approved"), // pending, approved, rejected
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});
