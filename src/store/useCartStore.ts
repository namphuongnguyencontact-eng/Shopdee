import { create } from "zustand";
import { showToast } from "./useToastStore";

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  variantName?: string;
  selected?: boolean;
}

export interface AppliedVoucher {
  code: string;
  title: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  discountAmount: number;
  minOrderValue: number;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  isLoading: boolean;
  appliedVoucher: AppliedVoucher | null;
  setIsDrawerOpen: (open: boolean) => void;
  fetchCart: () => Promise<void>;
  addItem: (item: CartItem) => Promise<void>;
  updateQuantity: (productId: string, variantName: string | undefined, quantity: number) => Promise<void>;
  removeItem: (productId: string, variantName?: string) => Promise<void>;
  clearCart: () => Promise<void>;
  toggleSelect: (productId: string, variantName?: string) => void;
  toggleSelectAll: (selected: boolean) => void;
  applyVoucher: (voucher: AppliedVoucher | null) => void;
  syncGuestCartToUser: () => Promise<void>;
}

const LOCAL_STORAGE_KEY = "shopdee_guest_cart";

function getLocalItems(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalItems(items: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error("Local cart save error:", e);
  }
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isDrawerOpen: false,
  isLoading: false,
  appliedVoucher: null,
  setIsDrawerOpen: (open) => set({ isDrawerOpen: open }),

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch("/api/cart");
      const json = await res.json();

      if (json.success && json.data?.items?.length) {
        set({ items: json.data.items, isLoading: false });
      } else {
        // Fallback to local storage if guest
        const local = getLocalItems();
        set({ items: local, isLoading: false });
      }
    } catch {
      set({ items: getLocalItems(), isLoading: false });
    }
  },

  addItem: async (item) => {
    const prevItems = get().items;
    const existingIndex = prevItems.findIndex(
      (i) => i.productId === item.productId && i.variantName === item.variantName
    );

    let newItems: CartItem[];
    if (existingIndex > -1) {
      newItems = [...prevItems];
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newItems[existingIndex].quantity + item.quantity,
      };
    } else {
      newItems = [...prevItems, { ...item, selected: true }];
    }

    set({ items: newItems });
    saveLocalItems(newItems);

    showToast({
      type: "success",
      title: "Đã thêm vào giỏ hàng!",
      message: `${item.name} đã được thêm vào giỏ hàng.`,
    });

    // Sync to server if authenticated
    try {
      await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: item.productId,
          quantity: item.quantity,
          variantName: item.variantName,
        }),
      });
    } catch {
      // Ignored for guest
    }
  },

  updateQuantity: async (productId, variantName, quantity) => {
    if (quantity <= 0) {
      get().removeItem(productId, variantName);
      return;
    }

    const newItems = get().items.map((it) => {
      if (it.productId === productId && it.variantName === variantName) {
        return { ...it, quantity };
      }
      return it;
    });

    set({ items: newItems });
    saveLocalItems(newItems);

    try {
      await fetch("/api/cart", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, variantName, quantity }),
      });
    } catch {}
  },

  removeItem: async (productId, variantName) => {
    const newItems = get().items.filter(
      (it) => !(it.productId === productId && (!variantName || it.variantName === variantName))
    );
    set({ items: newItems });
    saveLocalItems(newItems);

    showToast({
      type: "info",
      message: "Đã xóa sản phẩm khỏi giỏ hàng.",
    });

    try {
      const url = `/api/cart?productId=${productId}${variantName ? `&variantName=${encodeURIComponent(variantName)}` : ""}`;
      await fetch(url, { method: "DELETE" });
    } catch {}
  },

  clearCart: async () => {
    set({ items: [], appliedVoucher: null });
    saveLocalItems([]);
    try {
      await fetch("/api/cart?clearAll=true", { method: "DELETE" });
    } catch {}
  },

  toggleSelect: (productId, variantName) => {
    const newItems = get().items.map((it) => {
      if (it.productId === productId && it.variantName === variantName) {
        return { ...it, selected: !it.selected };
      }
      return it;
    });
    set({ items: newItems });
    saveLocalItems(newItems);
  },

  toggleSelectAll: (selected) => {
    const newItems = get().items.map((it) => ({ ...it, selected }));
    set({ items: newItems });
    saveLocalItems(newItems);
  },

  applyVoucher: (voucher) => set({ appliedVoucher: voucher }),

  syncGuestCartToUser: async () => {
    const local = getLocalItems();
    if (local.length > 0) {
      try {
        await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "merge", items: local }),
        });
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        get().fetchCart();
      } catch (err) {
        console.error("Cart sync error:", err);
      }
    } else {
      get().fetchCart();
    }
  },
}));
