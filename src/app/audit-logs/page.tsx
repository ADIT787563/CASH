"use client";

import { AuditLogs } from '@/components/AuditLogs';
import { RoleGuard } from '@/components/RoleGuard';

export default function AuditLogsPage() {
    return (
        <RoleGuard allowedRoles={['owner', 'admin']}>
            <div className="container mx-auto px-4 py-8">
                <AuditLogs />
            </div>
        </RoleGuard>
    );
}
