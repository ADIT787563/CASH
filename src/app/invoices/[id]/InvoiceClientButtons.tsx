"use client";

import { Download, Printer } from "lucide-react";

export default function InvoiceClientButtons() {
    return (
        <div className="flex gap-3">
            <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-white text-sm font-medium"
            >
                <Printer className="w-4 h-4" />
                Print
            </button>
            <button
                onClick={() => window.print()}
                className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 rounded-lg transition-colors text-white text-sm font-medium"
            >
                <Download className="w-4 h-4" />
                Download PDF
            </button>
        </div>
    );
}
