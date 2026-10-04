"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  X,
  Sparkles,
  BarChart2,
  RefreshCw,
  FileSpreadsheet,
} from "lucide-react";
import { formatVND } from "@/lib/utils";
import { useToastStore } from "@/store/useToastStore";

interface Product {
  _id: string;
  name: string;
  slug: string;
  brand: string;
  categoryName: string;
  categorySlug: string;
  categoryId: string;
  price: number;
  originalPrice: number;
  stock: number;
  soldCount: number;
  images: string[];
  isFlashSale: boolean;
  isTrending: boolean;
  status: "active" | "draft" | "archived";
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [isRecalculatingSales, setIsRecalculatingSales] = useState(false);
  const { addToast } = useToastStore();

  const handleRecalculateSales = async () => {
    if (!confirm("Bạn có chắc chắn muốn đồng bộ lại số lượng bán toàn bộ sản phẩm theo các đơn hàng COMPLETED?")) return;
    setIsRecalculatingSales(true);
    try {
      const res = await fetch("/api/admin/recalculate-sales", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        addToast("success", `Đã đồng bộ lại ${json.data?.updatedProductsCount || 0} sản phẩm thành công!`);
        loadProducts();
      } else {
        addToast("error", json.error?.message || "Lỗi đồng bộ số lượng bán");
      }
    } catch {
      addToast("error", "Lỗi kết nối máy chủ");
    } finally {
      setIsRecalculatingSales(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategory) params.append("category", selectedCategory);

      const res = await fetch(`/api/admin/products?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setProducts(json.data);
      }
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.success) {
        setCategories(json.data);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const handleToggleFlashSale = async (product: Product) => {
    try {
      const res = await fetch("/api/admin/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: product._id,
          isFlashSale: !product.isFlashSale,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) =>
          prev.map((p) => (p._id === product._id ? { ...p, isFlashSale: !p.isFlashSale } : p))
        );
        addToast("success", `Đã ${!product.isFlashSale ? "kích hoạt" : "tắt"} Flash Sale cho ${product.name}`);
      }
    } catch {
      addToast("error", "Lỗi cập nhật sản phẩm");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setProducts((prev) => prev.filter((p) => p._id !== id));
        addToast("success", "Đã xóa sản phẩm thành công");
      }
    } catch {
      addToast("error", "Lỗi xóa sản phẩm");
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct?.name || !editingProduct?.price || !editingProduct?.categoryId) {
      addToast("error", "Vui lòng điền đủ tên, giá và danh mục");
      return;
    }

    try {
      const isEdit = Boolean(editingProduct._id);
      const url = "/api/admin/products";
      const method = isEdit ? "PUT" : "POST";
      const body = isEdit
        ? { id: editingProduct._id, ...editingProduct }
        : editingProduct;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const json = await res.json();
      if (json.success) {
        addToast("success", isEdit ? "Đã cập nhật sản phẩm" : "Đã tạo sản phẩm mới");
        setIsModalOpen(false);
        setEditingProduct(null);
        loadProducts();
      } else {
        addToast("error", json.error?.message || "Lỗi lưu sản phẩm");
      }
    } catch {
      addToast("error", "Lỗi kết nối máy chủ");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            Quản Lý Kho Sản Phẩm
            <Package className="w-5 h-5 text-pink-500" />
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Tổng hợp {products.length} sản phẩm thời trang & phụ kiện Gen Z
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleRecalculateSales}
            disabled={isRecalculatingSales}
            className="px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-bold text-xs transition-colors flex items-center gap-1.5 sm:gap-2 border border-white/10 disabled:opacity-50 cursor-pointer"
            title="Tính lại số lượng bán dựa trên đơn hàng đã hoàn tất thực tế"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecalculatingSales ? "animate-spin text-pink-400" : ""}`} />
            <span className="hidden xs:inline">Đồng bộ</span> bán
          </button>
          <button
            type="button"
            onClick={() => {
              window.location.href = `/api/admin/export?type=products${selectedCategory ? `&category=${selectedCategory}` : ""}`;
            }}
            className="px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold text-xs transition-colors flex items-center gap-1.5 sm:gap-2 border border-emerald-500/30 cursor-pointer"
            title="Xuất danh sách sản phẩm dạng bảng tính Excel .xlsx chuẩn UTF-8"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Xuất Excel</span>
          </button>
          <Link
            href="/admin/products/import-shopee"
            className="px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs transition-colors flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-orange-500/20"
          >
            <Zap className="w-4 h-4" />
            <span>Shopee</span>
          </Link>
          <Link
            href="/admin/products/new"
            className="px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-pink-600/25"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm Mới</span>
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-neutral-900 p-4 rounded-xl border border-white/10">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên hoặc thương hiệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-neutral-800 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-neutral-800 border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
        >
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c._id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto touch-pan-x">
          <table className="w-full text-left text-xs min-w-[720px]">
            <thead className="bg-neutral-800/80 text-neutral-400 uppercase tracking-wider text-[10px] border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Sản Phẩm</th>
                <th className="py-3.5 px-4">Danh Mục</th>
                <th className="py-3.5 px-4">Giá Bán</th>
                <th className="py-3.5 px-4">Tồn Kho</th>
                <th className="py-3.5 px-4">Đã Bán</th>
                <th className="py-3.5 px-4 text-center">Flash Sale</th>
                <th className="py-3.5 px-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    Đang tải danh sách sản phẩm...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    Không tìm thấy sản phẩm phù hợp.
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.images?.[0] || "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100"}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-neutral-800 shrink-0 border border-white/10"
                        />
                        <div className="max-w-xs">
                          <p className="font-bold text-white truncate">{item.name}</p>
                          <p className="text-[10px] text-neutral-400">{item.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-neutral-300">{item.categoryName}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-pink-400">{formatVND(item.price)}</div>
                      {item.originalPrice > item.price && (
                        <div className="text-[10px] text-neutral-500 line-through">
                          {formatVND(item.originalPrice)}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-neutral-300">{item.stock}</td>
                    <td className="py-3 px-4 font-mono text-emerald-400 font-semibold">{item.soldCount}</td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => handleToggleFlashSale(item)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          item.isFlashSale
                            ? "bg-yellow-500/20 text-yellow-300 border-yellow-500/40"
                            : "bg-white/5 text-neutral-500 border-white/10 hover:text-neutral-300"
                        }`}
                        title={item.isFlashSale ? "Tắt Flash Sale" : "Bật Flash Sale"}
                      >
                        <Zap className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <Link
                          href={`/admin/products/${item._id}/analytics`}
                          className="p-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition-colors"
                          title="Xem Funnel & Phân tích chuyên sâu"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                        </Link>
                        <Link
                          href={`/admin/products/${item._id}/edit`}
                          className="p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 transition-colors"
                          title="Chỉnh sửa chi tiết & Gallery ảnh"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(item._id, item.name)}
                          className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                          title="Xóa"
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

      {/* Product Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col p-4 sm:p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-white/10 mb-3 sm:mb-4 shrink-0">
              <h3 className="font-bold text-sm sm:text-base text-white">
                {editingProduct._id ? "Chỉnh Sửa Sản Phẩm" : "Thêm Sản Phẩm Mới"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-neutral-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="flex-1 overflow-y-auto space-y-4 text-xs pr-1">
              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Tên Sản Phẩm *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.name || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Thương Hiệu</label>
                  <input
                    type="text"
                    value={editingProduct.brand || "SHOPDEE STUDIO"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Danh Mục *</label>
                  <select
                    value={editingProduct.categoryId || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, categoryId: e.target.value })}
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                  >
                    {categories.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Giá Bán (VND) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Giá Gốc Niêm Yết</label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.originalPrice || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: Number(e.target.value) })}
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Số Lượng Tồn Kho</label>
                  <input
                    type="number"
                    min={0}
                    value={editingProduct.stock ?? 50}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-neutral-400 font-semibold mb-1">Trạng Thái</label>
                  <select
                    value={editingProduct.status || "active"}
                    onChange={(e) => setEditingProduct({ ...editingProduct, status: e.target.value as "active" | "draft" | "archived" })}
                    className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500"
                  >
                    <option value="active">Đang bán (Active)</option>
                    <option value="draft">Bản nháp (Draft)</option>
                    <option value="archived">Lưu kho (Archived)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-semibold mb-1">Link Ảnh Sản Phẩm (URL)</label>
                <input
                  type="url"
                  value={editingProduct.images?.[0] || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, images: [e.target.value] })}
                  className="w-full bg-neutral-800 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-pink-500 text-xs"
                  placeholder="https://..."
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isFlashSale || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isFlashSale: e.target.checked })}
                    className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-neutral-300 font-semibold">Gắn nhãn Flash Sale</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.isTrending || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, isTrending: e.target.checked })}
                    className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500"
                  />
                  <span className="text-neutral-300 font-semibold">Sản phẩm Xu Hướng</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 font-bold transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold transition-colors"
                >
                  Lưu Sản Phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
