"use client";

import { useEffect, useState } from 'react';
import { AlertCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

interface ErrorDisplayProps {
    error?: {
        code: string;
        message: string;
        details?: Record<string, any>;
    };
    onClose?: () => void;
    autoClose?: boolean;
    autoCloseDelay?: number;
}

export function ErrorDisplay({ error, onClose, autoClose = true, autoCloseDelay = 5000 }: ErrorDisplayProps) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (autoClose && error) {
            const timer = setTimeout(() => {
                setVisible(false);
                onClose?.();
            }, autoCloseDelay);

            return () => clearTimeout(timer);
        }
    }, [error, autoClose, autoCloseDelay, onClose]);

    if (!error || !visible) return null;

    const getErrorStyle = () => {
        if (error.code.startsWith('AUTH_')) {
            return {
                bg: 'bg-red-50 dark:bg-red-900/20',
                border: 'border-red-200 dark:border-red-800',
                text: 'text-red-800 dark:text-red-200',
                icon: <XCircle className="w-5 h-5" />,
            };
        }
        if (error.code.startsWith('RATE_')) {
            return {
                bg: 'bg-yellow-50 dark:bg-yellow-900/20',
                border: 'border-yellow-200 dark:border-yellow-800',
                text: 'text-yellow-800 dark:text-yellow-200',
                icon: <AlertTriangle className="w-5 h-5" />,
            };
        }
        if (error.code.startsWith('WSP_')) {
            return {
                bg: 'bg-orange-50 dark:bg-orange-900/20',
                border: 'border-orange-200 dark:border-orange-800',
                text: 'text-orange-800 dark:text-orange-200',
                icon: <AlertCircle className="w-5 h-5" />,
            };
        }
        return {
            bg: 'bg-gray-50 dark:bg-gray-900/20',
            border: 'border-gray-200 dark:border-gray-800',
            text: 'text-gray-800 dark:text-gray-200',
            icon: <Info className="w-5 h-5" />,
        };
    };

    const style = getErrorStyle();

    return (
        <div className={`rounded-lg border ${style.border} ${style.bg} p-4 mb-4`}>
            <div className="flex items-start gap-3">
                <div className={style.text}>{style.icon}</div>

                <div className="flex-1">
                    <h3 className={`font-semibold ${style.text} mb-1`}>
                        {getUserFriendlyTitle(error.code)}
                    </h3>
                    <p className={`text-sm ${style.text}`}>
                        {error.message}
                    </p>

                    {error.details?.retryAfter && (
                        <p className={`text-xs ${style.text} mt-2`}>
                            Try again in {error.details.retryAfter} seconds
                        </p>
                    )}
                </div>

                {onClose && (
                    <button
                        onClick={() => {
                            setVisible(false);
                            onClose();
                        }}
                        className={`${style.text} hover:opacity-70 transition`}
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
}

function getUserFriendlyTitle(code: string): string {
    const titles: Record<string, string> = {
        AUTH_001_INVALID_CREDENTIALS: 'Invalid Login',
        AUTH_002_TOKEN_EXPIRED: 'Session Expired',
        RATE_001_API_EXCEEDED: 'Rate Limit Reached',
        RATE_002_MESSAGE_EXCEEDED: 'Message Limit Reached',
        WSP_131000_RATE_LIMIT: 'WhatsApp Rate Limit',
        WSP_470_TEMPLATE_REJECTED: 'Template Rejected',
        WSP_1006_NUMBER_BLOCKED: 'Number Blocked',
        BILL_001_PLAN_EXPIRED: 'Plan Expired',
        DB_003_INSERT_FAILED: 'Save Failed',
    };

    return titles[code] || 'Error Occurred';
}
