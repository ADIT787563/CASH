"use client";

import { ActionButton } from "@/components/ui/ActionButton";
import { MessageSquare, PlayCircle, BookOpen, ExternalLink, Mail, Phone, HelpCircle } from "lucide-react";

export default function HelpPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 text-zinc-900 pb-20">
            {/* Header */}
            <div className="flex flex-col items-center text-center gap-4 py-8">
                <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mb-2">
                    <HelpCircle className="w-8 h-8 text-zinc-900" />
                </div>
                <div>
                    <h1 className="text-4xl font-extrabold text-zinc-900 tracking-tight italic">How can we help?</h1>
                    <p className="text-sm text-zinc-500 mt-1 font-medium">Search for help, read guides, or contact support.</p>
                </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-zinc-200 p-8 rounded-3xl hover:border-indigo-200 hover:shadow-xl hover:shadow-indigo-500/5 transition-all group cursor-pointer text-center">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <PlayCircle className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-3">Video Tutorials</h3>
                    <p className="text-sm text-zinc-500 font-medium leading-relaxed">Watch step-by-step guides on setting up your store and WhatsApp.</p>
                </div>

                <div className="bg-white border border-zinc-200 p-8 rounded-3xl hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-500/5 transition-all group cursor-pointer text-center">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <BookOpen className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-3">Documentation</h3>
                    <p className="text-sm text-zinc-500 font-medium leading-relaxed">Read detailed articles about features, payments, and API.</p>
                </div>

                <div className="bg-white border border-zinc-200 p-8 rounded-3xl hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5 transition-all group cursor-pointer text-center">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                        <MessageSquare className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-3">Chat Support</h3>
                    <p className="text-sm text-zinc-500 font-medium leading-relaxed">Talk to our support team directly via WhatsApp.</p>
                </div>
            </div>

            {/* FAQs Section */}
            <div className="bg-zinc-50/50 border border-zinc-200 rounded-3xl p-10">
                <h2 className="text-2xl font-bold text-zinc-900 mb-8 flex items-center gap-3">
                    <span className="w-8 h-8 bg-zinc-900 text-white rounded-lg flex items-center justify-center text-sm">?</span>
                    Frequently Asked Questions
                </h2>
                <div className="grid gap-6">
                    {[
                        { q: "How do I connect my WhatsApp number?", a: "Go to Settings > WhatsApp and scan the QR code. Make sure your phone is connected to the internet." },
                        { q: "Can I use my own domain?", a: "Yes! In the Settings > Business Profile, you can add your custom domain. We provide a free .store subdomain by default." },
                        { q: "How are payments processed?", a: "We support UPI and COD. For UPI, payments go directly to your VPA. We do not hold any funds." },
                        { q: "Is there a limit on messages?", a: "The Free plan includes 1000 messages/month. Upgrade to Pro for unlimited messages." }
                    ].map((faq, i) => (
                        <div key={i} className="bg-white border border-zinc-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="text-zinc-900 font-bold mb-3 flex items-start gap-3">
                                <span className="text-indigo-600 font-black shrink-0 mt-0.5">Q.</span>
                                <span className="text-lg">{faq.q}</span>
                            </h4>
                            <p className="text-sm font-medium text-zinc-500 ml-8 leading-relaxed italic">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Contact Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-8 bg-zinc-900 rounded-3xl p-10 shadow-2xl shadow-indigo-500/10">
                <div>
                    <h3 className="text-2xl font-bold text-white mb-2">Still need help?</h3>
                    <p className="text-zinc-400 font-medium">Our team is available Mon-Fri, 9am - 6pm EST.</p>
                </div>
                <div className="flex gap-4">
                    <ActionButton variant="secondary" icon={<Mail className="w-4 h-4" />} className="bg-white text-zinc-900 border-none px-8 h-12">Email Us</ActionButton>
                    <ActionButton className="bg-[#25D366] hover:bg-[#128C7E] text-white border-none shadow-lg shadow-emerald-500/20 px-8 h-12" icon={<Phone className="w-4 h-4" />}>WhatsApp Us</ActionButton>
                </div>
            </div>
        </div>
    );
}
