"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

const VISITOR_ID_KEY = "shopdee_visitor_id";
const SESSION_ID_KEY = "shopdee_session_id";

function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "v-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 9);
}

export function getVisitorId(): string {
  if (typeof window === "undefined") return "";
  let vid = localStorage.getItem(VISITOR_ID_KEY);
  if (!vid) {
    vid = generateUUID();
    localStorage.setItem(VISITOR_ID_KEY, vid);
  }
  return vid;
}

export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sid = sessionStorage.getItem(SESSION_ID_KEY);
  if (!sid) {
    sid = "s-" + generateUUID();
    sessionStorage.setItem(SESSION_ID_KEY, sid);
  }
  return sid;
}

export default function TrafficTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string>("");
  const isInitialHeartbeat = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    // 1. Initial Heartbeat & Session Register
    if (!isInitialHeartbeat.current) {
      isInitialHeartbeat.current = true;
      const initialReferrer = document.referrer || "";
      const searchObj: Record<string, string> = {};
      searchParams?.forEach((val, key) => {
        searchObj[key] = val;
      });

      fetch("/api/analytics/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          visitorId,
          path: fullPath,
          referrer: initialReferrer,
          searchParams: searchObj,
        }),
      }).catch(() => {});
    }

    // 2. Track PAGE_VIEW (debounced by path to prevent re-render loops)
    if (lastTrackedPath.current !== fullPath) {
      lastTrackedPath.current = fullPath;

      // Extract UTM if any
      const utmSource = searchParams?.get("utm_source") || undefined;
      const utmMedium = searchParams?.get("utm_medium") || undefined;
      const utmCampaign = searchParams?.get("utm_campaign") || undefined;

      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "page_view",
          sessionId,
          visitorId,
          path: fullPath,
          source: utmSource,
          medium: utmMedium,
          campaign: utmCampaign,
          device: window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop",
        }),
      }).catch(() => {});
    }
  }, [pathname, searchParams]);

  // 3. Periodic Heartbeat every 30 seconds for Active Shopper tracking
  useEffect(() => {
    if (typeof window === "undefined") return;

    const interval = setInterval(() => {
      const visitorId = getVisitorId();
      const sessionId = getSessionId();
      const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

      fetch("/api/analytics/heartbeat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          visitorId,
          path: fullPath,
        }),
      }).catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, [pathname, searchParams]);

  return null;
}
