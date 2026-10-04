import { create } from "zustand";
import { persist } from "zustand/middleware";
import { ProductItem } from "@/components/shop/ProductCard";
import { showToast } from "./useToastStore";

interface CompareState {
  items: ProductItem[];
  isModalOpen: boolean;
  addToCompare: (product: ProductItem) => boolean;
  removeFromCompare: (productId: string) => void;
  clearCompare: () => void;
  isInCompare: (productId: string) => boolean;
  setModalOpen: (open: boolean) => void;
  toggleCompare: (product: ProductItem) => void;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      isModalOpen: false,

      addToCompare: (product) => {
        const current = get().items;
        if (current.some((i) => i._id === product._id)) {
          showToast("info", `"${product.name}" đã có trong danh sách so sánh`);
          return false;
        }
        if (current.length >= 3) {
          showToast("error", "Chỉ có thể so sánh tối đa 3 sản phẩm cùng lúc");
          return false;
        }
        set({ items: [...current, product] });
        showToast("success", `Đã thêm "${product.name}" vào so sánh (${current.length + 1}/3)`);
        return true;
      },

      removeFromCompare: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i._id !== productId),
        }));
      },

      clearCompare: () => {
        set({ items: [] });
      },

      isInCompare: (productId) => {
        return get().items.some((i) => i._id === productId);
      },

      setModalOpen: (open) => {
        set({ isModalOpen: open });
      },

      toggleCompare: (product) => {
        if (get().isInCompare(product._id)) {
          get().removeFromCompare(product._id);
          showToast("info", `Đã bỏ "${product.name}" khỏi danh sách so sánh`);
        } else {
          get().addToCompare(product);
        }
      },
    }),
    {
      name: "shopdee_compare_store",
      partialize: (state) => ({ items: state.items }),
    }
  )
);
