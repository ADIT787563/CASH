"use client";

import { useState } from "react";
import {
    Search,
    Plus,
    FileText,
    MoreVertical,
    CheckCircle2,
    Clock,
    XCircle,
    Save,
    Trash2,
    AlertCircle,
    Info,
    Eye
} from "lucide-react";
import {
    validateWhatsAppTemplate,
    renderTemplate,
    extractPlaceholderCount
} from "@/lib/whatsapp-template-validator";

// --- Mock Data ---
const initialTemplates = [
    { id: 1, name: "october_sale_promo", category: "MARKETING", status: "APPROVED", body: "Hey {{1}}! Our big October Sale is live. Get up to 50% off. Shop: {{2}}" },
    { id: 2, name: "order_confirmation", category: "UTILITY", status: "APPROVED", body: "Hi {{1}}, thanks for order #{{2}}. We will notify when shipped." },
    { id: 3, name: "payment_failed", category: "UTILITY", status: "REJECTED", body: "Payment failed for order {{1}}. Please retry here: {{2}}" },
];

export default function TemplatesPageV2() {
    const [templates, setTemplates] = useState(initialTemplates);
    const [selectedId, setSelectedId] = useState<number | null>(1);
    const [editForm, setEditForm] = useState(initialTemplates[0]);
    const [sampleVariables, setSampleVariables] = useState<string[]>(["Customer", "WAVE-123"]);

    const validation = validateWhatsAppTemplate({
        name: editForm.name,
        category: editForm.category.toLowerCase() as any,
        language: 'en',
        content: editForm.body
    });

    const handleSelect = (t: any) => {
        setSelectedId(t.id);
        setEditForm(t);
    };

    const handleCreate = () => {
        const newT = { id: Date.now(), name: "new_template", category: "MARKETING", status: "DRAFT", body: "Hello {{1}}..." };
        setTemplates([newT, ...templates]);
        handleSelect(newT);
    };

    return (
        <div className="h-[calc(100vh-6rem)] flex -m-8 border-t border-slate-200 dark:border-slate-800">
            {/* LEFT PANE: LIST */}
            <div className="w-1/3 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            placeholder="Search templates..."
                            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <button onClick={handleCreate} className="p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                        <Plus className="w-4 h-4" />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto">
                    {templates.map((t) => (
                        <div
                            key={t.id}
                            onClick={() => handleSelect(t)}
                            className={`p-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors
                     ${selectedId === t.id ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-l-4 border-l-indigo-500' : 'border-l-4 border-l-transparent'}
                  `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="font-medium text-slate-900 dark:text-white text-sm truncate">{t.name}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide
                         ${t.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : ''}
                         ${t.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : ''}
                         ${t.status === 'DRAFT' ? 'bg-slate-100 text-slate-700' : ''}
                      `}>
                                    {t.status}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2 font-mono">
                                {t.body}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* RIGHT PANE: EDITOR */}
            <div className="w-2/3 bg-slate-50 dark:bg-slate-900/50 flex flex-col">
                {selectedId ? (
                    <>
                        {/* Editor Header */}
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex justify-between items-center">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-slate-400" />
                                    {editForm.name}
                                </h2>
                                <p className="text-xs text-slate-400 font-mono mt-1">ID: {editForm.id} • Language: en_US</p>
                            </div>
                            <div className="flex gap-2">
                                <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700">
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </button>
                                <button className="p-2 text-rose-600 hover:bg-rose-50 rounded">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Editor Body */}
                        <div className="flex-1 p-8 overflow-y-auto">
                            <div className="max-w-2xl mx-auto space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Template Name</label>
                                        <input
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded font-mono text-sm focus:ring-2 focus:ring-indigo-500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-semibold text-slate-500 uppercase">Category</label>
                                        <select
                                            value={editForm.category}
                                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                                            className="w-full px-3 py-2 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-sm focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option>MARKETING</option>
                                            <option>UTILITY</option>
                                            <option>AUTHENTICATION</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-semibold text-slate-500 uppercase">Message Body</label>
                                    <textarea
                                        rows={6}
                                        value={editForm.body}
                                        onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                                        className={`w-full px-4 py-3 bg-white dark:bg-slate-950 border rounded text-sm font-mono leading-relaxed focus:ring-2 focus:ring-indigo-500 ${!validation.valid ? 'border-rose-300 dark:border-rose-900' : 'border-slate-200 dark:border-slate-800'}`}
                                    />
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs text-slate-400">Use {'{{1}}'}, {'{{2}}'} etc. for variables.</p>
                                        <span className={`text-[10px] font-bold ${validation.valid ? 'text-emerald-500' : 'text-rose-500'}`}>
                                            {validation.valid ? 'VALID STRUCTURE' : 'INVALID STRUCTURE'}
                                        </span>
                                    </div>

                                    {/* Validation Messages */}
                                    {(validation.errors.length > 0 || validation.warnings.length > 0) && (
                                        <div className="mt-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                                            {validation.errors.map((err, i) => (
                                                <div key={i} className="flex gap-2 text-xs text-rose-600">
                                                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                                    {err}
                                                </div>
                                            ))}
                                            {validation.warnings.map((warn, i) => (
                                                <div key={i} className="flex gap-2 text-xs text-amber-600">
                                                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                                                    {warn}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Sample Variables */}
                                {extractPlaceholderCount(editForm.body) > 0 && (
                                    <div className="space-y-3 p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-lg border border-indigo-100 dark:border-indigo-900/30">
                                        <h4 className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">Sample Variables (for preview)</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {Array.from({ length: extractPlaceholderCount(editForm.body) }).map((_, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <span className="text-[10px] text-slate-400 font-mono w-8">{'{{'}{i + 1}{'}}'}</span>
                                                    <input
                                                        placeholder={`Sample ${i + 1}`}
                                                        value={sampleVariables[i] || ""}
                                                        onChange={(e) => {
                                                            const newVars = [...sampleVariables];
                                                            newVars[i] = e.target.value;
                                                            setSampleVariables(newVars);
                                                        }}
                                                        className="flex-1 px-2 py-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded text-xs focus:ring-1 focus:ring-indigo-500"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Live Preview Box */}
                                <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Preview</h3>
                                    <div className="bg-[url('/patterns/subtle-dots.png')] bg-slate-100 dark:bg-slate-900 p-6 rounded-xl flex justify-center border border-slate-200 dark:border-slate-800">
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg rounded-tl-none shadow-sm max-w-sm border border-slate-200 dark:border-slate-700 relative">
                                            <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                                                {renderTemplate(editForm.body, sampleVariables)}
                                            </p>
                                            <div className="flex justify-end items-center gap-1 mt-2">
                                                <span className="text-[9px] text-slate-400 uppercase font-medium">Delivered</span>
                                                <span className="text-[10px] text-slate-400 block">12:42 PM</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        <p>Select a template to view details</p>
                    </div>
                )}
            </div>
        </div>
    );
}
