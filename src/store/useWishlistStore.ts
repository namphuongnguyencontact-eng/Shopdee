import { create } from "zustand";
import { showToast } from "./useToastStore";

interface WishlistState {
  productIds: string[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<boolean>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  productIds: [],
  isLoading: false,

  fetchWishlist: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/wishlist");
      const json = await res.json();
      if (json.success && json.data?.products) {
        const ids = json.data.products.map((p: { _id?: string } | string) =>
          typeof p === "string" ? p : p._id
        );
        set({ productIds: ids.filter(Boolean), isLoading: false });
      } else {
        set({ productIds: [], isLoading: false });
      }
    } catch {
      set({ productIds: [], isLoading: false });
    }
  },

  toggleWishlist: async (productId: string) => {
    const prev = get().productIds;
    const exists = prev.includes(productId);

    // Optimistic update
    const next = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
    set({ productIds: next });

    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const json = await res.json();

      if (json.success) {
        if (json.data.isAdded) {
          showToast({
            type: "success",
            title: "Đã thêm vào yêu thích!",
            message: "Sản phẩm đã được lưu vào danh sách yêu thích.",
          });
        } else {
          showToast({
            type: "info",
            message: "Đã xóa khỏi danh sách yêu thích.",
          });
        }
        return json.data.isAdded;
      } else {
        // Rollback
        set({ productIds: prev });
        showToast({
          type: "error",
          message: json.error?.message || "Vui lòng đăng nhập để lưu yêu thích.",
        });
        return exists;
      }
    } catch {
      set({ productIds: prev });
      return exists;
    }
  },

  isInWishlist: (productId: string) => {
    return get().productIds.includes(productId);
  },
}));
