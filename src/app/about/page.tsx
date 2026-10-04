import Link from "next/link";
import { Sparkles, Heart, Rocket, Target, Users, Code, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Giới Thiệu Về SHOPDEE | Nền Tảng Mua Sắm Gen Z",
  description: "Câu chuyện và sứ mệnh của SHOPDEE - Sàn thương mại điện tử xu hướng cho Gen Z Việt Nam.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-20">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-pink-950 via-purple-950 to-neutral-950 py-16 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="inline-flex items-center gap-1.5 bg-pink-500/10 border border-pink-500/30 text-pink-400 text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Về Chúng Tôi
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white mb-6">
            Nơi Thỏa Cơn Nghiện Shopping <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-300">
              Không Lo Cháy Ví
            </span>
          </h1>
          <p className="text-neutral-300 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            SHOPDEE ra đời từ niềm thấu cảm với thế hệ trẻ Việt Nam — những người yêu thích săn đồ xu hướng, đam mê cảm giác chốt đơn nhưng thường xuyên phải kiềm chế vì ngân sách có hạn.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Story */}
        <div className="bg-neutral-800/60 border border-white/5 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            Câu Chuyện Của SHOPDEE
          </h2>
          <p className="text-neutral-300 text-sm leading-relaxed mb-4">
            Bạn đã bao giờ ngồi lướt Shopee, thêm hàng tá đồ vào giỏ hàng lúc nửa đêm chỉ để... ngắm và rồi xóa đi vì tiếc tiền? Đó chính là hiện tượng <em>"Wishlist Therapy"</em> phổ biến của Gen Z.
          </p>
          <p className="text-neutral-300 text-sm leading-relaxed">
            SHOPDEE mang đến trải nghiệm mua sắm hiện đại: giao diện trực quan, tha hồ săn deal chớp nhoáng (Flash Sale), áp mã giảm giá, lựa chọn hình thức thanh toán linh hoạt và theo dõi đơn hàng giao tận nơi trong 24 giờ.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-800/40 border border-white/5 p-6 rounded-2xl text-center">
            <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">Trải Nghiệm Đỉnh Cao</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Giao diện hiện đại, tốc độ phản hồi tính bằng mili-giây, thiết kế tối ưu hóa cho phong cách lướt di động của giới trẻ.
            </p>
          </div>

          <div className="bg-neutral-800/40 border border-white/5 p-6 rounded-2xl text-center">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">Giao Hàng Thần Tốc 24h</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Quy trình vận chuyển tối ưu bởi SHOPDEE Express, cam kết kiện hàng tới tay người nhận nhanh chóng trong vòng 24 giờ.
            </p>
          </div>

          <div className="bg-neutral-800/40 border border-white/5 p-6 rounded-2xl text-center">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-white mb-2">Cam Kết Chất Lượng</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              100% sản phẩm chất lượng, đồng kiểm khi nhận hàng cùng chính sách đổi trả miễn phí trong 7 ngày.
            </p>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="bg-neutral-800/60 border border-white/5 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <Code className="w-5 h-5 text-blue-400" />
            Nền Tảng Công Nghệ Hiện Đại
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-neutral-900/60 rounded-xl border border-white/5">
              <div className="font-bold text-sm text-white">Next.js 15</div>
              <div className="text-xs text-neutral-400 mt-0.5">App Router & RSC</div>
            </div>
            <div className="p-3 bg-neutral-900/60 rounded-xl border border-white/5">
              <div className="font-bold text-sm text-white">React 19</div>
              <div className="text-xs text-neutral-400 mt-0.5">Modern Hooks & Actions</div>
            </div>
            <div className="p-3 bg-neutral-900/60 rounded-xl border border-white/5">
              <div className="font-bold text-sm text-white">MongoDB & Mongoose</div>
              <div className="text-xs text-neutral-400 mt-0.5">High Performance DB</div>
            </div>
            <div className="p-3 bg-neutral-900/60 rounded-xl border border-white/5">
              <div className="font-bold text-sm text-white">Tailwind CSS</div>
              <div className="text-xs text-neutral-400 mt-0.5">Responsive Gen Z UI</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-4">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold px-8 py-3.5 rounded-xl text-base shadow-lg shadow-pink-500/25 transition-all"
          >
            Khám Phá Cửa Hàng
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
