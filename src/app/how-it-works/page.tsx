import Link from "next/link";
import { Sparkles, ShoppingBag, CreditCard, Ticket, Truck, CheckCircle2, ShieldCheck, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Quy Trình Mua Sắm & Giao Nhận | SHOPDEE",
  description: "Các bước đặt hàng, thanh toán và giao nhận hàng tiện lợi trong 24 giờ tại SHOPDEE.",
};

export default function HowItWorksPage() {
  const steps = [
    {
      step: "01",
      icon: <ShoppingBag className="w-6 h-6 text-pink-400" />,
      title: "Khám Phá Hàng Trend Gen Z",
      desc: "Lướt hơn 100 sản phẩm thời trang Y2K, phụ kiện, tech decor được tuyển chọn theo xu hướng mới nhất.",
    },
    {
      step: "02",
      icon: <CreditCard className="w-6 h-6 text-blue-400" />,
      title: "Chọn Phân Loại & Thêm Giỏ Hàng",
      desc: "Dễ dàng lựa chọn màu sắc, kích thước (size) và kiểm tra số lượng tồn kho theo thời gian thực.",
    },
    {
      step: "03",
      icon: <Ticket className="w-6 h-6 text-purple-400" />,
      title: "Áp Mã Giảm Giá & Freeship",
      desc: "Áp dụng voucher giảm giá đến 100k và miễn phí vận chuyển 0₫ toàn quốc cho đơn hàng hôm nay.",
    },
    {
      step: "04",
      icon: <CreditCard className="w-6 h-6 text-emerald-400" />,
      title: "Thanh Toán Thuận Tiện (COD / Thẻ)",
      desc: "Lựa chọn thanh toán khi nhận hàng (COD) hoặc thẻ quốc tế Visa / Mastercard bảo mật cao.",
    },
    {
      step: "05",
      icon: <Truck className="w-6 h-6 text-amber-400" />,
      title: "Vận Chuyển Thần Tốc 24 Giờ",
      desc: "Đơn hàng được SHOPDEE Express tiếp nhận và giao hàng đến tận tay bạn trong vòng 24 giờ thời gian thực.",
    },
    {
      step: "06",
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-400" />,
      title: "Đồng Kiểm & Bảo Hành Đổi Trả",
      desc: "Khách hàng được kiểm tra hàng trước khi nhận, an tâm với chính sách hỗ trợ đổi trả miễn phí trong 7 ngày.",
    },
  ];

  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-20">
      <div className="bg-gradient-to-b from-neutral-950 to-neutral-900 py-16 border-b border-white/10 text-center">
        <div className="max-w-3xl mx-auto px-4">
          <span className="inline-flex items-center gap-1.5 bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Cẩm Nang Mua Sắm
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-4">
            Quy Trình Đặt Hàng & Giao Nhận
          </h1>
          <p className="text-neutral-300 text-base max-w-xl mx-auto">
            Trải nghiệm mua sắm chuẩn sàn thương mại điện tử chuyên nghiệp, giao hàng trong 24 giờ tại SHOPDEE.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {steps.map((item, idx) => (
            <div key={idx} className="bg-neutral-800/60 border border-white/5 p-6 rounded-2xl relative overflow-hidden flex gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                {item.icon}
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-neutral-500 uppercase">Bước {item.step}</span>
                <h3 className="text-base font-bold text-white mt-1 mb-2">{item.title}</h3>
                <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 border border-blue-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold text-white mb-2">Sẵn sàng trải nghiệm mua sắm?</h2>
          <p className="text-xs text-neutral-400 max-w-md mx-auto mb-6">
            Miễn phí vận chuyển toàn quốc cho đơn hàng hôm nay • Giao hàng chuẩn 24h!
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-[#192841] hover:bg-[#132034] text-white font-bold px-8 py-3 rounded-xl text-sm transition-all border border-white/20"
          >
            Bắt Đầu Mua Sắm Ngay
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
