import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { success: false, error: { message: "Vui lòng nhập địa chỉ email." } },
        { status: 400 }
      );
    }

    // Simulation response as specified in prompt section 3:
    // "Forgot password ở mức simulation"
    return NextResponse.json({
      success: true,
      data: {
        message: "Hướng dẫn đặt lại mật khẩu đã được gửi tới " + email + ". Bạn có thể dùng mật khẩu tạm thời: ResetPass123! để đăng nhập ngay.",
        simulation: true,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: { message: "Lỗi hệ thống khi gửi email đặt lại mật khẩu." } },
      { status: 500 }
    );
  }
}
