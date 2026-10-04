import { create } from "zustand";

export interface ToastItem {
  id: string;
  type: "success" | "error" | "info" | "xp" | "level_up" | "badge";
  title?: string;
  message: string;
  xpAmount?: number;
  badgeName?: string;
  badgeIcon?: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  addToast: (toastOrType: Omit<ToastItem, "id"> | ToastItem["type"], maybeMessage?: string) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toastOrType, maybeMessage) => {
    const id = "toast_" + Math.random().toString(36).substring(2, 9);
    let newToast: ToastItem;

    if (typeof toastOrType === "string") {
      newToast = {
        id,
        type: toastOrType,
        message: maybeMessage || "",
      };
    } else {
      newToast = { ...toastOrType, id };
    }

    set((state) => ({ toasts: [...state.toasts, newToast] }));

    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, newToast.duration || 4000);
  },
  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },
}));

// Quick helper
export const showToast = (toastOrType: Omit<ToastItem, "id"> | ToastItem["type"], maybeMessage?: string) =>
  useToastStore.getState().addToast(toastOrType, maybeMessage);
