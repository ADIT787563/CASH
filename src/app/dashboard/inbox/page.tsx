import { Suspense } from 'react';
import InboxClient from './InboxClient';

export default async function InboxPage() {
    return (
        <div className="h-[calc(100vh-64px)] overflow-hidden">
            <Suspense fallback={<div className="text-white/50 p-10">Loading inbox...</div>}>
                <InboxClient />
            </Suspense>
        </div>
    );
}
