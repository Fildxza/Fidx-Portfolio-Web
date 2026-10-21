"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Renders its children only once the placeholder is near the viewport, so heavy
 * interactive widgets below the fold don't add to the page's initial JavaScript.
 * Use it for demos, not for content that search engines should read.
 */
export function LazyMount({
  children,
  minHeight = 520,
  rootMargin = "400px",
}: {
  children: React.ReactNode;
  minHeight?: number;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [visible, rootMargin]);

  return (
    <div ref={ref} style={visible ? undefined : { minHeight }}>
      {visible ? children : null}
    </div>
  );
}
