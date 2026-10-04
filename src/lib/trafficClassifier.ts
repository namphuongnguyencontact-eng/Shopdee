export interface ClassifiedTraffic {
  source: string;
  category: "Organic Search" | "Social" | "Referral" | "Direct" | "Campaign";
  medium: string;
  campaign?: string;
  term?: string;
  content?: string;
  referrerDomain?: string;
}

export interface ClientDeviceInfo {
  device: "desktop" | "mobile" | "tablet";
  browser: string;
  os: string;
}

export interface PlatformMeta {
  name: string;
  category: "Social" | "Organic Search" | "Direct" | "Referral" | "Campaign";
  color: string;
  badgeBg: string;
  textColor: string;
  icon: string;
}

export const PLATFORMS_META: Record<string, PlatformMeta> = {
  Facebook: {
    name: "Facebook",
    category: "Social",
    color: "#1877F2",
    badgeBg: "bg-blue-600/15 border-blue-500/30",
    textColor: "text-blue-400",
    icon: "Facebook",
  },
  TikTok: {
    name: "TikTok",
    category: "Social",
    color: "#00F2FE",
    badgeBg: "bg-cyan-500/15 border-cyan-500/30",
    textColor: "text-cyan-400",
    icon: "Video",
  },
  Threads: {
    name: "Threads",
    category: "Social",
    color: "#FFFFFF",
    badgeBg: "bg-neutral-800/80 border-white/20",
    textColor: "text-white",
    icon: "AtSign",
  },
  Instagram: {
    name: "Instagram",
    category: "Social",
    color: "#E1306C",
    badgeBg: "bg-pink-500/15 border-pink-500/30",
    textColor: "text-pink-400",
    icon: "Instagram",
  },
  Google: {
    name: "Google",
    category: "Organic Search",
    color: "#4285F4",
    badgeBg: "bg-red-500/15 border-red-500/30",
    textColor: "text-red-400",
    icon: "Search",
  },
  Zalo: {
    name: "Zalo",
    category: "Social",
    color: "#0068FF",
    badgeBg: "bg-sky-500/15 border-sky-500/30",
    textColor: "text-sky-400",
    icon: "MessageCircle",
  },
  YouTube: {
    name: "YouTube",
    category: "Social",
    color: "#FF0000",
    badgeBg: "bg-rose-500/15 border-rose-500/30",
    textColor: "text-rose-400",
    icon: "Youtube",
  },
  "X (Twitter)": {
    name: "X (Twitter)",
    category: "Social",
    color: "#1DA1F2",
    badgeBg: "bg-zinc-800 border-white/20",
    textColor: "text-zinc-200",
    icon: "Twitter",
  },
  Shopee: {
    name: "Shopee",
    category: "Referral",
    color: "#EE4D2D",
    badgeBg: "bg-orange-500/15 border-orange-500/30",
    textColor: "text-orange-400",
    icon: "ShoppingBag",
  },
  Lazada: {
    name: "Lazada",
    category: "Referral",
    color: "#0f146d",
    badgeBg: "bg-indigo-500/15 border-indigo-500/30",
    textColor: "text-indigo-400",
    icon: "ShoppingBag",
  },
  Telegram: {
    name: "Telegram",
    category: "Social",
    color: "#229ED9",
    badgeBg: "bg-sky-500/15 border-sky-500/30",
    textColor: "text-sky-300",
    icon: "Send",
  },
  "Cốc Cốc": {
    name: "Cốc Cốc",
    category: "Organic Search",
    color: "#2EA836",
    badgeBg: "bg-green-500/15 border-green-500/30",
    textColor: "text-green-400",
    icon: "Search",
  },
  Direct: {
    name: "Direct / Trực tiếp",
    category: "Direct",
    color: "#10B981",
    badgeBg: "bg-emerald-500/15 border-emerald-500/30",
    textColor: "text-emerald-400",
    icon: "Compass",
  },
};

export function getPlatformMeta(sourceName: string): PlatformMeta {
  if (PLATFORMS_META[sourceName]) return PLATFORMS_META[sourceName];
  const lower = sourceName.toLowerCase();
  for (const [key, meta] of Object.entries(PLATFORMS_META)) {
    if (lower.includes(key.toLowerCase())) return meta;
  }
  return {
    name: sourceName,
    category: "Referral",
    color: "#8B5CF6",
    badgeBg: "bg-purple-500/15 border-purple-500/30",
    textColor: "text-purple-400",
    icon: "ExternalLink",
  };
}

/**
 * Classifies traffic source based on Referrer URL, search/UTM parameters, and User Agent.
 */
export function classifyTraffic(
  referrer?: string,
  searchParams?: Record<string, string | string[] | undefined> | URLSearchParams,
  userAgent?: string
): ClassifiedTraffic {
  let utmSource = "";
  let utmMedium = "";
  let utmCampaign = "";
  let utmTerm = "";
  let utmContent = "";
  let fbclid = "";
  let ttclid = "";
  let gclid = "";
  let refParam = "";

  if (searchParams) {
    if (searchParams instanceof URLSearchParams) {
      utmSource = searchParams.get("utm_source") || "";
      utmMedium = searchParams.get("utm_medium") || "";
      utmCampaign = searchParams.get("utm_campaign") || "";
      utmTerm = searchParams.get("utm_term") || "";
      utmContent = searchParams.get("utm_content") || "";
      fbclid = searchParams.get("fbclid") || "";
      ttclid = searchParams.get("ttclid") || "";
      gclid = searchParams.get("gclid") || searchParams.get("dclid") || "";
      refParam = searchParams.get("ref") || searchParams.get("referrer") || "";
    } else {
      const getVal = (k: string) => {
        const v = searchParams[k];
        return Array.isArray(v) ? v[0] || "" : v || "";
      };
      utmSource = getVal("utm_source");
      utmMedium = getVal("utm_medium");
      utmCampaign = getVal("utm_campaign");
      utmTerm = getVal("utm_term");
      utmContent = getVal("utm_content");
      fbclid = getVal("fbclid");
      ttclid = getVal("ttclid");
      gclid = getVal("gclid") || getVal("dclid");
      refParam = getVal("ref") || getVal("referrer");
    }
  }

  const referrerDomain = extractDomain(referrer);
  const lowerDomain = (referrerDomain || "").toLowerCase();
  const lowerUA = (userAgent || "").toLowerCase();

  // 1. Check for UTM parameters (Paid / Custom Campaigns take priority)
  if (utmSource) {
    let normalizedSource = utmSource.trim();
    const lower = normalizedSource.toLowerCase();

    if (lower.includes("tiktok")) normalizedSource = "TikTok";
    else if (lower.includes("facebook") || lower === "fb") normalizedSource = "Facebook";
    else if (lower.includes("instagram") || lower === "ig") normalizedSource = "Instagram";
    else if (lower.includes("threads")) normalizedSource = "Threads";
    else if (lower.includes("google")) normalizedSource = "Google";
    else if (lower.includes("youtube") || lower === "yt") normalizedSource = "YouTube";
    else if (lower.includes("zalo")) normalizedSource = "Zalo";
    else if (lower.includes("twitter") || lower === "x") normalizedSource = "X (Twitter)";
    else if (lower.includes("shopee")) normalizedSource = "Shopee";
    else if (lower.includes("lazada")) normalizedSource = "Lazada";

    return {
      source: normalizedSource,
      category: "Campaign",
      medium: utmMedium || "campaign",
      campaign: utmCampaign || undefined,
      term: utmTerm || undefined,
      content: utmContent || undefined,
      referrerDomain,
    };
  }

  // 2. Click IDs detection (Even when referrer header is stripped by in-app browsers)
  if (fbclid) {
    return {
      source: "Facebook",
      category: "Social",
      medium: "social_click",
      referrerDomain: referrerDomain || "facebook.com",
    };
  }

  if (ttclid) {
    return {
      source: "TikTok",
      category: "Social",
      medium: "social_click",
      referrerDomain: referrerDomain || "tiktok.com",
    };
  }

  if (gclid) {
    return {
      source: "Google",
      category: "Organic Search",
      medium: "cpc",
      referrerDomain: referrerDomain || "google.com",
    };
  }

  // 3. Ref parameter detection
  if (refParam) {
    const lowerRef = refParam.toLowerCase();
    if (lowerRef.includes("threads")) return { source: "Threads", category: "Social", medium: "social" };
    if (lowerRef.includes("tiktok")) return { source: "TikTok", category: "Social", medium: "social" };
    if (lowerRef.includes("facebook") || lowerRef.includes("fb")) return { source: "Facebook", category: "Social", medium: "social" };
    if (lowerRef.includes("instagram") || lowerRef.includes("ig")) return { source: "Instagram", category: "Social", medium: "social" };
    if (lowerRef.includes("zalo")) return { source: "Zalo", category: "Social", medium: "social" };
    if (lowerRef.includes("shopee")) return { source: "Shopee", category: "Referral", medium: "affiliate" };
  }

  // 4. In-App Browser User-Agent Detection
  if (lowerUA.includes("barcelona")) {
    return { source: "Threads", category: "Social", medium: "in_app" };
  }
  if (lowerUA.includes("fban") || lowerUA.includes("fbav")) {
    return { source: "Facebook", category: "Social", medium: "in_app" };
  }
  if (lowerUA.includes("instagram")) {
    return { source: "Instagram", category: "Social", medium: "in_app" };
  }
  if (lowerUA.includes("tiktok") || lowerUA.includes("musical_ly") || lowerUA.includes("bytelocale")) {
    return { source: "TikTok", category: "Social", medium: "in_app" };
  }
  if (lowerUA.includes("zalo")) {
    return { source: "Zalo", category: "Social", medium: "in_app" };
  }

  // 5. Referrer Domain Matching
  if (lowerDomain) {
    // Threads
    if (
      lowerDomain.includes("threads.net") ||
      lowerDomain.includes("threads.com") ||
      lowerDomain.includes("l.threads.net") ||
      lowerDomain.includes("l.threads.com")
    ) {
      return { source: "Threads", category: "Social", medium: "social", referrerDomain };
    }

    // TikTok
    if (
      lowerDomain.includes("tiktok.com") ||
      lowerDomain.includes("douyin.com") ||
      lowerDomain.includes("byteoversea.com") ||
      lowerDomain.includes("bytedance.com")
    ) {
      return { source: "TikTok", category: "Social", medium: "social", referrerDomain };
    }

    // Facebook
    if (
      lowerDomain.includes("facebook.com") ||
      lowerDomain.includes("fb.com") ||
      lowerDomain.includes("fb.me") ||
      lowerDomain.includes("messenger.com")
    ) {
      return { source: "Facebook", category: "Social", medium: "social", referrerDomain };
    }

    // Instagram
    if (lowerDomain.includes("instagram.com") || lowerDomain.includes("ig.me")) {
      return { source: "Instagram", category: "Social", medium: "social", referrerDomain };
    }

    // Zalo
    if (lowerDomain.includes("zalo.me") || lowerDomain.includes("zalo.vn")) {
      return { source: "Zalo", category: "Social", medium: "social", referrerDomain };
    }

    // Google
    if (lowerDomain.includes("google.") || lowerDomain.includes("googleadservices.com")) {
      return { source: "Google", category: "Organic Search", medium: "organic", referrerDomain };
    }

    // YouTube
    if (lowerDomain.includes("youtube.com") || lowerDomain.includes("youtu.be")) {
      return { source: "YouTube", category: "Social", medium: "social", referrerDomain };
    }

    // X / Twitter
    if (lowerDomain.includes("twitter.com") || lowerDomain.includes("t.co") || lowerDomain.includes("x.com")) {
      return { source: "X (Twitter)", category: "Social", medium: "social", referrerDomain };
    }

    // Shopee
    if (lowerDomain.includes("shopee.vn") || lowerDomain.includes("shp.ee")) {
      return { source: "Shopee", category: "Referral", medium: "referral", referrerDomain };
    }

    // Lazada
    if (lowerDomain.includes("lazada.vn")) {
      return { source: "Lazada", category: "Referral", medium: "referral", referrerDomain };
    }

    // Telegram
    if (lowerDomain.includes("t.me") || lowerDomain.includes("telegram.org")) {
      return { source: "Telegram", category: "Social", medium: "social", referrerDomain };
    }

    // Cốc Cốc
    if (lowerDomain.includes("coccoc.com")) {
      return { source: "Cốc Cốc", category: "Organic Search", medium: "organic", referrerDomain };
    }

    // Ignore self-referrals (Direct)
    if (lowerDomain.includes("shopdeevn.online") || lowerDomain.includes("localhost") || lowerDomain.includes("127.0.0.1")) {
      return { source: "Direct", category: "Direct", medium: "direct" };
    }

    // Generic Referral
    return {
      source: referrerDomain || "Referral",
      category: "Referral",
      medium: "referral",
      referrerDomain,
    };
  }

  // 6. Direct (Default)
  return {
    source: "Direct",
    category: "Direct",
    medium: "direct",
  };
}

export function extractDomain(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return undefined;
  }
}

/**
 * Parses user agent into device category, browser and OS.
 */
export function parseUserAgent(ua?: string): ClientDeviceInfo {
  if (!ua) {
    return { device: "desktop", browser: "Unknown", os: "Unknown" };
  }

  let device: "desktop" | "mobile" | "tablet" = "desktop";
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua)) {
    device = "tablet";
  } else if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    device = "mobile";
  }

  let browser = "Other";
  if (/Edg\//i.test(ua)) browser = "Edge";
  else if (/Chrome\//i.test(ua) && !/Chromium|Edg\//i.test(ua)) browser = "Chrome";
  else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) browser = "Safari";
  else if (/Firefox\//i.test(ua)) browser = "Firefox";
  else if (/OPR\/|Opera\//i.test(ua)) browser = "Opera";
  else if (/Zalo\//i.test(ua)) browser = "Zalo InApp";
  else if (/FBAN|FBAV/i.test(ua)) browser = "Facebook InApp";
  else if (/Barcelona/i.test(ua)) browser = "Threads InApp";
  else if (/Instagram/i.test(ua)) browser = "Instagram InApp";
  else if (/TikTok|musical_ly/i.test(ua)) browser = "TikTok InApp";
  else if (/CocCoc/i.test(ua)) browser = "Cốc Cốc";

  let os = "Other";
  if (/Windows NT/i.test(ua)) os = "Windows";
  else if (/Macintosh|Mac OS X/i.test(ua)) os = "macOS";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Linux/i.test(ua)) os = "Linux";

  return { device, browser, os };
}
