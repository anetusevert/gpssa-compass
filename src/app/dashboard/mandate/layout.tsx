/**
 * Mandate pillar shell — height-constrained flex so every child page
 * can fill remaining viewport space under the dashboard chrome.
 */
export default function MandateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
      {children}
    </div>
  );
}
