import { ShieldCheck, Lock } from "lucide-react";

export const metadata = {
  title: "Chính Sách Bảo Mật | SHOPDEE",
  description: "Chính sách bảo vệ quyền riêng tư và dữ liệu người dùng tại SHOPDEE.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white pb-20">
      <div className="bg-neutral-950 py-12 border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-extrabold text-white mb-2">Chính Sách Bảo Mật Dữ Liệu</h1>
          <p className="text-neutral-400 text-sm">Cập nhật lần cuối: Tháng 09/2026</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-8 text-neutral-300 text-sm leading-relaxed">
        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3 text-blue-300">
          <Lock className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs">
            <strong className="block text-sm font-bold text-blue-200 mb-1">Cam kết bảo vệ dữ liệu người dùng:</strong>
            Chúng tôi tuyệt đối không thu thập hoặc lưu trữ số thẻ tín dụng, tài khoản ngân hàng hoặc mật khẩu nhạy cảm của bạn.
          </div>
        </div>

        <section>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            1. Dữ Liệu Chúng Tôi Thu Thập
          </h2>
          <p className="mb-2">Hệ thống chỉ lưu trữ các thông tin cần thiết phục vụ tài khoản và trải nghiệm mua sắm của bạn:</p>
          <ul className="list-disc pl-5 space-y-1 text-neutral-400">
            <li>Tên hiển thị, địa chỉ email dùng để đăng nhập và định danh tài khoản.</li>
            <li>Lịch sử đơn hàng, danh sách yêu thích và tiến độ nhiệm vụ tích điểm thưởng.</li>
            <li>Thông tin giao nhận do người dùng nhập khi tạo đơn hàng.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            2. Sử Dụng Cookie và Phiên Làm Việc (Session)
          </h2>
          <p>
            SHOPDEE sử dụng cookie `shopdee_session` chuẩn HTTP-Only để duy trì trạng thái đăng nhập an toàn của bạn. Cookie này được mã hóa bằng JWT và tự động hết hạn sau 7 ngày.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            3. Không Chia Sẻ Dữ Liệu Cho Bên Thứ Ba
          </h2>
          <p>
            Mọi dữ liệu sinh ra trong quá trình sử dụng SHOPDEE đều được lưu trữ an toàn trong cơ sở dữ liệu nội bộ và không bao giờ bị bán hoặc chia sẻ cho các bên quảng cáo thứ ba.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500" />
            4. Quyền Xóa Dữ Liệu Của Bạn
          </h2>
          <p>
            Bạn có quyền yêu cầu xóa bỏ toàn bộ tài khoản, đơn hàng và lịch sử giao dịch bất kỳ lúc nào thông qua phần Cài đặt tài khoản.
          </p>
        </section>
      </div>
    </div>
  );
}
