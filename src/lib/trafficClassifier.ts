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

/**
 * Classifies traffic source based on Referrer URL and UTM parameters.
 */
export function classifyTraffic(
  referrer?: string,
  searchParams?: Record<string, string | string[] | undefined> | URLSearchParams
): ClassifiedTraffic {
  let utmSource = "";
  let utmMedium = "";
  let utmCampaign = "";
  let utmTerm = "";
  let utmContent = "";

  if (searchParams) {
    if (searchParams instanceof URLSearchParams) {
      utmSource = searchParams.get("utm_source") || "";
      utmMedium = searchParams.get("utm_medium") || "";
      utmCampaign = searchParams.get("utm_campaign") || "";
      utmTerm = searchParams.get("utm_term") || "";
      utmContent = searchParams.get("utm_content") || "";
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
    }
  }

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

    return {
      source: normalizedSource,
      category: "Campaign",
      medium: utmMedium || "campaign",
      campaign: utmCampaign || undefined,
      term: utmTerm || undefined,
      content: utmContent || undefined,
      referrerDomain: extractDomain(referrer),
    };
  }

  // 2. Parse Referrer
  if (!referrer || referrer.trim() === "") {
    return {
      source: "Direct",
      category: "Direct",
      medium: "direct",
    };
  }

  const domain = extractDomain(referrer);
  if (!domain) {
    return {
      source: "Direct",
      category: "Direct",
      medium: "direct",
    };
  }

  const lowerDomain = domain.toLowerCase();

  // TikTok
  if (lowerDomain.includes("tiktok.com") || lowerDomain.includes("douyin.com") || lowerDomain.includes("byteoversea.com")) {
    return {
      source: "TikTok",
      category: "Social",
      medium: "social",
      referrerDomain: domain,
    };
  }

  // Facebook
  if (
    lowerDomain.includes("facebook.com") ||
    lowerDomain.includes("fb.com") ||
    lowerDomain.includes("fb.me") ||
    lowerDomain.includes("messenger.com")
  ) {
    return {
      source: "Facebook",
      category: "Social",
      medium: "social",
      referrerDomain: domain,
    };
  }

  // Instagram
  if (lowerDomain.includes("instagram.com")) {
    return {
      source: "Instagram",
      category: "Social",
      medium: "social",
      referrerDomain: domain,
    };
  }

  // Threads
  if (lowerDomain.includes("threads.net")) {
    return {
      source: "Threads",
      category: "Social",
      medium: "social",
      referrerDomain: domain,
    };
  }

  // Google
  if (lowerDomain.includes("google.")) {
    return {
      source: "Google",
      category: "Organic Search",
      medium: "organic",
      referrerDomain: domain,
    };
  }

  // YouTube
  if (lowerDomain.includes("youtube.com") || lowerDomain.includes("youtu.be")) {
    return {
      source: "YouTube",
      category: "Social",
      medium: "social",
      referrerDomain: domain,
    };
  }

  // Zalo
  if (lowerDomain.includes("zalo.me")) {
    return {
      source: "Zalo",
      category: "Social",
      medium: "social",
      referrerDomain: domain,
    };
  }

  // Bing
  if (lowerDomain.includes("bing.com")) {
    return {
      source: "Bing",
      category: "Organic Search",
      medium: "organic",
      referrerDomain: domain,
    };
  }

  // Generic Referral
  return {
    source: domain,
    category: "Referral",
    medium: "referral",
    referrerDomain: domain,
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

  let os = "Other";
  if (/Windows NT/i.test(ua)) os = "Windows";
  else if (/Macintosh|Mac OS X/i.test(ua)) os = "macOS";
  else if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Linux/i.test(ua)) os = "Linux";

  return { device, browser, os };
}
