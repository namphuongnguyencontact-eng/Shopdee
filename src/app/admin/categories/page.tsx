"use client";

import React, { useEffect, useState, useRef } from "react";
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  X,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  Tag,
  ExternalLink,
  Upload,
  Loader2,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import { useToastStore } from "@/store/useToastStore";
import { slugify } from "@/lib/utils";

interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon: string;
  image?: string;
  order: number;
  subcategories: string[];
  isActive: boolean;
  productCount: number;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    order: 0,
    subcategories: "",
    isActive: true,
  });
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addToast } = useToastStore();

  const loadCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/categories");
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
      addToast("error", "Lỗi tải danh sách danh mục");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setIsSlugManuallyEdited(false);
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      order: categories.length + 1,
      subcategories: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (cat: CategoryItem) => {
    setEditingCategory(cat);
    setIsSlugManuallyEdited(true);
    setFormData({
      name: cat.name,
      slug: cat.slug || "",
      description: cat.description || "",
      image: cat.image || "",
      order: cat.order,
      subcategories: (cat.subcategories || []).join(", "),
      isActive: cat.isActive,
    });
    setIsModalOpen(true);
  };

  const handleNameChange = (nameValue: string) => {
    if (!isSlugManuallyEdited) {
      setFormData((prev) => ({
        ...prev,
        name: nameValue,
        slug: slugify(nameValue),
      }));
    } else {
      setFormData((prev) => ({ ...prev, name: nameValue }));
    }
  };

  const handleSlugChange = (slugValue: string) => {
    setIsSlugManuallyEdited(true);
    setFormData((prev) => ({
      ...prev,
      slug: slugValue,
    }));
  };

  const handleRegenerateSlug = () => {
    setFormData((prev) => ({
      ...prev,
      slug: slugify(prev.name),
    }));
    setIsSlugManuallyEdited(false);
    addToast("info", "Đã tạo slug mới từ tên danh mục");
  };

  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      addToast("error", "Kích thước ảnh quá lớn (tối đa 15MB)");
      return;
    }

    // 1. Tải và hiển thị ngay preview trên giao diện
    const instantPreviewUrl = URL.createObjectURL(file);
    const previousImage = formData.image;
    setFormData((prev) => ({ ...prev, image: instantPreviewUrl }));
    addToast("info", "Đang tải ảnh lên máy chủ...");

    try {
      setIsUploadingImage(true);
      const uploadData = new FormData();
      uploadData.append("file", file);

      const res = await fetch("/api/admin/categories/upload", {
        method: "POST",
        body: uploadData,
      });

      const json = await res.json();
      if (json.success && json.data?.url) {
        setFormData((prev) => ({ ...prev, image: json.data.url }));
        addToast("success", "Tải ảnh lên máy chủ thành công!");
      } else {
        setFormData((prev) => ({ ...prev, image: previousImage }));
        addToast("error", json.error?.message || "Tải ảnh lên thất bại. Vui lòng thử lại.");
      }
    } catch {
      setFormData((prev) => ({ ...prev, image: previousImage }));
      addToast("error", "Lỗi kết nối khi tải ảnh lên máy chủ.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleToggleActive = async (cat: CategoryItem) => {
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat._id, isActive: !cat.isActive }),
      });
      const json = await res.json();
      if (json.success) {
        setCategories((prev) =>
          prev.map((item) => (item._id === cat._id ? { ...item, isActive: !cat.isActive } : item))
        );
        addToast("success", `Đã ${!cat.isActive ? "kích hoạt" : "tắt"} danh mục "${cat.name}"`);
      } else {
        addToast("error", json.error?.message || "Lỗi cập nhật trạng thái");
      }
    } catch {
      addToast("error", "Lỗi kết nối máy chủ");
    }
  };

  const handleMoveOrder = async (cat: CategoryItem, direction: "up" | "down") => {
    const currentIndex = categories.findIndex((c) => c._id === cat._id);
    if (currentIndex < 0) return;
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const targetCat = categories[targetIndex];
    const newOrder = targetCat.order;
    const targetNewOrder = cat.order;

    try {
      await Promise.all([
        fetch("/api/admin/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: cat._id, order: newOrder }),
        }),
        fetch("/api/admin/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: targetCat._id, order: targetNewOrder }),
        }),
      ]);

      setCategories((prev) => {
        const copy = [...prev];
        copy[currentIndex] = { ...cat, order: newOrder };
        copy[targetIndex] = { ...targetCat, order: targetNewOrder };
        return copy.sort((a, b) => a.order - b.order);
      });
      addToast("success", "Đã cập nhật thứ tự hiển thị");
    } catch {
      addToast("error", "Lỗi điều chỉnh thứ tự");
    }
  };

  const handleDelete = async (cat: CategoryItem) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}"? Hành động này không thể hoàn tác.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/admin/categories?id=${cat._id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        setCategories((prev) => prev.filter((item) => item._id !== cat._id));
        addToast("success", `Đã xóa danh mục "${cat.name}"`);
      } else {
        addToast("error", json.error?.message || "Lỗi xóa danh mục");
      }
    } catch {
      addToast("error", "Lỗi kết nối máy chủ");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploadingImage) {
      addToast("info", "Vui lòng đợi ảnh tải lên máy chủ hoàn tất trước khi lưu!");
      return;
    }

    if (!formData.name.trim()) {
      addToast("error", "Vui lòng nhập tên danh mục");
      return;
    }

    const subcats = formData.subcategories
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      setSubmitting(true);

      let finalImageUrl = formData.image.trim();
      if (finalImageUrl.startsWith("blob:")) {
        try {
          const response = await fetch(finalImageUrl);
          const blob = await response.blob();
          const uploadData = new FormData();
          const ext = blob.type.split("/")[1] || "png";
          uploadData.append("file", new File([blob], `category.${ext}`, { type: blob.type }));
          const res = await fetch("/api/admin/categories/upload", {
            method: "POST",
            body: uploadData,
          });
          const json = await res.json();
          if (json.success && json.data?.url) {
            finalImageUrl = json.data.url;
          }
        } catch (err) {
          console.error("Error uploading blob to server:", err);
        }
      }

      if (editingCategory) {
        // Update
        const res = await fetch("/api/admin/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingCategory._id,
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            description: formData.description.trim(),
            image: finalImageUrl,
            order: Number(formData.order) || 0,
            subcategories: subcats,
            isActive: formData.isActive,
          }),
        });
        const json = await res.json();
        if (json.success) {
          addToast("success", "Cập nhật danh mục thành công!");
          setIsModalOpen(false);
          loadCategories();
        } else {
          addToast("error", json.error?.message || "Lỗi cập nhật");
        }
      } else {
        // Create
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            slug: formData.slug.trim(),
            description: formData.description.trim(),
            image: finalImageUrl,
            order: Number(formData.order) || 0,
            subcategories: subcats,
          }),
        });
        const json = await res.json();
        if (json.success) {
          addToast("success", "Tạo danh mục mới thành công!");
          setIsModalOpen(false);
          loadCategories();
        } else {
          addToast("error", json.error?.message || "Lỗi tạo danh mục");
        }
      }
    } catch {
      addToast("error", "Lỗi kết nối máy chủ");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredCategories = categories.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.subcategories && c.subcategories.some((sub) => sub.toLowerCase().includes(q)))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <FolderTree className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white">Quản Lý Danh Mục</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 text-xs font-bold border border-white/10">
              {categories.length} bộ sưu tập
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            Cấu hình danh mục sản phẩm Gen Z, danh mục con (subcategories), thứ tự hiển thị và kích hoạt catalog.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-pink-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Danh Mục Mới</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm danh mục theo tên, slug, hoặc danh mục con..."
            className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-hidden focus:border-pink-500 transition-colors"
          />
        </div>
      </div>

      {/* Categories Table / List */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto touch-pan-x">
          <table className="w-full text-left text-xs min-w-[680px]">
            <thead className="bg-neutral-950/80 text-neutral-400 border-b border-white/10 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center">Thứ tự</th>
                <th className="py-3.5 px-4">Hình ảnh & Tên danh mục</th>
                <th className="py-3.5 px-4">Slug URL</th>
                <th className="py-3.5 px-4">Danh mục con (Subcategories)</th>
                <th className="py-3.5 px-4 text-center">Sản phẩm</th>
                <th className="py-3.5 px-4 text-center">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <div className="inline-block w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <p>Đang tải danh mục...</p>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-neutral-500">
                    <Layers className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-neutral-300">
                      {search ? "Không tìm thấy danh mục nào phù hợp." : "Chưa có danh mục nào trong hệ thống."}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1 mb-4">
                      {search
                        ? "Thử thay đổi từ khóa tìm kiếm của bạn."
                        : "Bắt đầu bằng việc thêm danh mục sản phẩm mới đầu tiên."}
                    </p>
                    {!search && (
                      <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs transition cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Thêm Danh Mục Mới</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((cat, idx) => (
                  <tr key={cat._id} className="hover:bg-white/[0.02] transition-colors">
                    {/* Order Controls */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <button
                          disabled={idx === 0}
                          onClick={() => handleMoveOrder(cat, "up")}
                          className="p-1 text-neutral-400 hover:text-white disabled:opacity-20 hover:bg-white/5 rounded cursor-pointer transition"
                          title="Di chuyển lên"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-extrabold text-pink-400 text-xs">{cat.order}</span>
                        <button
                          disabled={idx === filteredCategories.length - 1}
                          onClick={() => handleMoveOrder(cat, "down")}
                          className="p-1 text-neutral-400 hover:text-white disabled:opacity-20 hover:bg-white/5 rounded cursor-pointer transition"
                          title="Di chuyển xuống"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Image & Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-neutral-950 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                          {cat.image ? (
                            <img
                              src={cat.image}
                              alt={cat.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) {
                                  const fallback = parent.querySelector('.fallback-icon');
                                  if (fallback) fallback.classList.remove('hidden');
                                }
                              }}
                            />
                          ) : null}
                          <Tag className={`w-5 h-5 text-neutral-500 ${cat.image ? 'hidden fallback-icon' : ''}`} />
                        </div>
                        <div className="max-w-xs">
                          <p className="font-bold text-white hover:text-pink-400 transition-colors">
                            {cat.name}
                          </p>
                          <p className="text-[11px] text-neutral-400 line-clamp-1 mt-0.5">
                            {cat.description || "Chưa có mô tả"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Slug */}
                    <td className="py-3 px-4">
                      <Link
                        href={`/category/${cat.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 font-mono text-[11px] text-neutral-300 bg-neutral-950 px-2.5 py-1 rounded-lg border border-white/5 hover:border-pink-500/30 hover:text-pink-300 transition-colors"
                      >
                        <span>{cat.slug}</span>
                        <ExternalLink className="w-3 h-3 text-neutral-500" />
                      </Link>
                    </td>

                    {/* Subcategories */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {cat.subcategories && cat.subcategories.length > 0 ? (
                          cat.subcategories.map((sub, sIdx) => (
                            <span
                              key={sIdx}
                              className="px-2 py-0.5 bg-neutral-800 text-neutral-300 rounded text-[10px] font-medium border border-white/5"
                            >
                              {sub}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-neutral-500 italic">Chưa có danh mục con</span>
                        )}
                      </div>
                    </td>

                    {/* Product count */}
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                        {cat.productCount || 0} SP
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleActive(cat)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors cursor-pointer ${
                          cat.isActive
                            ? "bg-green-500/10 text-green-400 border border-green-500/20 hover:bg-green-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                        }`}
                      >
                        {cat.isActive ? (
                          <>
                            <CheckCircle className="w-3 h-3" /> Đang bật
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" /> Tạm dừng
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white cursor-pointer transition"
                          title="Chỉnh sửa danh mục"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer transition"
                          title="Xóa danh mục"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Create / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col p-4 sm:p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 mb-3 sm:mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-pink-500/10 text-pink-400 rounded-lg">
                  <Sparkles className="w-4 h-4" />
                </span>
                <h3 className="font-bold text-sm sm:text-base text-white">
                  {editingCategory ? "Chỉnh Sửa Danh Mục" : "Thêm Danh Mục Mới"}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-white hover:bg-white/5 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              <div>
                <label className="block text-neutral-300 font-bold mb-1">
                  Tên Danh Mục <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Ví dụ: Thời Trang Gen Z, Phụ Kiện Aesthetic..."
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-pink-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-neutral-300 font-bold">
                    Slug URL (Đường dẫn tùy ý) <span className="text-pink-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleRegenerateSlug}
                    className="text-[11px] text-pink-400 hover:text-pink-300 font-semibold flex items-center gap-1 cursor-pointer transition"
                    title="Tự động tạo lại slug theo tên danh mục"
                  >
                    <RefreshCw className="w-3 h-3" /> Tạo từ tên
                  </button>
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-neutral-500 font-mono text-xs select-none pointer-events-none">
                    /category/
                  </span>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="thoi-trang-gen-z"
                    className="w-full pl-22 pr-3.5 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white font-mono text-xs focus:outline-hidden focus:border-pink-500"
                  />
                </div>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Bạn có thể điền slug URL tùy ý (ví dụ: <code className="text-pink-400 font-mono">thoi-trang-hot</code>). Hệ thống sẽ dùng URL này cho trang danh mục.
                </p>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">Mô Tả Bộ Sưu Tập</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mô tả phong cách, sản phẩm tiêu biểu..."
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Thứ Tự Ưu Tiên</label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-300 font-bold mb-1">Trạng Thái Hiển Thị</label>
                  <select
                    value={formData.isActive ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === "true" })}
                    className="w-full px-3.5 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-pink-500"
                  >
                    <option value="true">Bật (Hoạt động)</option>
                    <option value="false">Tạm dừng (Ẩn)</option>
                  </select>
                </div>
              </div>

              {/* Ảnh danh mục: Tải trực tiếp từ thiết bị */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-neutral-300 font-bold">
                    Hình Ảnh Danh Mục (Tải từ thiết bị)
                  </label>
                  {formData.image && (
                    <span className="text-[11px] text-green-400 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Đã chọn ảnh
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageFileUpload}
                  accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml,image/avif"
                  className="hidden"
                />

                {formData.image ? (
                  <div className="rounded-xl border border-white/10 bg-neutral-950 p-2.5 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-900 border border-white/10 shrink-0">
                      <img
                        src={formData.image}
                        alt="Category Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-xs truncate">
                        {formData.image.split("/").pop()}
                      </p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Tải lên từ thiết bị của bạn</p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingImage}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-200 text-[11px] font-bold border border-white/10 inline-flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
                        >
                          <Upload className="w-3 h-3" /> Đổi ảnh khác
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, image: "" }))}
                          disabled={isUploadingImage}
                          className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[11px] font-bold border border-red-500/20 inline-flex items-center gap-1 cursor-pointer transition disabled:opacity-50"
                        >
                          <Trash2 className="w-3 h-3" /> Xóa ảnh
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => !isUploadingImage && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2.5 ${
                      isUploadingImage
                        ? "border-pink-500/50 bg-pink-500/5 cursor-wait"
                        : "border-white/15 hover:border-pink-500/50 hover:bg-white/[0.02] bg-neutral-950/60"
                    }`}
                  >
                    {isUploadingImage ? (
                      <>
                        <Loader2 className="w-7 h-7 text-pink-500 animate-spin" />
                        <p className="text-xs font-semibold text-pink-400">Đang tải ảnh từ thiết bị lên...</p>
                      </>
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-pink-500/10 text-pink-400 flex items-center justify-center border border-pink-500/20">
                          <Upload className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-neutral-200">
                            Nhấn để chọn ảnh từ máy tính / thiết bị
                          </p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            Chấp nhận JPG, PNG, WebP, GIF, SVG (Tối đa 10MB)
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-neutral-300 font-bold mb-1">
                  Danh Mục Con (Phân tách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={formData.subcategories}
                  onChange={(e) => setFormData({ ...formData, subcategories: e.target.value })}
                  placeholder="Áo Baby Tee, Hoodie, Quần Ống Rộng, Sneakers..."
                  className="w-full px-3.5 py-2.5 bg-neutral-950 border border-white/10 rounded-xl text-white focus:outline-hidden focus:border-pink-500"
                />
                <p className="text-[10px] text-neutral-500 mt-1">
                  Nhập các nhánh con ngăn cách bởi dấu phẩy để hệ thống tự phân nhóm bộ lọc.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-bold cursor-pointer transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting || isUploadingImage}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold cursor-pointer shadow-lg shadow-pink-600/20 disabled:opacity-50 transition"
                >
                  {submitting ? "Đang Lưu..." : isUploadingImage ? "Đang Tải Ảnh..." : editingCategory ? "Lưu Thay Đổi" : "Tạo Danh Mục"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
