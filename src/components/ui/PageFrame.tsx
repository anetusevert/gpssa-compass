"use client";

/**
 * Viewport-fit page shell — no document scroll.
 * Header stays fixed; children fill remaining height (tile-scroll inside).
 */
export function PageFrame({
  children,
  header,
  className = "",
  contentClassName = "",
}: {
  children: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}) {
  return (
    <div
      className={`flex h-full min-h-0 flex-col overflow-hidden ${className}`}
      data-page-frame
    >
      {header ? <div className="shrink-0">{header}</div> : null}
      <div className={`min-h-0 flex-1 overflow-hidden ${contentClassName}`}>
        {children}
      </div>
    </div>
  );
}

/** Scroll only inside a tile / panel — never the page. */
export function TileScroll({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden ${className}`}>
      {children}
    </div>
  );
}
