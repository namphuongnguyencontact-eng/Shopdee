import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getSessionFromRequest } from "@/lib/auth";
import Order from "@/models/Order";
import Product from "@/models/Product";
import Category from "@/models/Category";
import User from "@/models/User";
import Voucher from "@/models/Voucher";
import TrafficSession from "@/models/TrafficSession";
import { analyticsService } from "@/services/analytics";
import * as XLSX from "xlsx";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const session = getSessionFromRequest(req);
    if (!session || session.role !== "admin") {
      return NextResponse.json({ success: false, error: { message: "Không có quyền Admin." } }, { status: 403 });
    }

    await connectDB();

    // Lấy danh sách tài khoản Admin để loại bỏ 100% dữ liệu của Admin khỏi tất cả báo cáo Excel
    const adminUsers = await User.find({ role: "admin" }).select("_id").lean();
    const adminUserIds = adminUsers.map((u) => u._id);

    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get("type") || "orders";
    const productId = searchParams.get("productId") || "";
    const days = searchParams.get("days") ? Number(searchParams.get("days")) : 30;

    let sheetName = "Dữ Liệu";
    let fileName = `shopdee_${type}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    let dataRows: Record<string, any>[] = [];

    // Helper formatting
    const formatDateStr = (d?: Date | string) => {
      if (!d) return "";
      const date = new Date(d);
      return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()} ${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    };

    if (type === "sales") {
      sheetName = "San_Pham_Da_Ban";
      fileName = `shopdee_san_pham_da_ban_${new Date().toISOString().slice(0, 10)}.xlsx`;

      const orders = await Order.find({
        orderStatus: { $ne: "CANCELLED" },
        userId: { $nin: adminUserIds },
      }).lean();
      const productSalesMap = new Map<string, any>();

      for (const order of orders) {
        for (const item of order.items || []) {
          const pid = String(item.productId);
          if (!productSalesMap.has(pid)) {
            productSalesMap.set(pid, {
              productId: pid,
              name: item.name,
              price: item.price || 0,
              totalSold: 0,
              totalRevenue: 0,
              orderCount: 0,
              buyers: new Set<string>(),
              latestDate: order.createdAt,
            });
          }
          const rec = productSalesMap.get(pid);
          rec.totalSold += item.quantity || 1;
          rec.totalRevenue += (item.price || 0) * (item.quantity || 1);
          rec.orderCount += 1;
          if (order.shippingAddress?.fullName) rec.buyers.add(order.shippingAddress.fullName);
          if (new Date(order.createdAt) > new Date(rec.latestDate)) rec.latestDate = order.createdAt;
        }
      }

      // Add top products if orders are few
      if (productSalesMap.size < 15) {
        const topProds = await Product.find({ soldCount: { $gt: 0 } }).sort({ soldCount: -1 }).limit(20).lean();
        for (const p of topProds) {
          const pid = String(p._id);
          if (!productSalesMap.has(pid)) {
            productSalesMap.set(pid, {
              productId: pid,
              name: p.name,
              price: p.price,
              totalSold: p.soldCount,
              totalRevenue: p.price * p.soldCount,
              orderCount: p.soldCount,
              buyers: new Set<string>(),
              latestDate: p.updatedAt || p.createdAt,
            });
          }
        }
      }

      const products = await Product.find({}).lean();
      const prodMap = new Map(products.map((p) => [String(p._id), p]));
      const categories = await Category.find({}).lean();
      const catMap = new Map(categories.map((c) => [c.slug, c.name]));

      const sortedList = Array.from(productSalesMap.values()).sort((a, b) => b.totalSold - a.totalSold);

      dataRows = sortedList.map((item, index) => {
        const prod = prodMap.get(item.productId);
        const categoryName = prod?.categorySlug ? catMap.get(prod.categorySlug) || prod.categorySlug : "Khác";

        return {
          "STT": index + 1,
          "MÃ SẢN PHẨM": item.productId,
          "TÊN SẢN PHẨM": prod?.name || item.name,
          "DANH MỤC": categoryName,
          "GIÁ BÁN (VNĐ)": item.price,
          "TỒN KHO": prod?.stock ?? 100,
          "ĐÃ BÁN (SỐ LƯỢNG)": item.totalSold,
          "DOANH SỐ (VNĐ)": item.totalRevenue,
          "SỐ ĐƠN HÀNG": item.orderCount,
          "SỐ KHÁCH MUA": Math.max(item.buyers.size, 1),
          "NGÀY BÁN GẦN NHẤT": formatDateStr(item.latestDate),
        };
      });
    } else if (type === "buyers" && productId) {
      sheetName = "Nguoi_Mua_San_Pham";
      fileName = `shopdee_nguoi_mua_${productId}_${new Date().toISOString().slice(0, 10)}.xlsx`;

      const prod = await Product.findById(productId).lean();
      const orders = await Order.find({
        $or: [{ "items.productId": productId }, { "items.slug": prod?.slug }],
        orderStatus: { $ne: "CANCELLED" },
        userId: { $nin: adminUserIds },
      })
        .sort({ createdAt: -1 })
        .lean();

      dataRows = orders.map((o, idx) => {
        const item = o.items.find((it: any) => String(it.productId) === productId || it.slug === prod?.slug);
        const qty = item?.quantity || 1;
        const price = item?.price || prod?.price || 0;

        return {
          "STT": idx + 1,
          "MÃ ĐƠN HÀNG": o.orderNumber,
          "SẢN PHẨM": prod?.name || item?.name || "N/A",
          "TÊN KHÁCH HÀNG": o.shippingAddress?.fullName || "Khách Hàng",
          "SỐ ĐIỆN THOẠI": o.shippingAddress?.phone || "N/A",
          "TỈNH / THÀNH PHỐ": o.shippingAddress?.city || "TP. Hồ Chí Minh",
          "ĐỊA CHỈ NHẬN HÀNG": o.shippingAddress?.address || "N/A",
          "SỐ LƯỢNG MUA": qty,
          "ĐƠN GIÁ (VNĐ)": price,
          "THÀNH TIỀN (VNĐ)": qty * price,
          "TỔNG ĐƠN HÀNG (VNĐ)": o.total,
          "TRẠNG THÁI ĐƠN": o.orderStatus,
          "PHƯƠNG THỨC TT": o.paymentMethod,
          "NGÀY ĐẶT HÀNG": formatDateStr(o.createdAt),
        };
      });
    } else if (type === "orders") {
      sheetName = "Danh_Sach_Don_Hang";
      fileName = `shopdee_don_hang_${new Date().toISOString().slice(0, 10)}.xlsx`;

      const orders = await Order.find({ userId: { $nin: adminUserIds } }).sort({ createdAt: -1 }).lean();

      dataRows = orders.map((o, idx) => {
        const itemsSummary = (o.items || []).map((it: any) => `${it.name} (x${it.quantity})`).join("; ");

        const statusMap: Record<string, string> = {
          PLACED: "Chờ xác nhận",
          CONFIRMED: "Đã xác nhận",
          PREPARING: "Đang chuẩn bị",
          SHIPPING: "Đang giao hàng",
          READY_FOR_SIMULATED_DELIVERY: "Sẵn sàng giao",
          COMPLETED: "Đã hoàn thành",
          CANCELLED: "Đã hủy",
        };

        return {
          "STT": idx + 1,
          "MÃ ĐƠN HÀNG": o.orderNumber,
          "HỌ TÊN KHÁCH HÀNG": o.shippingAddress?.fullName || "Khách Hàng",
          "SỐ ĐIỆN THOẠI": o.shippingAddress?.phone || "",
          "TỈNH / THÀNH PHỐ": o.shippingAddress?.city || "",
          "ĐỊA CHỈ CHI TIẾT": `${o.shippingAddress?.address || ""}, ${o.shippingAddress?.district || ""}`,
          "SẢN PHẨM ĐẶT MUA": itemsSummary,
          "TẠM TÍNH (VNĐ)": o.subtotal || o.total,
          "GIẢM GIÁ (VNĐ)": o.discount || 0,
          "PHÍ SHIP (VNĐ)": o.shippingFee || 0,
          "TỔNG THANH TOÁN (VNĐ)": o.total,
          "TRẠNG THÁI ĐƠN": statusMap[o.orderStatus] || o.orderStatus,
          "PHƯƠNG THỨC TT": o.paymentMethod,
          "TRẠNG THÁI TT": o.paymentStatus || "COMPLETED",
          "MÃ GIẢM GIÁ ĐÃ DÙNG": o.voucherCode || "Không",
          "NGÀY TẠO ĐƠN": formatDateStr(o.createdAt),
        };
      });
    } else if (type === "products") {
      sheetName = "Danh_Sach_San_Pham";
      fileName = `shopdee_san_pham_${new Date().toISOString().slice(0, 10)}.xlsx`;

      const products = await Product.find({}).sort({ createdAt: -1 }).lean();
      const categories = await Category.find({}).lean();
      const catMap = new Map(categories.map((c) => [c.slug, c.name]));

      dataRows = products.map((p, idx) => {
        const catName = p.categorySlug ? catMap.get(p.categorySlug) || p.categorySlug : "Khác";

        return {
          "STT": idx + 1,
          "MÃ SẢN PHẨM": String(p._id),
          "TÊN SẢN PHẨM": p.name,
          "SLUG URL": p.slug,
          "DANH MỤC": catName,
          "GIÁ BÁN HIỆN TẠI (VNĐ)": p.price,
          "GIÁ GỐC (VNĐ)": p.originalPrice || p.price,
          "TỒN KHO": p.stock ?? 0,
          "ĐÃ BÁN": p.soldCount || 0,
          "LƯỢT XEM": p.viewCount || 0,
          "ĐÁNH GIÁ (SAO)": p.ratingAverage || 5,
          "SỐ ĐÁNH GIÁ": p.reviewCount || 0,
          "TRẠNG THÁI": p.status === "active" ? "Đang bán" : "Ẩn",
          "NGÀY TẠO": formatDateStr(p.createdAt),
        };
      });
    } else if (type === "users") {
      sheetName = "Danh_Sach_Nguoi_Dung";
      fileName = `shopdee_nguoi_dung_${new Date().toISOString().slice(0, 10)}.xlsx`;

      const search = searchParams.get("search")?.trim() || "";
      const source = searchParams.get("source")?.trim();

      const userQuery: Record<string, any> = { role: { $ne: "admin" } };
      if (source && source !== "all") {
        userQuery.acquisitionSource = source;
      }
      if (search) {
        const regex = new RegExp(search, "i");
        userQuery.$or = [
          { name: regex },
          { email: regex },
          { username: regex },
          { acquisitionSource: regex },
        ];
      }

      const users = await User.find(userQuery).sort({ createdAt: -1 }).lean();

      dataRows = users.map((u, idx) => ({
        "STT": idx + 1,
        "MÃ NGƯỜI DÙNG": String(u._id),
        "HỌ VÀ TÊN": u.name,
        "TÊN ĐĂNG NHẬP": u.username || "",
        "EMAIL": u.email,
        "SỐ ĐIỆN THOẠI": u.phone || "",
        "NGUỒN ĐẾN TỪ (NỀN TẢNG)": u.acquisitionSource || "Direct",
        "KÊNH (MEDIUM)": u.acquisitionMedium || "organic",
        "CHIẾN DỊCH (CAMPAIGN)": u.acquisitionCampaign || "",
        "REFERRER URL": u.acquisitionReferrer || "",
        "THIẾT BỊ ĐĂNG KÝ": u.registrationDevice || "",
        "IP ĐĂNG KÝ": u.registrationIp || "",
        "GIỚI TÍNH": u.gender || "Chưa cập nhật",
        "NGÀY SINH": u.birthDate || "",
        "TỈNH / THÀNH PHỐ": u.city || u.defaultShippingAddress?.city || "",
        "VAI TRÒ": u.role === "admin" ? "Quản Trị Viên" : "Khách Hàng",
        "CẤP ĐỘ": u.level || 1,
        "ĐIỂM XP": u.xp || 0,
        "SỐ DƯ VÍ (VNĐ)": u.walletBalance || 0,
        "TRẠNG THÁI": u.isActive ? "Hoạt động" : "Khóa",
        "NGÀY THAM GIA": formatDateStr(u.createdAt),
      }));
    } else if (type === "categories") {
      sheetName = "Danh_Muc_San_Pham";
      fileName = `shopdee_danh_muc_${new Date().toISOString().slice(0, 10)}.xlsx`;

      const categories = await Category.find({}).sort({ order: 1 }).lean();

      dataRows = categories.map((c, idx) => ({
        "STT": idx + 1,
        "MÃ DANH MỤC": String(c._id),
        "TÊN DANH MỤC": c.name,
        "SLUG URL": c.slug,
        "THỨ TỰ HIỂN THỊ": c.order || 0,
        "SỐ SẢN PHẨM": c.productCount || 0,
        "MÔ TẢ": c.description || "",
        "DANH MỤC CON": Array.isArray(c.subcategories) ? c.subcategories.join(", ") : "",
        "TRẠNG THÁI": c.isActive ? "Kích hoạt" : "Tắt",
        "NGÀY TẠO": formatDateStr(c.createdAt),
      }));
    } else if (type === "vouchers") {
      sheetName = "Ma_Giam_Gia";
      fileName = `shopdee_ma_giam_gia_${new Date().toISOString().slice(0, 10)}.xlsx`;

      const vouchers = await Voucher.find({}).sort({ createdAt: -1 }).lean();

      dataRows = vouchers.map((v, idx) => ({
        "STT": idx + 1,
        "MÃ VOUCHER": v.code,
        "TÊN CHƯƠNG TRÌNH": v.title,
        "LOẠI GIẢM GIÁ": v.discountType === "PERCENT" ? "Phần trăm (%)" : "Số tiền cố định (VNĐ)",
        "GIÁ TRỊ GIẢM": v.discountValue,
        "ĐƠN TỐI THIỂU (VNĐ)": v.minOrderValue || 0,
        "GIẢM TỐI ĐA (VNĐ)": v.maxDiscount || 0,
        "ĐÃ SỬ DỤNG": v.usedCount || 0,
        "GIỚI HẠN SỬ DỤNG": v.usageLimit || "Không giới hạn",
        "HẠN SỬ DỤNG": formatDateStr(v.endDate),
        "TRẠNG THÁI": v.isActive ? "Đang áp dụng" : "Ngừng áp dụng",
      }));
    } else if (type === "traffic" || type === "sources") {
      sheetName = "Nguon_Traffic_Nen_Tang";
      fileName = `shopdee_nguon_traffic_${new Date().toISOString().slice(0, 10)}.xlsx`;

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const sourcesData = await analyticsService.getTrafficSources(startDate, new Date());

      dataRows = (sourcesData.sources || []).map((s: any, idx: number) => ({
        "STT": idx + 1,
        "NỀN TẢNG / NGUỒN": s.source,
        "PHÂN LOẠI": s.category,
        "LƯỢT TRUY CẬP (VISITS)": s.visits,
        "SỐ PHIÊN (SESSIONS)": s.sessions,
        "KHÁCH DUY NHẤT (UNIQUE VISITORS)": s.uniqueVisitors,
        "TỶ LỆ ĐÓNG GÓP (%)": `${s.percentage}%`,
        "SỐ ĐƠN HÀNG PHÁT SINH": s.orders,
        "DOANH THU ĐÓNG GÓP (VNĐ)": s.revenue,
        "TỶ LỆ CHUYỂN ĐỔI (%)": `${s.conversionRate}%`,
      }));
    }

    if (dataRows.length === 0) {
      dataRows.push({ "THÔNG BÁO": "Không có dữ liệu trong khoảng thời gian đã chọn" });
    }

    // Create Excel Workbook with SheetJS
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(dataRows);

    // Auto-fit column widths so columns are clearly visible with zero truncation
    const colKeys = Object.keys(dataRows[0] || {});
    const colWidths = colKeys.map((key) => {
      let maxLen = key.length;
      for (const row of dataRows) {
        const valStr = row[key] !== undefined && row[key] !== null ? String(row[key]) : "";
        if (valStr.length > maxLen) {
          maxLen = Math.min(valStr.length, 60); // Cap at 60 chars
        }
      }
      return { wch: Math.max(maxLen + 4, 12) };
    });
    worksheet["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31));

    // Generate binary buffer
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Cache-Control": "no-store, no-cache",
      },
    });
  } catch (err: unknown) {
    console.error("Admin Excel export error:", err);
    return NextResponse.json({ success: false, error: { message: "Lỗi xuất file Excel." } }, { status: 500 });
  }
}
