// Force per-request rendering so this route is never statically cached —
// static caching risks the CDN serving a stale RSC payload as the page body.
export const dynamic = 'force-dynamic';

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
