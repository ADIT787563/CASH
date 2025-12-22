"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Zap, MessageCircle, TrendingUp, Users, Code, CheckCircle2 } from "lucide-react";
import { Footer } from "@/components/home/Footer";
import { motion } from "framer-motion";

const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.2
        }
    }
};

export default function FeaturesPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <motion.section
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="relative py-24 lg:py-40 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5 animate-gradient" />

                <div className="relative container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="max-w-5xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in">
                            <Sparkles className="w-5 h-5 text-primary" />
                            <span className="text-base font-medium text-primary">All Features</span>
                        </div>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-8 animate-fade-in">
                            Automate your business. <br />
                            Serve customers 24/7. <br />
                            <span className="gradient-text">Grow 3x faster.</span>
                        </h1>

                        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-4xl mx-auto animate-fade-in">
                            Wavegroww gives you powerful automation, messaging, and sales tools designed for D2C and SMB brands.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center animate-fade-in">
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg text-lg"
                            >
                                Start Free Trial
                                <ArrowRight className="w-6 h-6" />
                            </Link>
                            <Link
                                href="/plans"
                                className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-card text-foreground border border-border rounded-lg font-semibold hover:bg-muted transition-all text-lg"
                            >
                                View Pricing
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Feature Groups Overview */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="py-16 lg:py-24 bg-muted/30"
            >
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Zap,
                                title: "Powerful Automation",
                                points: [
                                    "24/7 automated workflows",
                                    "Smart customer engagement",
                                    "Zero manual effort"
                                ],
                                link: "#automation"
                            },
                            {
                                icon: MessageCircle,
                                title: "Messaging",
                                points: [
                                    "WhatsApp broadcasts",
                                    "Template library",
                                    "Live chat inbox"
                                ],
                                link: "#whatsapp-tools"
                            },
                            {
                                icon: TrendingUp,
                                title: "Growth Tools",
                                points: [
                                    "Abandoned cart recovery",
                                    "Cross-sell automation",
                                    "Customer winback"
                                ],
                                link: "#automation"
                            },
                            {
                                icon: Users,
                                title: "Management & Team Controls",
                                points: [
                                    "Role-based access",
                                    "Team collaboration",
                                    "Audit logs"
                                ],
                                link: "#team-tools"
                            }
                        ].map((group, index) => (
                            <div key={index} className="glass-card p-6 rounded-2xl hover:border-primary/30 transition-all">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                                    <group.icon className="w-6 h-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{group.title}</h3>
                                <ul className="space-y-2 mb-4">
                                    {group.points.map((point, i) => (
                                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                                <a href={group.link} className="text-primary font-medium hover:underline text-sm">
                                    Learn more →
                                </a>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Core Features */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="py-16 md:py-24"
            >
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="max-w-6xl mx-auto space-y-24">
                        {/* Unified Dashboard */}
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                    Unified <span className="gradient-text">Dashboard</span>
                                </h2>
                                <p className="text-lg text-muted-foreground mb-6">
                                    Manage customers, orders, campaigns, automations, and analytics from one dashboard.
                                </p>
                                <ul className="space-y-3">
                                    {[
                                        "Track real-time chat activity",
                                        "See automation performance",
                                        "View message delivery and conversion data",
                                        "Multi-role access for team"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="glass-card p-8 rounded-2xl">
                                <div className="aspect-video bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center">
                                    <Zap className="w-16 h-16 text-primary/40" />
                                </div>
                            </div>
                        </div>

                        {/* Smart Customer Profiles */}
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div className="order-2 lg:order-1 glass-card p-8 rounded-2xl">
                                <div className="aspect-video bg-gradient-to-br from-accent/10 to-secondary/10 rounded-xl flex items-center justify-center">
                                    <Users className="w-16 h-16 text-accent/40" />
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                    Smart Customer <span className="gradient-text">Profiles</span>
                                </h2>
                                <p className="text-lg text-muted-foreground mb-6">
                                    Every customer gets an auto-built profile.
                                </p>
                                <ul className="space-y-3">
                                    {[
                                        "Shows order history, messages, behaviour, tags",
                                        "Helps personalize automation and campaigns",
                                        "Auto-sync with catalog and CRM"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Catalog & Product Management */}
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                    Catalog & Product <span className="gradient-text">Management</span>
                                </h2>
                                <p className="text-lg text-muted-foreground mb-6">
                                    Complete control over your product catalog.
                                </p>
                                <ul className="space-y-3">
                                    {[
                                        "Upload unlimited products",
                                        "Add images, price, SKU, variants, stock",
                                        "Hide/show items dynamically",
                                        "Auto-sync with automations (e.g., abandoned cart reminders)",
                                        "Manage offers and discounts"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="glass-card p-8 rounded-2xl">
                                <div className="aspect-video bg-gradient-to-br from-secondary/10 to-primary/10 rounded-xl flex items-center justify-center">
                                    <TrendingUp className="w-16 h-16 text-secondary/40" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Automation Engine */}
            <motion.section
                id="automation"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="py-16 lg:py-24 bg-muted/30"
            >
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Automations that work for you — <span className="gradient-text">even while you sleep</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Wavegroww's automation engine runs 24/7 and handles customer conversations, reminders, order updates, and marketing flows automatically.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {[
                            {
                                title: "Welcome Automation",
                                points: [
                                    "Greet new leads instantly",
                                    "Introduce brand, offers, catalog",
                                    "Auto-tag new users"
                                ]
                            },
                            {
                                title: "COD Verification Flow",
                                points: [
                                    "Automatic COD confirmation messages",
                                    "Reduce RTO losses",
                                    "Auto-cancel unverified orders"
                                ]
                            },
                            {
                                title: "Order Updates Automation",
                                points: [
                                    "Auto-send order confirmation",
                                    "Payments update",
                                    "Out for delivery and delivered notifications"
                                ]
                            },
                            {
                                title: "Abandoned Cart Recovery",
                                points: [
                                    "Detect dropped carts",
                                    "Send reminders with unique offers",
                                    "Behaviour-based messages",
                                    "Pre-made templates"
                                ]
                            },
                            {
                                title: "Cross-Sell & Upsell Automations",
                                points: [
                                    "Recommend related products",
                                    "Triggered by user behaviour",
                                    "Personalized messaging"
                                ]
                            },
                            {
                                title: "Customer Winback Flow",
                                points: [
                                    "Identify inactive customers",
                                    "Send re-engagement messages",
                                    "Detect purchase cycle timing"
                                ]
                            },
                            {
                                title: "Review & Feedback Automation",
                                points: [
                                    "Automatically request feedback after delivery",
                                    "Auto-tag satisfied vs unsatisfied customers"
                                ]
                            }
                        ].map((automation, index) => (
                            <div key={index} className="glass-card p-6 rounded-2xl">
                                <h3 className="text-xl font-bold mb-4">{automation.title}</h3>
                                <ul className="space-y-2">
                                    {automation.points.map((point, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* WhatsApp Tools Section */}
            <motion.section
                id="whatsapp-tools"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="py-16 lg:py-24"
            >
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            WhatsApp tools built for <span className="gradient-text">modern businesses</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Everything customers expect: instant replies, broadcasts, templates, and live chat — all in one dashboard.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {[
                            {
                                title: "WhatsApp Broadcasts",
                                points: [
                                    "Send campaign messages in bulk",
                                    "Segment contacts by tags, behaviour, location, etc.",
                                    "Live delivery & conversion tracking",
                                    "Schedule broadcasts"
                                ]
                            },
                            {
                                title: "Smart Reply Bot",
                                points: [
                                    "24/7 instant replies",
                                    "Keyword-based responses",
                                    "Error-free customer support",
                                    "Can handle FAQs, orders, payment info"
                                ]
                            },
                            {
                                title: "Template Library",
                                points: [
                                    "Ready-made WhatsApp templates for Orders, Reminders, Offers, Announcements, Follow-ups",
                                    "One-click approval and use"
                                ]
                            },
                            {
                                title: "Live Chat Inbox",
                                points: [
                                    "Unified WhatsApp chat inbox",
                                    "Assign chats to team members",
                                    "Priority conversation marking",
                                    "Saved replies"
                                ]
                            }
                        ].map((tool, index) => (
                            <div key={index} className="glass-card p-8 rounded-2xl">
                                <h3 className="text-2xl font-bold mb-4">{tool.title}</h3>
                                <ul className="space-y-3">
                                    {tool.points.map((point, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                            <span className="text-muted-foreground">{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Team & Management Tools */}
            <motion.section
                id="team-tools"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="py-16 lg:py-24 bg-muted/30"
            >
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Built for teams of <span className="gradient-text">every size</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {[
                            {
                                title: "Roles & Permissions",
                                points: [
                                    "Owner → Manager → Staff hierarchy",
                                    "Control what each member can access",
                                    "Restrict sensitive areas (billing, automations, etc.)"
                                ]
                            },
                            {
                                title: "Team Collaboration",
                                points: [
                                    "Assign chats to team members",
                                    "Team performance insights",
                                    "Internal notes inside conversations"
                                ]
                            },
                            {
                                title: "Audit Logs",
                                points: [
                                    "Track what each member changes",
                                    "Full activity history",
                                    "Helps with accountability and security"
                                ]
                            }
                        ].map((feature, index) => (
                            <div key={index} className="glass-card p-6 rounded-2xl">
                                <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                                <ul className="space-y-2">
                                    {feature.points.map((point, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                            {point}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Integrations & API Section */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="py-16 lg:py-24"
            >
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Works with your <span className="gradient-text">existing tools</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Wavegroww is integrated with leading platforms for seamless workflow and sync.
                        </p>
                    </div>

                    <div className="max-w-5xl mx-auto">
                        <div className="glass-card p-8 rounded-2xl mb-8">
                            <h3 className="text-2xl font-bold mb-6">Integrations</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[
                                    "WhatsApp Cloud API",
                                    "Google Login Authentication",
                                    "Email automation",
                                    "Payment gateway integration",
                                    "Webhooks",
                                    "Custom API for mobile/website apps"
                                ].map((integration, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                                        <Code className="w-5 h-5 text-primary flex-shrink-0" />
                                        <span className="text-sm font-medium">{integration}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card p-8 rounded-2xl">
                            <h3 className="text-2xl font-bold mb-6">API Features</h3>
                            <ul className="grid md:grid-cols-2 gap-4">
                                {[
                                    "Create automations programmatically",
                                    "Sync customer data",
                                    "Update catalog",
                                    "Fetch analytics",
                                    "Secure HTTPS endpoints",
                                    "Fast response time"
                                ].map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                        <span className="text-muted-foreground">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </motion.section>

            {/* Feature Glossary Section */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="py-16 lg:py-24 bg-muted/30"
            >
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Feature <span className="gradient-text">Glossary</span>
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            Detailed explanation of every feature available on WaveGroww.
                        </p>
                    </div>

                    <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-x-12 gap-y-16">
                        {[
                            {
                                title: "1. Catalog & Product Features",
                                items: [
                                    { name: "Catalog Limit", desc: "Maximum number of products you can list in your store." },
                                    { name: "Product Variants", desc: "Add options like size, color, or type for each product." },
                                    { name: "Multi-Image Upload", desc: "Upload multiple photos for each product." },
                                    { name: "Bulk Upload (CSV/Excel)", desc: "Add or update many products at once using a sheet." },
                                    { name: "AI Product Descriptions", desc: "Automatically generate professional product descriptions." },
                                    { name: "Unlimited Categories", desc: "Organize products into categories without any limit." },
                                    { name: "Tags & SEO Fields", desc: "Improve product visibility with keywords and meta details." }
                                ]
                            },
                            {
                                title: "2. WhatsApp Automation Features",
                                items: [
                                    { name: "Auto Replies", desc: "Automatic chatbot responses sent to customers without manual typing." },
                                    { name: "AI Smart Replies", desc: "AI suggests or sends intelligent answers for common questions." },
                                    { name: "Auto Greeting Message", desc: "A welcome message automatically sent to new customers." },
                                    { name: "Auto Follow-Up Messages", desc: "Sends reminders to customers who didn't respond." },
                                    { name: "Abandoned Cart Reminder", desc: "Messages sent to customers who added products but didn't buy." },
                                    { name: "WhatsApp Numbers Allowed", desc: "Number of WhatsApp accounts you can connect to the system." },
                                    { name: "Message Routing", desc: "Automatically assigns customer chats to specific team members." },
                                    { name: "Quick Reply Templates", desc: "Save and send pre-made messages with one click." }
                                ]
                            },
                            {
                                title: "3. Orders & Checkout",
                                items: [
                                    { name: "Basic Order Form", desc: "Simple form for collecting customer details during purchase." },
                                    { name: "Custom Checkout Fields", desc: "Add fields like address, email, or notes to the checkout page." },
                                    { name: "Address / Email Collection", desc: "Capture customer location and contact details automatically." },
                                    { name: "Shipping Rules", desc: "Set delivery charges based on pincode or order amount." },
                                    { name: "Order Tracking Link", desc: "Give customers a link to check their order status." },
                                    { name: "Payment QR on Checkout", desc: "Show a QR code for instant online payment at checkout." }
                                ]
                            },
                            {
                                title: "4. Invoice System",
                                items: [
                                    { name: "Auto Invoice Generation", desc: "Create invoices automatically for every order." },
                                    { name: "GST Support", desc: "Add GST numbers and tax values to invoices." },
                                    { name: "PDF Download", desc: "Download invoices as professionally formatted PDF files." },
                                    { name: "Branding (Logo + Colors)", desc: "Customize invoices with your store branding." },
                                    { name: "Multiple Templates", desc: "Choose from different invoice layouts." },
                                    { name: "Terms & Notes", desc: "Add return policies, conditions, or special notes on invoices." }
                                ]
                            },
                            {
                                title: "5. Analytics & Insights",
                                items: [
                                    { name: "Basic Analytics", desc: "View simple stats like orders, visitors, and page views." },
                                    { name: "Revenue Chart", desc: "Track how much money you're earning over time." },
                                    { name: "Top Customers List", desc: "Identify customers who buy the most from you." },
                                    { name: "Conversion Rate", desc: "Measure how many visitors turned into buyers." },
                                    { name: "Team Analytics", desc: "Track performance of staff members handling chats or orders." }
                                ]
                            },
                            {
                                title: "6. Team & Permissions",
                                items: [
                                    { name: "Team Members", desc: "Number of people that can access the dashboard with you." },
                                    { name: "Roles & Permissions", desc: "Control what each team member is allowed to do." },
                                    { name: "Activity Logs", desc: "See who made changes, replied to customers, or updated items." },
                                    { name: "Multi-Agent Inbox", desc: "Multiple staff members can chat with customers simultaneously." }
                                ]
                            },
                            {
                                title: "7. Integrations & API",
                                items: [
                                    { name: "API Access", desc: "Connect WaveGroww to your own apps or software." },
                                    { name: "Webhooks", desc: "Receive automatic updates when actions like orders or messages occur." },
                                    { name: "Razorpay Integration", desc: "Accept online payments with Razorpay inside checkout." },
                                    { name: "Google Sheets Sync", desc: "Automatically sync orders or catalogs with Google Sheets." },
                                    { name: "Meta API", desc: "Connect official WhatsApp Cloud API for messaging automation." },
                                    { name: "ERP/CRM Integration", desc: "Connect advanced systems used by enterprises for large operations." }
                                ]
                            },
                            {
                                title: "8. Support & Service",
                                items: [
                                    { name: "Email Support", desc: "Get help through email." },
                                    { name: "WhatsApp Support", desc: "Receive support messages directly on WhatsApp." },
                                    { name: "Phone Support", desc: "Get assistance via direct phone calls." },
                                    { name: "Onboarding Assistance", desc: "Help with setup and starting your store." },
                                    { name: "Custom Feature Requests", desc: "Ask for special features built only for your business." }
                                ]
                            }
                        ].map((category, index) => (
                            <div key={index} className="space-y-6">
                                <h3 className="text-2xl font-bold border-b border-border/50 pb-4">{category.title}</h3>
                                <div className="space-y-4">
                                    {category.items.map((item, i) => (
                                        <div key={i} className="group">
                                            <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                                                {item.name}
                                            </h4>
                                            <p className="text-sm text-muted-foreground mt-1">
                                                {item.desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Final CTA Banner */}
            <motion.section
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
                className="py-16 lg:py-24 bg-gradient-to-br from-primary/10 via-accent/5 to-secondary/10"
            >
                <div className="container mx-auto px-4 md:px-6 lg:px-8">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">
                            Start automating your <span className="gradient-text">business today</span>
                        </h2>
                        <p className="text-lg text-muted-foreground mb-8">
                            No coding required. No setup headache. Everything works out of the box.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/register"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-all hover:scale-105 shadow-lg"
                            >
                                Start Free Trial
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-card text-foreground border border-border rounded-lg font-semibold hover:bg-muted transition-all"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Talk to Sales
                            </Link>
                        </div>
                    </div>
                </div>
            </motion.section>

            <Footer />
        </div>
    );
}
