import Link from "next/link";
import { ShieldCheck, Sparkles, HelpCircle, CheckCircle2, ArrowRight, Zap, RefreshCw, AlertTriangle, Trophy, Gift } from "lucide-react";

export const metadata = {
  title: "Cơ Chế Mua Sắm Thông Minh | SHOPDEE",
  description: "Tìm hiểu toàn diện về mô hình thương mại điện tử trải nghiệm không rủi ro tài chính của SHOPDEE.",
};

export default function SimulationPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-20">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-950 to-neutral-950 py-16 border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(236,72,153,0.15),transparent_50%)]" />
        <div className="max-w-5xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider mb-6">
            <ShieldCheck className="w-4 h-4 text-yellow-400" />
            Bảo Chứng Trải Nghiệm Mua Sắm An Toàn
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-6">
            Thỏa Sức Mua Sắm <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-400">Không Rủi Ro</span>
          </h1>
          <p className="text-neutral-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            SHOPDEE là nền tảng thương mại điện tử trải nghiệm phong cách thế hệ mới dành riêng cho Gen Z Việt Nam. Nơi bạn thỏa mãn đam mê mua sắm, sưu tầm đồ hot trend và thăng cấp phong cách với <strong className="text-yellow-400">ngân sách ưu đãi tặng sẵn</strong>.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6">
        {/* Core Transparency Guarantee Card */}
        <div className="bg-gradient-to-br from-neutral-800 to-neutral-850 border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md mb-12">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            4 Cam Kết Minh Bạch Cốt Lõi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5 flex gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-green-500/10 text-green-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Giao Hàng Hỏa Tốc 24 Giờ</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Đơn hàng sau khi đặt được xử lý và chuyển giao cho đơn vị vận chuyển uy tín. Hệ thống tự động cập nhật lộ trình và hoàn tất giao sau 24h.
                </p>
              </div>
            </div>

            <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5 flex gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">100% Sản Phẩm Chính Hãng</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Tất cả sản phẩm trên SHOPDEE đều được kiểm duyệt chất lượng kỹ lưỡng, mô tả chi tiết, hình ảnh chân thực và rõ ràng.
                </p>
              </div>
            </div>

            <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5 flex gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Đổi Trả Miễn Phí Trong 7 Ngày</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Hỗ trợ đổi trả hoặc hoàn tiền nhanh chóng nếu sản phẩm có lỗi từ nhà sản xuất hoặc không đúng mô tả đơn hàng.
                </p>
              </div>
            </div>

            <div className="p-4 bg-neutral-900/60 rounded-xl border border-white/5 flex gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 text-yellow-400 flex items-center justify-center shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Thanh Toán Linh Hoạt & An Toàn</h3>
                <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                  Hỗ trợ thanh toán khi nhận hàng (COD) và thanh toán qua thẻ, bảo mật dữ liệu tuyệt đối theo tiêu chuẩn sàn thương mại điện tử.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* How The Flow Works */}
        <div className="mb-14">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Quy Trình Mua Sắm Chuẩn Sàn TMĐT</h2>
            <p className="text-neutral-400 text-sm">Từ lúc chọn sản phẩm đến khi nhận hàng tận tay</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-neutral-800/80 border border-white/5 p-5 rounded-xl flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold mb-3">1</div>
              <h4 className="font-bold text-sm text-white mb-1">Dạo Phố & Chọn Món</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">Khám phá hàng trăm sản phẩm đa dạng, thêm vào giỏ và áp dụng voucher giảm giá hấp dẫn.</p>
            </div>

            <div className="bg-neutral-800/80 border border-white/5 p-5 rounded-xl flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold mb-3">2</div>
              <h4 className="font-bold text-sm text-white mb-1">Xác Nhận Đơn Hàng</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">Điền địa chỉ nhận hàng và chọn phương thức COD hoặc Thẻ ngân hàng thuận tiện.</p>
            </div>

            <div className="bg-neutral-800/80 border border-white/5 p-5 rounded-xl flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold mb-3">3</div>
              <h4 className="font-bold text-sm text-white mb-1">Vận Chuyển Hỏa Tốc</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">Đơn hàng lập tức được xuất kho và chuyển sang trạng thái Đang vận chuyển.</p>
            </div>

            <div className="bg-neutral-800/80 border border-white/5 p-5 rounded-xl flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-3">4</div>
              <h4 className="font-bold text-sm text-white mb-1">Nhận Hàng Thành Công</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">Sau 24 giờ, đơn hàng được cập nhật Giao hàng thành công cùng chính sách hỗ trợ sau bán.</p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-yellow-400" />
            Câu Hỏi Thường Gặp Của Khách Hàng
          </h2>
          <div className="space-y-4">
            <div className="bg-neutral-800/60 border border-white/5 p-5 rounded-xl">
              <h3 className="text-sm font-bold text-white mb-2">Đơn hàng bao lâu sẽ được giao tới tôi?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Tại SHOPDEE, tất cả đơn hàng đều được cam kết giao hỏa tốc trong vòng 24 giờ. Bạn có thể theo dõi đồng hồ đếm ngược giao hàng trực tiếp tại trang Chi tiết đơn hàng.
              </p>
            </div>

            <div className="bg-neutral-800/60 border border-white/5 p-5 rounded-xl">
              <h3 className="text-sm font-bold text-white mb-2">Tôi có thể đổi trả hàng nếu không ưng ý không?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Có. Khách hàng có quyền kiểm tra hàng khi nhận và được quyền đổi trả miễn phí trong 7 ngày nếu sản phẩm có lỗi kỹ thuật hoặc không giống hình ảnh mô tả.
              </p>
            </div>

            <div className="bg-neutral-800/60 border border-white/5 p-5 rounded-xl">
              <h3 className="text-sm font-bold text-white mb-2">Tôi có thể chỉnh sửa thông tin giao hàng ở đâu?</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Bạn có thể vào trang Hồ sơ cá nhân (Profile) bất kỳ lúc nào để cập nhật họ tên, số điện thoại, địa chỉ nhận hàng và ảnh đại diện của mình.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold px-8 py-3.5 rounded-xl text-base shadow-lg shadow-pink-500/25 transition-all transform hover:-translate-y-0.5"
          >
            Bắt Đầu Dạo Phố Mua Sắm Ngay
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
