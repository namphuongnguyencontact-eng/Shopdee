import { connectDB } from "@/lib/db";
import SiteSetting from "@/models/SiteSetting";

export interface GoogleAnalyticsConfig {
  code: string;
  measurementId: string;
  enabled: boolean;
  excludeAdmin: boolean;
}

export interface SiteInfoConfig {
  siteName: string;
  contactEmail: string;
  hotline: string;
  description: string;
}

export function extractMeasurementId(code: string): string {
  if (!code) return "";
  const trimmed = code.trim();
  if (/^G-[A-Za-z0-9]+$/i.test(trimmed)) {
    return trimmed.toUpperCase();
  }
  const match = code.match(/G-[A-Za-z0-9]+/i);
  return match ? match[0].toUpperCase() : "";
}

export async function getSetting<T>(key: string, defaultValue: T): Promise<T> {
  try {
    await connectDB();
    const doc = await SiteSetting.findOne({ key }).lean();
    if (!doc || !doc.value) return defaultValue;
    return { ...defaultValue, ...doc.value };
  } catch (err) {
    console.error(`Error loading setting ${key}:`, err);
    return defaultValue;
  }
}

export async function setSetting(key: string, value: Record<string, any>, updatedBy?: string) {
  await connectDB();
  return SiteSetting.findOneAndUpdate(
    { key },
    { key, value, updatedBy: updatedBy || "" },
    { upsert: true, new: true }
  );
}

export async function getGoogleAnalyticsConfig(): Promise<GoogleAnalyticsConfig> {
  return getSetting<GoogleAnalyticsConfig>("google_analytics", {
    code: "",
    measurementId: "",
    enabled: true,
    excludeAdmin: true,
  });
}

export async function getSiteInfoConfig(): Promise<SiteInfoConfig> {
  return getSetting<SiteInfoConfig>("site_info", {
    siteName: "SHOPDEE Việt Nam",
    contactEmail: "support@shopdeevn.online",
    hotline: "1900 6868",
    description: "Nền tảng mua sắm trực tuyến đỉnh cao dành cho Gen Z.",
  });
}
