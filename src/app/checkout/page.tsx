"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CreditCard,
  Wallet,
  Truck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  AlertTriangle,
  Loader2,
  Ticket,
} from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { formatVND } from "@/lib/utils";
import { showToast } from "@/store/useToastStore";
import { getVisitorId, getSessionId } from "@/components/analytics/TrafficTracker";

export default function CheckoutPage() {
  const router = useRouter();
  const { user, checkAuth } = useAuthStore();
  const { items, appliedVoucher, clearCart } = useCartStore();

  const [paymentMethod, setPaymentMethod] = useState<"SIMULATED_COD" | "SIMULATED_CARD">("SIMULATED_COD");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("0901234567");
  const [address, setAddress] = useState("88 Đường Nguyễn Huệ, Phường Bến Nghé");
  const [city, setCity] = useState("TP. Hồ Chí Minh");

  // Simulation loading overlay
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(1);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      setFullName(user.name);
    }
  }, [user]);

  const selectedItems = items.filter((i) => i.selected !== false);
  const subtotal = selectedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);
  const discountAmount = appliedVoucher ? appliedVoucher.discountAmount : 0;
  const shippingFee = 0;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItems.length === 0) {
      showToast({ type: "error", message: "Giỏ hàng rỗng." });
      router.push("/cart");
      return;
    }

    if (!user) {
      showToast({ type: "error", message: "Vui lòng đăng nhập để hoàn tất đơn hàng." });
      router.push("/login?redirect=/checkout");
      return;
    }

    setErrorMessage("");
    setIsProcessing(true);
    setProcessStep(1);

    try {
      // Step 1: Simulated verification delay
      await new Promise((r) => setTimeout(r, 600));
      setProcessStep(2);

      // Step 2: Call order API
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: selectedItems.map((it) => ({
            productId: it.productId,
            name: it.name,
            quantity: it.quantity,
            variantName: it.variantName,
          })),
          shippingAddress: {
            fullName: fullName || user.name,
            phone,
            address,
            city,
            isSimulated: true,
          },
          voucherCode: appliedVoucher?.code,
          paymentMethod,
          visitorId: getVisitorId(),
          sessionId: getSessionId(),
        }),
      });

      const json = await res.json();
      if (!json.success) {
        setIsProcessing(false);
        setErrorMessage(json.error?.message || "Có lỗi xảy ra khi tạo đơn hàng.");
        return;
      }

      setProcessStep(3);
      await new Promise((r) => setTimeout(r, 600));

      // Clear local cart
      await clearCart();

      // Navigate to celebration success page
      router.push(`/order/success/${json.data.order.orderNumber}`);
    } catch {
      setIsProcessing(false);
      setErrorMessage("Lỗi kết nối khi đặt hàng.");
    }
  };

  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [buyerNote, setBuyerNote] = useState("");

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-7 space-y-4 pb-24 sm:pb-8">
      {/* Shopee Checkout Breadcrumb Header */}
      <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-black text-xl text-[#192841] tracking-tight">
            SHOPDEE
          </Link>
          <span className="text-slate-300 font-light text-2xl">|</span>
          <span className="text-base sm:text-lg font-bold text-slate-800">Thanh Toán</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Bảo mật thanh toán 100%</span>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder} className="space-y-4">
        {/* 1. SHOPEE DELIVERY ADDRESS CARD (With iconic envelope dashed ribbon) */}
        <div className="bg-white rounded-sm border border-slate-200 shadow-xs overflow-hidden">
          {/* Shopee Red-Blue Envelope Line */}
          <div className="shopee-envelope-line" />

          <div className="p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#192841] font-bold text-sm uppercase tracking-wide">
                <Truck className="w-4 h-4 text-red-500" />
                <span>Địa Chỉ Nhận Hàng</span>
              </div>

              <button
                type="button"
                onClick={() => setIsEditingAddress(!isEditingAddress)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition"
              >
                {isEditingAddress ? "Xong" : "Thay Đổi"}
              </button>
            </div>

            {/* Address Display or Edit Form */}
            {isEditingAddress ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-slate-100">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Họ và tên người nhận</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Nguyễn Minh Châu"
                    className="w-full h-9 px-3 rounded-xs border border-slate-300 outline-none focus:border-[#192841]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full h-9 px-3 rounded-xs border border-slate-300 outline-none focus:border-[#192841]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tỉnh / Thành phố</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full h-9 px-3 rounded-xs border border-slate-300 outline-none focus:border-[#192841]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Địa chỉ nhận hàng chi tiết</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full h-9 px-3 rounded-xs border border-slate-300 outline-none focus:border-[#192841]"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-slate-700">
                <span className="font-bold text-slate-900 text-sm">
                  {fullName || user?.name || "Khách Hàng Shopdee"} {phone ? `(+84) ${phone}` : ""}
                </span>
                <span className="text-slate-600">
                  {address}, {city}
                </span>
                <span className="self-start sm:self-auto px-1.5 py-0.5 border border-red-500 text-red-600 text-[10px] font-semibold rounded-2xs">
                  Mặc định
                </span>
              </div>
            )}
          </div>
        </div>

        {/* 2. ORDERED PRODUCTS CARD (Shopee Table Layout) */}
        <div className="bg-white rounded-sm border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Header */}
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 border-b border-slate-100 text-xs font-semibold text-slate-500">
            <div className="col-span-6 font-bold text-slate-800">Sản phẩm</div>
            <div className="col-span-2 text-center">Đơn giá</div>
            <div className="col-span-2 text-center">Số lượng</div>
            <div className="col-span-2 text-right">Thành tiền</div>
          </div>

          {/* Shop label */}
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-800">
            <span className="px-1.5 py-0.5 bg-[#192841] text-white text-[9px] font-bold rounded-r-xs">
              Yêu thích
            </span>
            <span>Shopdee Official Store</span>
          </div>

          {/* Items */}
          <div className="divide-y divide-slate-100">
            {selectedItems.map((it) => (
              <div
                key={`${it.productId}-${it.variantName}`}
                className="p-4 grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center text-xs"
              >
                <div className="col-span-1 md:col-span-6 flex items-center gap-3">
                  <img
                    src={it.image}
                    alt={it.name}
                    className="w-14 h-14 object-cover rounded-xs border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="font-normal text-slate-800 line-clamp-1 block">
                      {it.name}
                    </span>
                    {it.variantName && (
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        Phân loại: {it.variantName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="col-span-1 md:col-span-2 text-left md:text-center text-slate-700">
                  <span className="md:hidden text-slate-400">Đơn giá: </span>
                  {formatVND(it.price)}
                </div>

                <div className="col-span-1 md:col-span-2 text-left md:text-center text-slate-700">
                  <span className="md:hidden text-slate-400">Số lượng: </span>
                  {it.quantity}
                </div>

                <div className="col-span-1 md:col-span-2 text-left md:text-right font-bold text-slate-900">
                  <span className="md:hidden text-slate-400 font-normal">Thành tiền: </span>
                  {formatVND(it.price * it.quantity)}
                </div>
              </div>
            ))}
          </div>

          {/* Buyer Note & Shipping Method (Shopee style lower block) */}
          <div className="p-4 bg-slate-50/70 border-t border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4 items-center text-xs">
            <div className="md:col-span-6 flex items-center gap-3">
              <label className="text-slate-600 font-medium shrink-0">Lời nhắn:</label>
              <input
                type="text"
                value={buyerNote}
                onChange={(e) => setBuyerNote(e.target.value)}
                placeholder="Lưu ý cho Người bán..."
                className="flex-1 h-8 px-3 rounded-xs border border-slate-300 bg-white text-xs outline-none focus:border-[#192841]"
              />
            </div>

            <div className="md:col-span-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-4">
              <div>
                <span className="font-bold text-emerald-700 block">Đơn vị vận chuyển: Nhanh</span>
                <span className="text-[11px] text-slate-500">Được đồng kiểm • Giao trong 24 giờ</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-emerald-700">Miễn phí 0₫</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. SHOPEE VOUCHER BAR */}
        <div className="bg-white rounded-sm border border-slate-200 shadow-xs p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-800 font-bold">
            <Ticket className="w-4 h-4 text-red-500" />
            <span>Shopdee Voucher</span>
          </div>

          {appliedVoucher ? (
            <span className="text-red-600 font-bold">
              Mã {appliedVoucher.code}: -{formatVND(appliedVoucher.discountAmount)}
            </span>
          ) : (
            <Link href="/cart" className="text-blue-600 hover:underline">
              Chọn hoặc nhập mã tại giỏ hàng
            </Link>
          )}
        </div>

        {/* 4. PAYMENT METHODS SELECTION (Shopee Style) */}
        <div className="bg-white rounded-sm border border-slate-200 shadow-xs p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-sm">Phương Thức Thanh Toán</h3>
            <span className="text-xs text-slate-400">Chọn 1 phương thức</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* COD Option */}
            <label
              onClick={() => setPaymentMethod("SIMULATED_COD")}
              className={`p-3.5 border rounded-xs cursor-pointer flex items-center justify-between transition ${
                paymentMethod === "SIMULATED_COD"
                  ? "border-[#192841] bg-slate-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Truck className="w-5 h-5 text-emerald-600" />
                <div>
                  <span className="font-bold text-slate-900 block">
                    Thanh toán khi nhận hàng (COD)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Kiểm tra hàng trước khi nhận, trả tiền mặt
                  </span>
                </div>
              </div>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "SIMULATED_COD"}
                onChange={() => setPaymentMethod("SIMULATED_COD")}
                className="w-4 h-4 text-[#192841]"
              />
            </label>

            {/* Credit Card Option */}
            <label
              onClick={() => setPaymentMethod("SIMULATED_CARD")}
              className={`p-3.5 border rounded-xs cursor-pointer flex items-center justify-between transition ${
                paymentMethod === "SIMULATED_CARD"
                  ? "border-[#192841] bg-slate-50"
                  : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CreditCard className="w-5 h-5 text-[#192841]" />
                <div>
                  <span className="font-bold text-slate-900 block">
                    Thẻ Tín dụng / Ghi nợ / ATM
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Visa, Mastercard, Thẻ nội địa
                  </span>
                </div>
              </div>
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === "SIMULATED_CARD"}
                onChange={() => setPaymentMethod("SIMULATED_CARD")}
                className="w-4 h-4 text-[#192841]"
              />
            </label>
          </div>

          {paymentMethod === "SIMULATED_CARD" && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs space-y-1.5 text-xs text-slate-600 font-mono">
              <div className="flex items-center justify-between">
                <span>Số thẻ mô phỏng:</span>
                <strong className="text-slate-900">4242 •••• •••• 4242</strong>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>Hết hạn: 12/28</span>
                <span>CVC: 123</span>
              </div>
            </div>
          )}
        </div>

        {/* 5. SHOPEE SETTLEMENT & SUMMARY CARD */}
        <div className="bg-white rounded-sm border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex flex-col items-end space-y-2 text-xs text-slate-600 border-b border-slate-100 pb-4">
            <div className="flex justify-between w-full max-w-sm">
              <span>Tổng tiền hàng:</span>
              <span className="text-slate-900 font-medium">{formatVND(subtotal)}</span>
            </div>
            <div className="flex justify-between w-full max-w-sm">
              <span>Phí vận chuyển:</span>
              <span className="text-slate-900 font-medium">0₫</span>
            </div>
            {appliedVoucher && (
              <div className="flex justify-between w-full max-w-sm text-red-600 font-semibold">
                <span>Voucher giảm giá:</span>
                <span>-{formatVND(appliedVoucher.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between w-full max-w-sm items-baseline pt-2">
              <span className="text-sm font-bold text-slate-800">Tổng thanh toán:</span>
              <span className="text-2xl font-black text-[#192841]">{formatVND(total)}</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            <p className="text-[11px] text-slate-500 leading-relaxed text-center sm:text-left">
              Nhấn &quot;Đặt hàng&quot; đồng nghĩa với việc bạn đồng ý tuân theo{" "}
              <Link href="/terms" className="text-blue-600 hover:underline">
                Điều khoản Shopdee
              </Link>
              .
            </p>

            <button
              type="submit"
              disabled={isProcessing || selectedItems.length === 0}
              className="hidden sm:block w-64 h-12 bg-[#192841] hover:bg-[#132034] text-white font-extrabold text-sm rounded-xs shadow-md transition disabled:opacity-50 cursor-pointer uppercase tracking-wider shrink-0"
            >
              {isProcessing ? "Đang xử lý..." : "Đặt Hàng"}
            </button>
          </div>
        </div>

        {/* Mobile Sticky Bottom Place Order Bar */}
        <div className="fixed sm:hidden bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] flex items-center justify-between shadow-2xl">
          <div>
            <span className="text-[11px] text-slate-500 block leading-tight">Tổng thanh toán:</span>
            <span className="text-lg font-black text-[#192841]">{formatVND(total)}</span>
          </div>
          <button
            type="submit"
            disabled={isProcessing || selectedItems.length === 0}
            className="px-6 h-11 bg-[#192841] hover:bg-[#132034] text-white font-bold text-xs uppercase tracking-wider rounded-xs shadow-md disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>Đặt Hàng</span>
            )}
          </button>
        </div>
      </form>

      {/* Payment simulation loading modal */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white p-8 max-w-sm w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95 border border-slate-200">
            <div className="w-16 h-16 bg-slate-100 text-[#192841] flex items-center justify-center mx-auto">
              {processStep === 3 ? (
                <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-bounce" />
              ) : (
                <Loader2 className="w-8 h-8 animate-spin" />
              )}
            </div>

            <div>
              <span className="px-2.5 py-0.5 bg-[#192841] text-white text-[10px] font-black uppercase">
                ĐANG XỬ LÝ AN TOÀN
              </span>
              <h3 className="text-base font-extrabold text-slate-900 mt-2">
                {processStep === 1 && "Đang xác thực thông tin đơn hàng..."}
                {processStep === 2 && "Đang tạo đơn hàng và bàn giao vận chuyển..."}
                {processStep === 3 && "✅ Đặt hàng thành công!"}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {processStep === 3
                  ? "Đang chuyển bạn sang thông tin đơn hàng..."
                  : "Vui lòng giữ nguyên màn hình trong giây lát."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
