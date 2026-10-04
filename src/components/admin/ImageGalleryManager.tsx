"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  Plus,
  Trash2,
  Star,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { showToast } from "@/store/useToastStore";

export interface GalleryImage {
  url: string;
  publicId?: string;
  alt?: string;
  sortOrder: number;
  isPrimary: boolean;
}

interface ImageGalleryManagerProps {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
}

export default function ImageGalleryManager({ images, onChange }: ImageGalleryManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [showUrlModal, setShowUrlModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("files", files[i]);
      }

      const res = await fetch("/api/admin/products/images", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.data) {
        const items = Array.isArray(json.data) ? json.data : [json.data];
        const newImages: GalleryImage[] = items.map((item: any, idx: number) => ({
          url: item.url,
          publicId: item.publicId,
          alt: item.alt || "",
          sortOrder: images.length + idx,
          isPrimary: images.length === 0 && idx === 0,
        }));

        const updated = [...images, ...newImages];
        // Ensure at least one primary exists
        if (!updated.some((img) => img.isPrimary) && updated.length > 0) {
          updated[0].isPrimary = true;
        }
        onChange(updated);
        showToast({ type: "success", message: `Đã tải lên ${json.data.length} hình ảnh thành công.` });
      } else {
        showToast({ type: "error", message: json.error?.message || "Tải ảnh thất bại." });
      }
    } catch {
      showToast({ type: "error", message: "Có lỗi xảy ra khi kết nối máy chủ tải ảnh." });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    const isFirst = images.length === 0;
    const newImg: GalleryImage = {
      url: urlInput.trim(),
      alt: "",
      sortOrder: images.length,
      isPrimary: isFirst,
    };
    const updated = [...images, newImg];
    onChange(updated);
    setUrlInput("");
    setShowUrlModal(false);
    showToast({ type: "success", message: "Đã thêm link hình ảnh." });
  };

  const handleSetPrimary = (index: number) => {
    const updated = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    const wasPrimary = images[index].isPrimary;
    const updated = images.filter((_, i) => i !== index).map((img, i) => ({
      ...img,
      sortOrder: i,
    }));

    if (wasPrimary && updated.length > 0) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const copy = [...images];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    const updated = copy.map((img, i) => ({
      ...img,
      sortOrder: i,
    }));
    onChange(updated);
  };

  const handleAltChange = (index: number, alt: string) => {
    const copy = [...images];
    copy[index] = { ...copy[index], alt };
    onChange(copy);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-blue-600" /> Thư viện ảnh sản phẩm ({images.length})
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Thêm nhiều ảnh sản phẩm. Ảnh gắn nhãn &quot;Ảnh chính&quot; sẽ là ảnh đại diện hiển thị ngoài trang chủ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
            Tải ảnh từ máy
          </button>

          <button
            type="button"
            onClick={() => setShowUrlModal(!showUrlModal)}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            <LinkIcon className="w-3.5 h-3.5" /> Thêm bằng Link
          </button>
        </div>
      </div>

      {/* URL Input Form */}
      {showUrlModal && (
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-2">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Dán link ảnh (https://...)"
            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-blue-500"
          />
          <button
            type="button"
            onClick={handleAddUrl}
            className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
          >
            Thêm
          </button>
          <button
            type="button"
            onClick={() => setShowUrlModal(false)}
            className="px-2 py-1.5 text-xs text-slate-400 hover:text-slate-600"
          >
            Hủy
          </button>
        </div>
      )}

      {/* Images Grid */}
      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50/50 group"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-xs font-bold text-slate-700">Nhấn để tải lên nhiều ảnh sản phẩm</p>
          <p className="text-[11px] text-slate-400 mt-1">Hỗ trợ JPG, PNG, WebP (Tối đa 5MB mỗi ảnh)</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img, idx) => (
            <div
              key={idx}
              className={`group relative rounded-2xl border-2 overflow-hidden bg-slate-100 transition shadow-subtle ${
                img.isPrimary ? "border-blue-600 ring-2 ring-blue-500/20" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              {/* Image Preview */}
              <div className="relative aspect-square w-full">
                <img src={img.url} alt={img.alt || "Product image"} className="w-full h-full object-cover" />

                {/* Primary Tag */}
                {img.isPrimary && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600 text-white font-extrabold text-[10px] rounded-full shadow flex items-center gap-1">
                    <Star className="w-3 h-3 fill-white" /> Ảnh chính
                  </div>
                )}

                {/* Hover Actions Bar */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-2">
                  {!img.isPrimary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(idx)}
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-blue-600 text-xs font-bold shadow transition cursor-pointer"
                      title="Đặt làm ảnh chính"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, "up")}
                    className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 disabled:opacity-30 text-xs shadow transition cursor-pointer"
                    title="Chuyển lên trước"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === images.length - 1}
                    onClick={() => handleMove(idx, "down")}
                    className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-700 disabled:opacity-30 text-xs shadow transition cursor-pointer"
                    title="Chuyển xuống sau"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(idx)}
                    className="p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs shadow transition cursor-pointer"
                    title="Xóa ảnh này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Alt Text Input */}
              <div className="p-2 bg-white border-t border-slate-100">
                <input
                  type="text"
                  value={img.alt || ""}
                  onChange={(e) => handleAltChange(idx, e.target.value)}
                  placeholder="Mô tả SEO (Alt text)..."
                  className="w-full text-[11px] px-2 py-1 bg-slate-50 rounded-lg border border-slate-200 outline-none focus:border-blue-500 text-slate-700"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
