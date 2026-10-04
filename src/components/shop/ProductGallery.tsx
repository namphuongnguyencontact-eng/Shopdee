"use client";

import React, { useState } from "react";
import { Zap, ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";

export interface GalleryImageItem {
  url: string;
  alt?: string;
  isPrimary?: boolean;
  sortOrder?: number;
}

interface ProductGalleryProps {
  images: string[];
  galleryImages?: GalleryImageItem[];
  productName: string;
  discount?: number;
  isFlashSale?: boolean;
  onActiveIndexChange?: (index: number) => void;
}

export default function ProductGallery({
  images,
  galleryImages,
  productName,
  discount = 0,
  isFlashSale = false,
  onActiveIndexChange,
}: ProductGalleryProps) {
  // Normalize images list
  const imageList: Array<{ url: string; alt: string }> = React.useMemo(() => {
    if (galleryImages && galleryImages.length > 0) {
      const sorted = [...galleryImages].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
      return sorted.map((g, idx) => ({
        url: g.url,
        alt: g.alt || `${productName} - Ảnh ${idx + 1}`,
      }));
    }
    if (images && images.length > 0) {
      return images.map((url, idx) => ({
        url,
        alt: `${productName} - Ảnh ${idx + 1}`,
      }));
    }
    return [{ url: "/placeholder.png", alt: productName }];
  }, [galleryImages, images, productName]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomOpen, setIsZoomOpen] = useState(false);

  const handleSelect = (idx: number) => {
    const nextIdx = (idx + imageList.length) % imageList.length;
    setActiveIndex(nextIdx);
    if (onActiveIndexChange) {
      onActiveIndexChange(nextIdx);
    }
  };

  const activeImg = imageList[activeIndex] || imageList[0];

  return (
    <div className="space-y-4">
      {/* Main Feature Image Frame */}
      <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-subtle group select-none">
        <img
          src={activeImg.url}
          alt={activeImg.alt}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500 cursor-zoom-in"
          onClick={() => setIsZoomOpen(true)}
        />

        {/* Badges */}
        {discount > 0 && (
          <div className="absolute top-4 left-4 px-3 py-1 bg-rose-600 text-white font-black text-xs rounded-full shadow-md pointer-events-none">
            -{discount}%
          </div>
        )}
        {isFlashSale && (
          <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1 bg-red-600 text-white font-black text-xs rounded-full shadow-md pointer-events-none">
            <Zap className="w-3.5 h-3.5 fill-white" /> FLASH SALE
          </div>
        )}

        {/* Fullscreen Trigger */}
        <button
          onClick={() => setIsZoomOpen(true)}
          className="absolute bottom-4 right-4 p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition shadow"
          title="Xem ảnh lớn"
          aria-label="Phóng to ảnh"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        {/* Prev / Next Controls for Multi-Image */}
        {imageList.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(activeIndex - 1);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 backdrop-blur-sm shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSelect(activeIndex + 1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 hover:bg-white text-slate-800 backdrop-blur-sm shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
              aria-label="Ảnh kế tiếp"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Mobile Page indicator */}
        {imageList.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md text-white text-[10px] font-bold">
            {activeIndex + 1} / {imageList.length}
          </div>
        )}
      </div>

      {/* Thumbnails Navigation */}
      {imageList.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-200">
          {imageList.map((img, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              className={`relative w-20 h-20 rounded-2xl overflow-hidden border-2 transition shrink-0 cursor-pointer ${
                activeIndex === idx
                  ? "border-blue-600 shadow-md scale-105 ring-2 ring-blue-500/20"
                  : "border-slate-200 opacity-70 hover:opacity-100"
              }`}
              title={img.alt}
            >
              <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isZoomOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setIsZoomOpen(false)}
        >
          <button
            onClick={() => setIsZoomOpen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-6 h-6" />
          </button>
          <div
            className="relative max-w-4xl max-h-[85vh] w-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={activeImg.url}
              alt={activeImg.alt}
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            {imageList.length > 1 && (
              <>
                <button
                  onClick={() => handleSelect(activeIndex - 1)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={() => handleSelect(activeIndex + 1)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition cursor-pointer"
                  aria-label="Ảnh kế tiếp"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
