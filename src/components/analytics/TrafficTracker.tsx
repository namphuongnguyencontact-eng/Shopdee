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

export function getUserAcquisitionSource(): {
  source: string;
  medium?: string;
  campaign?: string;
  referrer?: string;
} {
  if (typeof window === "undefined") return { source: "Direct" };
  const source = localStorage.getItem("shopdee_user_source") || "Direct";
  const medium = localStorage.getItem("shopdee_user_medium") || undefined;
  const campaign = localStorage.getItem("shopdee_user_campaign") || undefined;
  const referrer = localStorage.getItem("shopdee_user_referrer") || undefined;
  return { source, medium, campaign, referrer };
}

export default function TrafficTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string>("");
  const isInitialHeartbeat = useRef<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname?.startsWith("/admin")) return; // Do not track admin back-office pages

    // Check if logged in user is admin
    try {
      const authUser = localStorage.getItem("shopdee_auth_user");
      if (authUser) {
        const parsed = JSON.parse(authUser);
        if (parsed?.role === "admin") return;
      }
    } catch {}

    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const fullPath = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");

    // 1. Initial Source Detection & Store in localStorage
    if (!localStorage.getItem("shopdee_user_source")) {
      const initialReferrer = document.referrer || "";
      const refLower = initialReferrer.toLowerCase();
      const utmSource = (searchParams?.get("utm_source") || "").toLowerCase();

      let detected = "Direct";
      if (utmSource.includes("threads") || refLower.includes("threads.net")) detected = "Threads";
      else if (utmSource.includes("tiktok") || refLower.includes("tiktok.com") || searchParams?.has("ttclid")) detected = "TikTok";
      else if (utmSource.includes("facebook") || utmSource === "fb" || refLower.includes("facebook.com") || searchParams?.has("fbclid")) detected = "Facebook";
      else if (utmSource.includes("instagram") || utmSource === "ig" || refLower.includes("instagram.com")) detected = "Instagram";
      else if (utmSource.includes("google") || refLower.includes("google.com") || searchParams?.has("gclid")) detected = "Google";
      else if (utmSource.includes("zalo") || refLower.includes("zalo.me")) detected = "Zalo";
      else if (utmSource.includes("youtube") || refLower.includes("youtube.com")) detected = "YouTube";
      else if (utmSource) detected = utmSource.charAt(0).toUpperCase() + utmSource.slice(1);
      else if (initialReferrer) {
        try {
          detected = new URL(initialReferrer).hostname;
        } catch {
          detected = "Referral";
        }
      }

      localStorage.setItem("shopdee_user_source", detected);
      localStorage.setItem("shopdee_user_referrer", initialReferrer);
      if (searchParams?.get("utm_medium")) localStorage.setItem("shopdee_user_medium", searchParams.get("utm_medium")!);
      if (searchParams?.get("utm_campaign")) localStorage.setItem("shopdee_user_campaign", searchParams.get("utm_campaign")!);
    }

    // 2. Initial Heartbeat & Session Register
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
    if (pathname?.startsWith("/admin")) return; // Do not track admin back-office pages

    try {
      const authUser = localStorage.getItem("shopdee_auth_user");
      if (authUser) {
        const parsed = JSON.parse(authUser);
        if (parsed?.role === "admin") return;
      }
    } catch {}

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
