"use client";

import React, { useEffect, useState } from "react";
import {
  Settings,
  Save,
  Activity,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Shield,
  Info,
  RefreshCw,
  FileCode,
  Globe,
  Phone,
  Mail,
  Trash2,
  Check,
} from "lucide-react";
import { useToastStore } from "@/store/useToastStore";

interface GoogleAnalyticsForm {
  code: string;
  measurementId: string;
  enabled: boolean;
  excludeAdmin: boolean;
}

interface SiteInfoForm {
  siteName: string;
  contactEmail: string;
  hotline: string;
  description: string;
}

const SAMPLE_GTAG_CODE = `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-XXXXXXXXXX');
</script>`;

export default function AdminSettingsPage() {
  const { addToast } = useToastStore();
  const [activeTab, setActiveTab] = useState<"analytics" | "site">("analytics");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedSample, setCopiedSample] = useState(false);

  const [gaForm, setGaForm] = useState<GoogleAnalyticsForm>({
    code: "",
    measurementId: "",
    enabled: true,
    excludeAdmin: true,
  });

  const [siteForm, setSiteForm] = useState<SiteInfoForm>({
    siteName: "SHOPDEE Việt Nam",
    contactEmail: "support@shopdeevn.online",
    hotline: "1900 6868",
    description: "Nền tảng mua sắm trực tuyến đỉnh cao dành cho Gen Z.",
  });

  // Load existing settings
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.success && json.data) {
        if (json.data.googleAnalytics) {
          setGaForm({
            code: json.data.googleAnalytics.code || "",
            measurementId: json.data.googleAnalytics.measurementId || "",
            enabled: json.data.googleAnalytics.enabled ?? true,
            excludeAdmin: json.data.googleAnalytics.excludeAdmin ?? true,
          });
        }
        if (json.data.siteInfo) {
          setSiteForm({
            siteName: json.data.siteInfo.siteName || "SHOPDEE Việt Nam",
            contactEmail: json.data.siteInfo.contactEmail || "support@shopdeevn.online",
            hotline: json.data.siteInfo.hotline || "1900 6868",
            description: json.data.siteInfo.description || "",
          });
        }
      }
    } catch (err) {
      console.error("Lỗi tải cài đặt:", err);
      addToast("error", "Không thể tải cấu hình cài đặt hiện tại.");
    } finally {
      setLoading(false);
    }
  };

  // Auto detect measurement ID when code changes
  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setGaForm((prev) => {
      const match = val.match(/G-[A-Za-z0-9]+/i);
      const detectedId = match ? match[0].toUpperCase() : prev.measurementId;
      return {
        ...prev,
        code: val,
        measurementId: detectedId,
      };
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          googleAnalytics: gaForm,
          siteInfo: siteForm,
        }),
      });
      const json = await res.json();
      if (json.success) {
        addToast("success", "Đã lưu cài đặt Google Analytics & Hệ thống thành công!");
        if (json.data?.googleAnalytics) {
          setGaForm((prev) => ({
            ...prev,
            measurementId: json.data.googleAnalytics.measurementId || prev.measurementId,
            code: json.data.googleAnalytics.code || prev.code,
          }));
        }
      } else {
        addToast("error", json.error?.message || "Lỗi lưu cài đặt.");
      }
    } catch (err) {
      console.error("Lỗi lưu:", err);
      addToast("error", "Đã xảy ra lỗi khi lưu cài đặt.");
    } finally {
      setSaving(false);
    }
  };

  const handleCopySample = () => {
    navigator.clipboard.writeText(SAMPLE_GTAG_CODE);
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
    addToast("info", "Đã sao chép mã mẫu Google tag!");
  };

  const handleApplySample = () => {
    const sample = SAMPLE_GTAG_CODE.replace(/G-XXXXXXXXXX/g, gaForm.measurementId || "G-XXXXXXXXXX");
    setGaForm((prev) => ({
      ...prev,
      code: sample,
      measurementId: prev.measurementId || "G-XXXXXXXXXX",
    }));
    addToast("info", "Đã áp dụng khung mã mẫu Google tag!");
  };

  const handleClearCode = () => {
    if (confirm("Bạn có chắc muốn xóa đoạn mã Google Analytics hiện tại?")) {
      setGaForm((prev) => ({ ...prev, code: "", measurementId: "" }));
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Settings className="w-6 h-6 text-pink-500" /> Cài Đặt Hệ Thống & Google Analytics
          </h1>
          <p className="text-neutral-400 text-xs mt-1">
            Quản lý liên kết tài khoản Google Analytics, cấu hình Google tag (gtag.js) và các thông số hoạt động của website.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 active:scale-95 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-pink-600/20 transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Đang lưu...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Lưu Cài Đặt
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2 text-xs">
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === "analytics"
              ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
              : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <Activity className="w-4 h-4" /> Google Analytics (gtag.js)
        </button>
        <button
          onClick={() => setActiveTab("site")}
          className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer ${
            activeTab === "site"
              ? "bg-pink-600 text-white shadow-md shadow-pink-600/30"
              : "bg-white/5 text-neutral-400 hover:text-white hover:bg-white/10"
          }`}
        >
          <Globe className="w-4 h-4" /> Thông Tin Website & Liên Hệ
        </button>
      </div>

      {loading ? (
        <div className="p-16 flex flex-col items-center justify-center gap-3 bg-neutral-900 border border-white/5 rounded-2xl text-neutral-400 text-xs">
          <RefreshCw className="w-6 h-6 animate-spin text-pink-500" />
          <p>Đang tải cấu hình cài đặt...</p>
        </div>
      ) : activeTab === "analytics" ? (
        <div className="space-y-6">
          {/* Status Box */}
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    gaForm.enabled && gaForm.measurementId
                      ? "bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30"
                      : "bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/30"
                  }`}
                >
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">
                      Trạng Thái Liên Kết Google Analytics
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                        gaForm.enabled && gaForm.measurementId
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          gaForm.enabled && gaForm.measurementId ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                        }`}
                      />
                      {gaForm.enabled && gaForm.measurementId ? "Đang Hoạt Động (Connected)" : "Chưa Liên Kết"}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    {gaForm.enabled && gaForm.measurementId
                      ? `Website đang gửi sự kiện lượt truy cập tới Google Analytics với mã: ${gaForm.measurementId}`
                      : "Dán đoạn mã Google tag do Google Analytics cung cấp vào ô bên dưới để kích hoạt theo dõi."}
                  </p>
                </div>
              </div>

              {/* Master Toggle */}
              <label className="flex items-center gap-3 cursor-pointer self-start sm:self-auto select-none bg-neutral-950 px-3.5 py-2 rounded-xl border border-white/5">
                <span className="text-xs font-semibold text-neutral-300">Bật theo dõi:</span>
                <input
                  type="checkbox"
                  checked={gaForm.enabled}
                  onChange={(e) => setGaForm((prev) => ({ ...prev, enabled: e.target.checked }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 relative"></div>
              </label>
            </div>
          </div>

          {/* Guide Callout Box */}
          <div className="bg-blue-950/30 border border-blue-500/20 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-blue-200/90 leading-relaxed">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <p className="font-bold text-white text-xs sm:text-sm">
                Hướng dẫn từ Google Analytics:
              </p>
              <blockquote className="bg-black/30 p-2.5 rounded-lg border-l-2 border-blue-400 italic text-[11px] text-blue-100 font-mono">
                &ldquo;Below is the Google tag for this account. Copy and paste it in the code of every page of your website, immediately after the &lt;head&gt; element. Don&apos;t add more than one Google tag to each page.&rdquo;
              </blockquote>
              <p className="text-[11px] text-blue-300/80">
                👉 <strong>Bạn chỉ cần:</strong> Sao chép toàn bộ đoạn mã code mà Google Analytics cấp và dán trực tiếp vào ô textarea bên dưới. Hệ thống SHOPDEE sẽ tự động chèn mã này ngay sau thẻ <code className="bg-black/40 px-1 py-0.5 rounded text-pink-400 font-mono">&lt;head&gt;</code> của mọi trang trên website và tự động đồng bộ khi khách hàng chuyển trang.
              </p>
            </div>
          </div>

          {/* Main Input Card: Code Editor */}
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-pink-400" /> Đoạn Mã Google Tag (gtag.js)
                </h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">
                  Dán toàn bộ đoạn mã &lt;script&gt; từ màn hình cài đặt Luồng web của Google Analytics
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleApplySample}
                  className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-[11px] font-semibold border border-white/10 transition flex items-center gap-1.5 cursor-pointer"
                  title="Dán mẫu code chuẩn"
                >
                  <Copy className="w-3 h-3 text-pink-400" /> Mẫu chuẩn
                </button>
                {gaForm.code && (
                  <button
                    type="button"
                    onClick={handleClearCode}
                    className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-semibold border border-red-500/20 transition flex items-center gap-1.5 cursor-pointer"
                    title="Xóa trắng ô mã"
                  >
                    <Trash2 className="w-3 h-3" /> Xóa
                  </button>
                )}
              </div>
            </div>

            {/* Monospace Textarea for Code */}
            <div className="relative">
              <textarea
                value={gaForm.code}
                onChange={handleCodeChange}
                rows={10}
                placeholder={`<!-- Google tag (gtag.js) -->\n<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>\n<script>\n  window.dataLayer = window.dataLayer || [];\n  function gtag(){dataLayer.push(arguments);}\n  gtag('js', new Date());\n\n  gtag('config', 'G-XXXXXXXXXX');\n</script>`}
                className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3.5 text-xs font-mono text-emerald-400 placeholder:text-neutral-600 focus:outline-none focus:border-pink-500 leading-relaxed selection:bg-pink-500 selection:text-white"
                spellCheck={false}
              />
            </div>

            {/* Detected ID indicator & Manual field */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                <label className="text-[11px] font-bold text-neutral-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Mã Đo Lường (Measurement ID):
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={gaForm.measurementId}
                    onChange={(e) => setGaForm((prev) => ({ ...prev, measurementId: e.target.value.trim().toUpperCase() }))}
                    placeholder="Ví dụ: G-1234567890"
                    className="w-full bg-neutral-900 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-pink-500 uppercase"
                  />
                </div>
                <p className="text-[10px] text-neutral-500">
                  {gaForm.measurementId
                    ? "✓ Hệ thống sẽ tải gtag.js với mã đo lường này."
                    : "Tự động nhận diện khi bạn dán đoạn mã bên trên, hoặc nhập thủ công."}
                </p>
              </div>

              {/* Exclusion Option */}
              <div className="bg-neutral-950 p-3.5 rounded-xl border border-white/5 space-y-2 flex flex-col justify-center">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={gaForm.excludeAdmin}
                    onChange={(e) => setGaForm((prev) => ({ ...prev, excludeAdmin: e.target.checked }))}
                    className="w-4 h-4 rounded border-white/20 bg-neutral-900 text-pink-600 focus:ring-pink-500 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-white block">
                      Loại trừ hoạt động trong Admin Dashboard
                    </span>
                    <span className="text-[10px] text-neutral-400 block">
                      (Khuyến nghị BẬT): Không gửi dữ liệu khi admin thao tác trong /admin để giữ số liệu khách hàng luôn chính xác.
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-neutral-900 border border-white/5 rounded-2xl">
            <div className="text-xs text-neutral-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Cài đặt được lưu an toàn trong cơ sở dữ liệu MongoDB và áp dụng ngay lập tức cho toàn bộ người dùng website.
              </span>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-pink-600/20 transition cursor-pointer disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Đang lưu..." : "Lưu Cài Đặt"}
            </button>
          </div>
        </div>
      ) : (
        /* Tab 2: Thông tin website */
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-white border-b border-white/5 pb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-pink-400" /> Thông Tin Thương Hiệu & Liên Hệ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300">Tên Website / Thương hiệu:</label>
              <input
                type="text"
                value={siteForm.siteName}
                onChange={(e) => setSiteForm((prev) => ({ ...prev, siteName: e.target.value }))}
                className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-pink-400" /> Hotline Hỗ Trợ:
              </label>
              <input
                type="text"
                value={siteForm.hotline}
                onChange={(e) => setSiteForm((prev) => ({ ...prev, hotline: e.target.value }))}
                className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-semibold text-neutral-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-pink-400" /> Email Liên Hệ:
              </label>
              <input
                type="email"
                value={siteForm.contactEmail}
                onChange={(e) => setSiteForm((prev) => ({ ...prev, contactEmail: e.target.value }))}
                className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="font-semibold text-neutral-300">Mô Tả Giới Thiệu (SEO Meta):</label>
              <textarea
                value={siteForm.description}
                onChange={(e) => setSiteForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full bg-neutral-950 border border-white/10 rounded-xl p-3 text-white placeholder-neutral-500 focus:outline-none focus:border-pink-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-white/5 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 active:scale-95 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-pink-600/20 transition cursor-pointer disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Đang lưu..." : "Lưu Thông Tin"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
