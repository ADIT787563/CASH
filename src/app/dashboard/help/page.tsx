"use client";

import { ActionButton } from "@/components/ui/ActionButton";
import { MessageSquare, PlayCircle, BookOpen, ExternalLink, Mail, Phone } from "lucide-react";

export default function HelpPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="text-center space-y-2">
                <h1 className="text-3xl font-bold text-white tracking-tight">How can we help you?</h1>
                <p className="text-white/60">Search for help, read guides, or contact support.</p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors group cursor-pointer">
                    <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Video Tutorials</h3>
                    <p className="text-sm text-white/50">Watch step-by-step guides on setting up your store and WhatsApp.</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors group cursor-pointer">
                    <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Documentation</h3>
                    <p className="text-sm text-white/50">Read detailed articles about features, payments, and API.</p>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-2xl hover:bg-white/10 transition-colors group cursor-pointer">
                    <div className="w-12 h-12 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">Chat Support</h3>
                    <p className="text-sm text-white/50">Talk to our support team directly via WhatsApp.</p>
                </div>
            </div>

            {/* FAQs Section */}
            <div className="bg-[#0f0518] border border-white/10 rounded-2xl p-8">
                <h2 className="text-xl font-bold text-white mb-6">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {[
                        { q: "How do I connect my WhatsApp number?", a: "Go to Settings > WhatsApp and scan the QR code. Make sure your phone is connected to the internet." },
                        { q: "Can I use my own domain?", a: "Yes! In the Settings > Business Profile, you can add your custom domain. We provide a free .store subdomain by default." },
                        { q: "How are payments processed?", a: "We support UPI and COD. For UPI, payments go directly to your VPA. We do not hold any funds." },
                        { q: "Is there a limit on messages?", a: "The Free plan includes 1000 messages/month. Upgrade to Pro for unlimited messages." }
                    ].map((faq, i) => (
                        <div key={i} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                            <h4 className="text-white font-medium mb-2 flex items-center gap-2">
                                <span className="text-indigo-500 font-bold">Q.</span> {faq.q}
                            </h4>
                            <p className="text-sm text-white/60 ml-6">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-white/10 rounded-2xl p-8">
                <div>
                    <h3 className="text-lg font-bold text-white">Still need help?</h3>
                    <p className="text-sm text-white/60">Our team is available Mon-Fri, 9am - 6pm EST.</p>
                </div>
                <div className="flex gap-3">
                    <ActionButton variant="secondary" icon={<Mail className="w-4 h-4" />}>Email Us</ActionButton>
                    <ActionButton className="bg-[#25D366] hover:bg-[#128C7E] text-white border-none" icon={<Phone className="w-4 h-4" />}>WhatsApp Us</ActionButton>
                </div>
            </div>
        </div>
    );
}
