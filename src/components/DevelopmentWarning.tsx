"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

export function DevelopmentWarning() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if user has already dismissed the warning this session
        const hasDismissed = sessionStorage.getItem("devrave_warning_dismissed");
        if (!hasDismissed) {
            setIsVisible(true);
        }
    }, []);

    const handleDismiss = () => {
        setIsVisible(false);
        sessionStorage.setItem("devrave_warning_dismissed", "true");
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
                className="bg-white dark:bg-[#111827] w-full max-w-md rounded-lg shadow-lg border border-gray-200 dark:border-gray-800 p-6 relative"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="dev-warning-title"
            >
                <button
                    onClick={handleDismiss}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    aria-label="Close warning"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-md">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6 text-[#1A73E8]"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 id="dev-warning-title" className="text-xl font-semibold text-gray-900 dark:text-gray-50">
                            Development In Progress
                        </h2>
                    </div>

                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        Please do not buy any plans as we are still developing the website under <strong>DevRave</strong>.
                        Functionality may be limited or unstable.
                    </p>

                    <div className="flex justify-end pt-2">
                        <button
                            onClick={handleDismiss}
                            className="px-4 py-2 bg-[#1A73E8] hover:bg-[#1557B0] text-white text-sm font-medium rounded-md transition-colors"
                        >
                            I Understand
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
