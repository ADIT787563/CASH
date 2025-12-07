"use client";

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export function MaintenanceMode() {
    const [status, setStatus] = useState<{
        locked: boolean;
        lockMode: string;
        lockReason?: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    const checkStatus = async () => {
        try {
            const response = await fetch('/api/system/status');
            if (response.ok) {
                const data = await response.json();
                setStatus(data);
            }
        } catch (error) {
            console.error('Failed to check system status:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!status?.locked) {
        return null; // System not in maintenance mode
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
            <div className="max-w-md w-full">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
                    <div className="flex justify-center mb-6">
                        <div className="bg-yellow-100 dark:bg-yellow-900/30 rounded-full p-4">
                            <AlertTriangle className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
                        </div>
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        System Maintenance
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        {status.lockReason || 'We are currently performing scheduled maintenance. Please check back soon.'}
                    </p>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 mb-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Our team is working to improve your experience. We apologize for any inconvenience.
                        </p>
                    </div>

                    <button
                        onClick={checkStatus}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Check Status
                    </button>

                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-6">
                        Status updates automatically every 30 seconds
                    </p>
                </div>
            </div>
        </div>
    );
}
