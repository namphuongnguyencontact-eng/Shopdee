import { ShieldCheck, AlertCircle } from "lucide-react";

export const metadata = {
  title: "Điều Khoản Sử Dụng | SHOPDEE",
  description: "Điều khoản sử dụng và quy định tham gia nền tảng mua sắm SHOPDEE.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-20">
      <div className="bg-neutral-950 py-12 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-extrabold text-white mb-2">Điều Khoản Sử Dụng Dịch Vụ</h1>
          <p className="text-neutral-400 text-sm">Cập nhật lần cuối: Tháng 09/2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-neutral-300 text-sm leading-relaxed">
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex gap-3 text-yellow-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="block text-sm font-bold text-yellow-200 mb-1">Quy định chung:</strong>
            SHOPDEE là ứng dụng mua sắm giải trí. Mọi sản phẩm, đơn hàng, điểm tích lũy và số dư ví đều thuộc tài nguyên trải nghiệm số trên hệ thống.
          </div>
        </div>

        <section>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            1. Định nghĩa và Bản chất Dịch vụ
          </h2>
          <p className="mb-2">
            SHOPDEE cung cấp môi trường thương mại điện tử tương tác dành cho người dùng trẻ tại Việt Nam nhằm mục đích giải trí, kết nối phong cách và tối ưu trải nghiệm mua sắm số.
          </p>
          <p>
            Tất cả các sản phẩm hiển thị trên hệ thống nhằm phục vụ nhu cầu khám phá xu hướng và giải trí.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            2. Số Dư & Ví SHOPDEE
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-neutral-400">
            <li>Số dư trong Ví SHOPDEE được cấp tự động để người dùng thỏa thích mua sắm các sản phẩm trên nền tảng.</li>
            <li>Số dư trong ứng dụng không có giá trị quy đổi thành tiền mặt hoặc chuyển nhượng ra ngoài hệ thống.</li>
            <li>Nghiêm cấm mọi hành vi gian lận hoặc trục lợi bất hợp pháp trên nền tảng.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            3. Tài Khoản và Bảo Mật
          </h2>
          <p>
            Người dùng chịu trách nhiệm bảo quản thông tin đăng nhập tài khoản của mình. Không sử dụng mật khẩu trùng với tài khoản ngân hàng hoặc các dịch vụ tài chính nhạy cảm khác.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-pink-500" />
            4. Quyền Sở Hữu Trí Tuệ
          </h2>
          <p>
            Hình ảnh và thương hiệu xuất hiện trong ứng dụng phục vụ mục đích minh họa trải nghiệm phong cách thời trang Gen Z. Bản quyền thuộc về các chủ sở hữu tương ứng.
          </p>
        </section>
      </div>
    </div>
  );
}
