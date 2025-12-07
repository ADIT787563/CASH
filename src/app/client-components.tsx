'use client';

import dynamic from 'next/dynamic';

// Lazy load non-critical components with SSR disabled
const VisualEditsMessenger = dynamic(
  () => import("../visual-edits/VisualEditsMessenger"),
  { ssr: false }
);

const ErrorReporter = dynamic(
  () => import("@/components/ErrorReporter"),
  { ssr: false }
);

export default function ClientComponents() {
  return (
    <>
      <ErrorReporter />
      <VisualEditsMessenger />
    </>
  );
}
