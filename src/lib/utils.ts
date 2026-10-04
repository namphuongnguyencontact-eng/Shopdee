import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatVND(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return "0₫";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount).replace("₫", "") + "₫";
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .replace(/[^a-z0-9 -]/g, "") // remove invalid chars
    .replace(/\s+/g, "-") // collapse whitespace and replace by -
    .replace(/-+/g, "-") // collapse dashes
    .replace(/^-+/, "") // trim - from start
    .replace(/-+$/, ""); // trim - from end
}

export interface LevelInfo {
  level: number;
  title: string;
  minXp: number;
  maxXp: number;
  badge: string;
}

export const LEVELS: LevelInfo[] = [
  { level: 1, title: "New Shopper", minXp: 0, maxXp: 200, badge: "🌱" },
  { level: 2, title: "Explorer", minXp: 200, maxXp: 500, badge: "🔍" },
  { level: 3, title: "Trend Seeker", minXp: 500, maxXp: 1000, badge: "✨" },
  { level: 4, title: "Smart Shopper", minXp: 1000, maxXp: 1800, badge: "🎯" },
  { level: 5, title: "Shopping Addict", minXp: 1800, maxXp: 3000, badge: "🛍️" },
  { level: 6, title: "Trend Hunter", minXp: 3000, maxXp: 4500, badge: "🔥" },
  { level: 7, title: "Shopping Pro", minXp: 4500, maxXp: 6500, badge: "💎" },
  { level: 8, title: "Shopping Master", minXp: 6500, maxXp: 9000, badge: "⚡" },
  { level: 9, title: "Shopping Legend", minXp: 9000, maxXp: 12500, badge: "👑" },
  { level: 10, title: "SHOPDEE ICON", minXp: 12500, maxXp: 999999, badge: "🪐" },
];

export function getLevelInfo(xp: number): LevelInfo {
  const currentXp = Math.max(0, xp || 0);
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (currentXp >= LEVELS[i].minXp) {
      return LEVELS[i];
    }
  }
  return LEVELS[0];
}
