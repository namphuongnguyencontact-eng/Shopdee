"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

interface Props {
  measurementId: string;
  excludeAdmin?: boolean;
}

export default function GoogleAnalyticsClientTracker({
  measurementId,
  excludeAdmin = true,
}: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!measurementId) return;
    if (excludeAdmin && pathname?.startsWith("/admin")) return;

    if (typeof window !== "undefined" && typeof (window as unknown as { gtag?: Function }).gtag === "function") {
      const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
      (window as unknown as { gtag: Function }).gtag("event", "page_view", {
        page_path: url,
        page_title: document.title,
      });
    }
  }, [pathname, searchParams, measurementId, excludeAdmin]);

  return null;
}
