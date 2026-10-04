import mongoose from "mongoose";

function makeSlug(text) {
  return text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d").replace(/Đ/g, "d")
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function seedProducts(db, categories) {
  console.log("Seeding Products (105+ items)...");
  const products = [];

  const catalogByCategory = {
    fashion: [
      { name: "Áo Baby Tee Y2K ShopDee Basic Ôm Body", price: 129000, orig: 199000, img: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600", flash: true, trend: true, variants: [{ name: "Màu sắc", options: ["Trắng Sữa", "Đen", "Hồng Pastel", "Xanh Baby"] }, { name: "Size", options: ["S", "M", "L"] }] },
      { name: "Áo Hoodie Oversize Unisex Form Rộng Nỉ Bông", price: 289000, orig: 390000, img: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600", flash: false, trend: true, variants: [{ name: "Màu", options: ["Xám Tiêu", "Đen", "Kem"] }, { name: "Size", options: ["M", "L", "XL"] }] },
      { name: "Quần Jeans Ống Suông Rộng Rách Gối Y2K", price: 320000, orig: 450000, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600", flash: false, trend: true, variants: [{ name: "Màu", options: ["Xanh Vintage", "Đen Khói"] }, { name: "Size", options: ["S", "M", "L", "XL"] }] },
      { name: "Giày Sneaker Chunky Trắng Đế Độn 5cm Siêu Nhẹ", price: 450000, orig: 650000, img: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600", flash: true, trend: true, variants: [{ name: "Size", options: ["36", "37", "38", "39", "40", "41"] }] },
      { name: "Túi Tote Canvas Đựng Vừa Laptop 15 inch", price: 119000, orig: 180000, img: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600", flash: false, trend: false, variants: [{ name: "Họa tiết", options: ["ShopDee Icon", "Chilling Club"] }] },
      { name: "Áo Sơ Mi Form Rộng Kẻ Caro Vintage Unisex", price: 189000, orig: 250000, img: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600", flash: false, trend: false },
      { name: "Chân Váy Chữ A Xếp Ly Kèm Quần Bảo Hộ", price: 165000, orig: 240000, img: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600", flash: true, trend: false },
      { name: "Áo Khoác Bomber Varsity Jacket Phối Tay Da", price: 399000, orig: 550000, img: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600", flash: false, trend: true },
      { name: "Quần Short Cargo Ống Rộng Túi Hộp Unisex", price: 179000, orig: 260000, img: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600", flash: false, trend: false },
      { name: "Mũ Lưỡi Trai Nón Kết Thêu Chữ ShopDee Aesthetic", price: 89000, orig: 139000, img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600", flash: true, trend: false },
      { name: "Áo Cardigan Len Dệt Kim Họa Tiết Tim Ngọt Ngào", price: 235000, orig: 320000, img: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=600", flash: false, trend: true },
      { name: "Quần Parachute Dù Ống Rộng Rút Dây Gấu Style Kpop", price: 210000, orig: 290000, img: "https://images.unsplash.com/photo-1517445312882-bc9910d016b7?w=600", flash: false, trend: false },
    ],
    beauty: [
      { name: "Son Tint Bóng Thuần Chay Dewy Glass Lip Gloss", price: 159000, orig: 220000, img: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600", flash: true, trend: true, variants: [{ name: "Tone màu", options: ["#01 Đỏ Cherry", "#02 Cam Đào", "#03 Hồng Trà Đất", "#04 Nâu Gỗ"] }] },
      { name: "Phấn Má Hồng Dạng Kem Thạch Jelly Blush Tự Nhiên", price: 139000, orig: 190000, img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600", flash: false, trend: true },
      { name: "Phấn Nước Cushion Căng Bóng Glow Kiềm Dầu 24h", price: 269000, orig: 380000, img: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600", flash: false, trend: true },
      { name: "Xịt Khóa Nền Makeup Setting Spray Cấp Ẩm Lâu Trôi", price: 119000, orig: 170000, img: "https://images.unsplash.com/photo-1608248597359-074092b31175?w=600", flash: true, trend: false },
      { name: "Bảng Phấn Mắt 9 Ô Tone Nâu Cam Đất Nhũ Lấp Lánh", price: 179000, orig: 250000, img: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600", flash: false, trend: false },
      { name: "Nước Hoa Mini 10ml Mùi Trà Trắng & Quả Mọng Tinh Tế", price: 145000, orig: 210000, img: "https://images.unsplash.com/photo-1547887537-6158d64c35b3?w=600", flash: true, trend: true },
      { name: "Gel Tẩy Da Chết Chiết Xuất Trái Đào Tươi Dịu Nhẹ", price: 99000, orig: 150000, img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600", flash: false, trend: false },
      { name: "Mặt Nạ Giấy Dưỡng Ẩm Cấp Nước Tức Thì Rau Má 10 Miếng", price: 89000, orig: 130000, img: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600", flash: false, trend: true },
      { name: "Kẹp Mi Lò Xo Góc Rộng Định Hình Mi Cong Vút Cả Ngày", price: 49000, orig: 79000, img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600", flash: true, trend: false },
      { name: "Mascara Chuốt Mi Dài Cong Không Lem Không Trôi 2 Đầu", price: 125000, orig: 180000, img: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600", flash: false, trend: false },
      { name: "Dầu Tẩy Trang Nhũ Hóa Hoa Cúc La Mã Dịu Nhẹ 150ml", price: 169000, orig: 230000, img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600", flash: false, trend: false },
      { name: "Serum Cấp Ẩm Phục Hồi Da Hyaluronic Acid B5", price: 219000, orig: 320000, img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600", flash: false, trend: true },
    ],
    tech: [
      { name: "Bàn Phím Cơ Không Dây Tri-Mode ShopDee87 Hot Swap Led RGB", price: 790000, orig: 1190000, img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600", flash: true, trend: true, variants: [{ name: "Switch", options: ["Linear Cream Yellow", "Tactile Brown", "Clicky Blue"] }] },
      { name: "Tai Nghe Chụp Tai Bluetooth Chống Ồn Chủ Động ANC Bass Trầm", price: 590000, orig: 890000, img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600", flash: true, trend: true },
      { name: "Chuột Không Dây Trong Suốt Bluetooth Ergonomic", price: 249000, orig: 360000, img: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600", flash: false, trend: true },
      { name: "Loa Bluetooth Mini Trong Suốt Led RGB Nhấp Nháy Theo Nhạc", price: 219000, orig: 320000, img: "https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600", flash: true, trend: false },
      { name: "Đế Sạc Không Dây 3 Trong 1 Nam Châm Hút Hít Từ Tính", price: 349000, orig: 490000, img: "https://images.unsplash.com/photo-1622445262464-84b1456045b6?w=600", flash: false, trend: false },
      { name: "Giá Đỡ Laptop Nhôm Nguyên Khối Tản Nhiệt Nâng Hạ Đa Năng", price: 185000, orig: 270000, img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600", flash: false, trend: false },
      { name: "Cáp Sạc Nhanh Dây Dù Siêu Bền Phát Sáng Đèn Led", price: 69000, orig: 110000, img: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600", flash: true, trend: false },
      { name: "Máy Chụp Ảnh Mini Kỹ Thuật Số Đi Phượt Tone Màu Phim Y2K", price: 499000, orig: 750000, img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600", flash: false, trend: true },
      { name: "Củ Sạc Nhanh GaN 65W 3 Cổng Type C Siêu Nhỏ Gọn", price: 330000, orig: 480000, img: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600", flash: false, trend: false },
      { name: "Đèn Kẹp Màn Hình Chống Mỏi Mắt Cảm Ứng 3 Chế Độ Sáng", price: 289000, orig: 420000, img: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600", flash: false, trend: false },
      { name: "Pin Sạc Dự Phòng Trong Suốt 20000mAh Sạc Siêu Nhanh 22.5W", price: 369000, orig: 520000, img: "https://images.unsplash.com/photo-1609592424367-15d9a9ef224c?w=600", flash: true, trend: true },
      { name: "Hub Chuyển Đổi Type-C 6 Trong 1 Cho Macbook Laptop", price: 245000, orig: 350000, img: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600", flash: false, trend: false },
    ],
    gaming: [
      { name: "Tay Cầm Chơi Game Không Dây Rung Kép Hall Effect", price: 399000, orig: 590000, img: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=600", flash: true, trend: true },
      { name: "Tấm Lót Chuột Cỡ Lớn 900x400mm Bo Viền Chống Nước Sóng Lớn", price: 99000, orig: 160000, img: "https://images.unsplash.com/photo-1612287233207-6f81c9a63321?w=600", flash: false, trend: true },
      { name: "Giá Treo Tai Nghe Gaming Tích Hợp Led RGB Có Cổng USB", price: 149000, orig: 220000, img: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600", flash: false, trend: false },
      { name: "Dây Led Silicon Neon Dán Góc Bàn RGB Đổi Màu Theo Nhạc", price: 179000, orig: 270000, img: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600", flash: true, trend: true },
      { name: "Gối Tựa Đầu Công Thái Học Bọc Lưới Thoáng Khí Cho Ghế Gaming", price: 119000, orig: 180000, img: "https://images.unsplash.com/photo-1580481077198-251f92e850e0?w=600", flash: false, trend: false },
      { name: "Quạt Tản Nhiệt Điện Thoại Sò Lạnh Giảm 20 Độ Trong 10s", price: 169000, orig: 240000, img: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600", flash: true, trend: false },
      { name: "Bao Ngón Tay Chơi Game Co Giãn Chống Mồ Hôi Cảm Ứng Nhạy", price: 29000, orig: 49000, img: "https://images.unsplash.com/photo-1580481077198-251f92e850e0?w=600", flash: false, trend: false },
      { name: "Mô Hình Nhân Vật Anime Chibi Đặt Case Máy Tính Trang Trí", price: 89000, orig: 135000, img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600", flash: false, trend: true },
      { name: "Kẹp Giữ Dây Chuột Bungee Chống Vướng Chuột Cơ Bản", price: 65000, orig: 99000, img: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600", flash: false, trend: false },
      { name: "Bàn Phím Số Numpad Rời Cơ Học Không Dây Gõ Số Nhanh", price: 259000, orig: 370000, img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600", flash: false, trend: false },
    ],
    "room-decor": [
      { name: "Đèn Hoàng Hôn Sunset Lamp 16 Màu Kèm Remote & App", price: 169000, orig: 250000, img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600", flash: true, trend: true },
      { name: "Nến Thơm Cao Cấp Sáp Đậu Nành Gỗ Thông & Cam Ngọt", price: 189000, orig: 270000, img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600", flash: false, trend: true },
      { name: "Đồng Hồ Led Điện Tử Để Bàn Cảm Ứng Vỗ Tay Sáng Đèn", price: 119000, orig: 180000, img: "https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600", flash: false, trend: false },
      { name: "Thảm Trải Sàn Lông Cừu Nhân Tạo Hình Bông Hoa Cúc Cười", price: 149000, orig: 220000, img: "https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=600", flash: true, trend: true },
      { name: "Tranh Vải Treo Tường Phong Cách Nhật Bản Chill Sống Ảo", price: 85000, orig: 130000, img: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600", flash: false, trend: false },
      { name: "Đèn Led Phi Hành Gia Chiếu Dải Ngân Hà Sao Băng Xoay 360", price: 299000, orig: 450000, img: "https://images.unsplash.com/photo-1507499739999-097706ad8914?w=600", flash: false, trend: true },
      { name: "Gương Soi Toàn Thân Uốn Lượn Bọc Nhung Wavy Mirror", price: 420000, orig: 620000, img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600", flash: false, trend: true },
      { name: "Bình Hoa Gốm Sứ Bắc Âu Trắng Nhám Tối Giản Độc Bản", price: 139000, orig: 200000, img: "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600", flash: false, trend: false },
      { name: "Đèn Ngủ Silicon Hình Chú Vịt Lười Nằm Ngả Lưng Cảm Ứng", price: 129000, orig: 190000, img: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600", flash: true, trend: false },
      { name: "Cây Xanh Mini Để Bàn Lọc Không Khí Tặng Chậu Gốm Xinh", price: 69000, orig: 100000, img: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600", flash: false, trend: false },
    ],
    "cute-stuff": [
      { name: "Hộp Mù Blind Box Baby Three Lucky ShopDee Giới Hạn", price: 199000, orig: 280000, img: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600", flash: true, trend: true },
      { name: "Gấu Bông Capybara Rút Mũi Nước Siêu Cấp Đáng Yêu 40cm", price: 169000, orig: 240000, img: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600", flash: false, trend: true },
      { name: "Hộp Mù Skullpanda Image Of Reality Siêu Nghệ Thuật", price: 249000, orig: 350000, img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600", flash: false, trend: true },
      { name: "Móc Khóa Bơ Béo Silicon Kèm Dây Đeo Cổ Tay", price: 39000, orig: 65000, img: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600", flash: true, trend: false },
      { name: "Squishy Bánh Bao Xửng Hấp Bóp Giảm Căng Thẳng Mềm Mịn", price: 45000, orig: 70000, img: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600", flash: false, trend: false },
      { name: "Gối Ôm Mèo Hoàng Thượng Dài 90cm Siêu Mềm Mịn", price: 189000, orig: 270000, img: "https://images.unsplash.com/photo-1559454403-b8fb88521f11?w=600", flash: false, trend: false },
      { name: "Bộ 5 Bút Gel Bấm Mực Đen Ngòi 0.5mm Họa Tiết Gấu Dâu", price: 35000, orig: 55000, img: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600", flash: true, trend: false },
      { name: "Túi Đựng Mỹ Phẩm Trong Suốt Hình Thỏ Béo Pastel", price: 59000, orig: 89000, img: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600", flash: false, trend: false },
      { name: "Băng Dính Washi Tape Trang Trí Sổ Tay 10 Cuộn Đa Sắc", price: 49000, orig: 75000, img: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=600", flash: false, trend: false },
      { name: "Búp Bê Nhồi Bông Chú Ếch Xanh Buồn Pepe The Frog", price: 115000, orig: 160000, img: "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600", flash: false, trend: true },
    ],
    accessories: [
      { name: "Vòng Cổ Choker Bạc Đính Mặt Trăng Y2K Cá Tính", price: 89000, orig: 130000, img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600", flash: true, trend: true },
      { name: "Kính Mát Chống UV Mắt Mèo Phong Cách Cyberpunk", price: 119000, orig: 170000, img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600", flash: false, trend: true },
      { name: "Set 5 Nhẫn Kim Loại Vintage Retro Không Gỉ Đa Kích Cỡ", price: 65000, orig: 99000, img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600", flash: true, trend: false },
      { name: "Vòng Tay Chuỗi Hạt Cườm Thủ Công Mix Charm May Mắn", price: 49000, orig: 79000, img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600", flash: false, trend: false },
      { name: "Kẹp Tóc Càng Cua Kim Loại Hình Bướm Ánh Bạc Tinh Tế", price: 35000, orig: 55000, img: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600", flash: false, trend: false },
      { name: "Khuyên Tai Bạc Ý 925 Dáng Dài Hình Ngôi Sao Lấp Lánh", price: 79000, orig: 120000, img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600", flash: true, trend: true },
      { name: "Dây Xích Quần Jean Hiphop Phong Cách Punk Rock", price: 55000, orig: 85000, img: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600", flash: false, trend: false },
      { name: "Khăn Bandana Họa Tiết Paisley Buộc Tóc Phối Đồ Đa Năng", price: 29000, orig: 45000, img: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600", flash: false, trend: false },
      { name: "Ví Đựng Thẻ Mini Da PU Khóa Kéo Nhỏ Gọn Bỏ Túi Quần", price: 69000, orig: 105000, img: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600", flash: false, trend: false },
      { name: "Thắt Lưng Da Khóa Kim Loại Vuông Basic Phối Váy Quần", price: 75000, orig: 110000, img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600", flash: false, trend: false },
    ],
    lifestyle: [
      { name: "Bình Giữ Nhiệt Khắc Tên Phong Cách Hàn Quốc Inox 316 600ml", price: 219000, orig: 310000, img: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600", flash: true, trend: true },
      { name: "Sổ Tay Bullet Journal Bìa Da Còng 6 Lỗ Pastel Giấy Dày", price: 95000, orig: 140000, img: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600", flash: false, trend: false },
      { name: "Quạt Mini Cầm Tay Tích Điện Pin 4000mAh Có Màn Hình Led", price: 129000, orig: 180000, img: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600", flash: true, trend: true },
      { name: "Ly Thủy Tinh 2 Lớp Chịu Nhiệt Có Quai Cầm Kèm Ống Hút", price: 85000, orig: 125000, img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600", flash: false, trend: false },
      { name: "Gối Cổ Chữ U Bọt Biển Nhớ Hình Định Hình Du Lịch", price: 119000, orig: 170000, img: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=600", flash: false, trend: false },
      { name: "Ô Dù Che Nắng Mưa Gấp Gọn Tự Động Phủ Lớp Vinyl Chống Tia UV", price: 139000, orig: 200000, img: "https://images.unsplash.com/photo-1534353436294-0dbd4bdac845?w=600", flash: true, trend: false },
      { name: "Bộ Bút Highlight Pastel 6 Màu Dạ Quang Dịu Mắt Không Lem", price: 42000, orig: 65000, img: "https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600", flash: false, trend: false },
      { name: "Túi Giữ Nhiệt Cơm Trưa Đựng Hộp Thủy Tinh Chống Thấm", price: 69000, orig: 100000, img: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=600", flash: false, trend: false },
      { name: "Máy Phun Sương Tạo Độ Ẩm Mini Hình Mèo Cute Cổng USB", price: 99000, orig: 150000, img: "https://images.unsplash.com/photo-1507499739999-097706ad8914?w=600", flash: false, trend: true },
      { name: "Bàn Học Gấp Gọn Để Giường Có Khe Cắm Ipad Cốc Nước", price: 115000, orig: 170000, img: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600", flash: false, trend: false },
    ],
    food: [
      { name: "Combo 5 Gói Kẹo Dẻo Bóc Vỏ Vị Xoài & Nho Xanh Tươi", price: 75000, orig: 110000, img: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=600", flash: true, trend: true },
      { name: "Hộp Bánh Que Chấm Sốt Socola & Hạt Phỉ Giòn Rụm", price: 35000, orig: 50000, img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=600", flash: false, trend: true },
      { name: "Snack Khoai Tây Cay Nồng Vị Sườn Bò Nướng BBQ Giòn Rụm", price: 25000, orig: 35000, img: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600", flash: false, trend: false },
      { name: "Trà Trái Cây Đóng Chai Vị Đào Chanh Dây Mát Lạnh 450ml", price: 29000, orig: 40000, img: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600", flash: true, trend: false },
      { name: "Kẹo Dẻo Vitamin C Chiết Xuất Nước Ép Cam Chua Ngọt", price: 45000, orig: 65000, img: "https://images.unsplash.com/photo-1582058091505-f87a2e55a40f?w=600", flash: false, trend: false },
      { name: "Bánh Quy Bơ Phô Mai Nướng Giòn Tan Hộp Thiếc Vintage", price: 69000, orig: 99000, img: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=600", flash: false, trend: true },
      { name: "Trà Sữa Trân Châu Đường Đen Đóng Lon Tự Pha Cực Nhanh", price: 38000, orig: 55000, img: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=600", flash: false, trend: true },
      { name: "Rong Biển Sấy Giòn Tẩm Mè Cay Hàn Quốc Ăn Vặt", price: 32000, orig: 48000, img: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=600", flash: true, trend: false },
      { name: "Hạt Điều Rang Muối Vỏ Lụa Loại 1 Giòn Béo Hũ 250g", price: 89000, orig: 130000, img: "https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=600", flash: false, trend: false },
      { name: "Socola Tươi Nama Vị Trà Xanh Tan Chảy Trong Miệng", price: 119000, orig: 170000, img: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600", flash: false, trend: false },
    ],
    gift: [
      { name: "Hộp Quà Bất Ngờ Tự Thưởng Cuối Tuần ShopDee Mystery Box", price: 299000, orig: 500000, img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600", flash: true, trend: true },
      { name: "Set Quà Sinh Nhật Tinh Tế Kèm Thiệp Viết Tay Ý Nghĩa", price: 349000, orig: 480000, img: "https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600", flash: false, trend: true },
      { name: "Hộp Quà Thơm Nức Gồm Nến Thơm & Tinh Dầu Khuếch Tán", price: 259000, orig: 380000, img: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600", flash: false, trend: false },
      { name: "Bó Hoa Len Thủ Công Đan Tay Lưu Niệm Vĩnh Cửu", price: 149000, orig: 220000, img: "https://images.unsplash.com/photo-1561181286-d3fee7d55364?w=600", flash: true, trend: true },
      { name: "Set Quà Self-Love Dành Riêng Cho Bạn Nữ Năng Động", price: 389000, orig: 550000, img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600", flash: false, trend: false },
      { name: "Hộp Bánh Macaron 6 Vị Kiểu Pháp Sang Trọng Làm Quà", price: 165000, orig: 240000, img: "https://images.unsplash.com/photo-1569864321390-aca47796d8b9?w=600", flash: false, trend: false },
      { name: "Khung Ảnh Gỗ Tự Làm Kèm Đèn Nhấp Nháy Lưu Kỷ Niệm", price: 95000, orig: 140000, img: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=600", flash: false, trend: false },
      { name: "Hộp Quà May Mắn ShopDee Lucky Bag Khám Phá Quà Ảo", price: 199000, orig: 350000, img: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600", flash: true, trend: true },
      { name: "Cốc Sứ Quà Tặng Nắp Vương Miện Hoàng Tử / Công Chúa", price: 89000, orig: 130000, img: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600", flash: false, trend: false },
      { name: "Set Dây Đeo Điện Thoại Hạt Pha Lê Tự Làm DIY Độc Bản", price: 79000, orig: 115000, img: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600", flash: false, trend: false },
    ],
  };

  let globalIndex = 0;
  for (const cat of categories) {
    const items = catalogByCategory[cat.slug] || [];
    for (let j = 0; j < items.length; j++) {
      globalIndex++;
      const it = items[j];
      const slug = makeSlug(it.name);
      const discount = Math.round(((it.orig - it.price) / it.orig) * 100);
      const sold = 150 + globalIndex * 27;

      const lower = it.name.toLowerCase();
      let shortDesc = `${it.name} chính hãng chất lượng cao, thiết kế đón đầu xu hướng thời trang và công nghệ.`;
      let fullDesc = `${it.name} là sản phẩm cao cấp được đông đảo khách hàng tin dùng tại Shopdee. Từng chi tiết đều được hoàn thiện tinh xảo từ chất liệu chọn lọc, mang lại sự tiện nghi, độ bền tối ưu và phong cách cá tính cho người sở hữu.`;
      let specList = [
        { label: "Thương hiệu", value: "SHOPDEE STUDIO" },
        { label: "Xuất xứ", value: "Việt Nam / Chính Hãng" },
        { label: "Tình trạng", value: "Mới 100% Nguyên Hộp" },
        { label: "Bảo hành", value: "12 Tháng Đổi Mới" },
      ];

      if (cat.slug === "fashion") {
        shortDesc = `Chất liệu cotton cao cấp co giãn 4 chiều thoáng mát, form tôn dáng hiện đại, đường may chuẩn chỉ.`;
        fullDesc = `${it.name} sở hữu form dáng chuẩn thời trang năng động. Chất liệu vải được xử lý công nghệ chống bai xù, thấm hút mồ hôi tối đa và giữ màu lâu sau nhiều lần giặt. Dễ dàng mix & match cùng nhiều phong cách khác nhau từ streetwear đến thường ngày.`;
        specList = [
          { label: "Chất liệu", value: "Cotton 100% thoáng mát" },
          { label: "Kiểu dáng", value: "Form rộng / ôm tôn dáng chuẩn Gen Z" },
          { label: "Xuất xứ", value: "Thiết kế & sản xuất tại Việt Nam" },
          { label: "Bảo hành", value: "Đổi size miễn phí trong 15 ngày" },
        ];
      } else if (cat.slug === "beauty") {
        shortDesc = `Thành phần lành tính an toàn cho mọi loại da, duy trì độ ẩm và hiệu ứng căng bóng tự nhiên suốt 24h.`;
        fullDesc = `${it.name} mang lại giải pháp chăm sóc sắc đẹp toàn diện và an toàn. Công thức chiết xuất thiên nhiên dịu nhẹ thẩm thấu nhanh, không gây nhờn rít hay bí da. Giúp bạn luôn tự tin tỏa sáng rạng ngời mọi khoảnh khắc.`;
        specList = [
          { label: "Loại da phù hợp", value: "Mọi loại da, kể cả da nhạy cảm" },
          { label: "Hạn sử dụng", value: "36 tháng kể từ ngày sản xuất" },
          { label: "Dung tích", value: "Tiêu chuẩn Full Size chính hãng" },
          { label: "Xuất xứ", value: "Nhập khẩu chính ngạch có tem phụ" },
        ];
      } else if (cat.slug === "tech" || cat.slug === "gaming") {
        shortDesc = `Công nghệ vi xử lý thế hệ mới, kết nối không dây Bluetooth 5.3 siêu nhạy, thời lượng pin bền bỉ.`;
        fullDesc = `${it.name} được trang bị chipset hiện đại mang lại hiệu năng cao và độ trễ gần như bằng 0. Thiết kế công thái học cao cấp giúp thao tác thoải mái trong nhiều giờ làm việc và giải trí liên tục. Tương thích hoàn hảo mọi hệ điều hành.`;
        specList = [
          { label: "Kết nối", value: "Bluetooth 5.3 & Wireless 2.4GHz & Type-C" },
          { label: "Thời lượng pin", value: "Lên đến 35 giờ liên tục" },
          { label: "Bảo hành", value: "12 Tháng Chính Hãng Đổi Mới 1-1" },
          { label: "Tương thích", value: "Windows, MacOS, Android, iOS" },
        ];
      } else if (cat.slug === "room-decor") {
        shortDesc = `Phong cách tối giản Bắc Âu hiện đại, tạo không gian sống chill ấm cúng và ngập tràn cảm hứng.`;
        fullDesc = `${it.name} là điểm nhấn nghệ thuật độc đáo cho góc phòng ngủ hoặc bàn làm việc của bạn. Ánh sáng hoặc chất liệu tinh tế mang lại cảm giác thư thái sau một ngày dài bận rộn. Món quà tặng ý nghĩa dành cho người thân thương.`;
        specList = [
          { label: "Phong cách", value: "Nordic / Minimalism hiện đại" },
          { label: "Chất liệu", value: "Gốm sứ / Kim loại chống gỉ / Silicon cao cấp" },
          { label: "Bảo hành", value: "12 Tháng đổi trả an tâm" },
        ];
      }

      const descHtml = `
<h2>Đặc điểm nổi bật của ${it.name}</h2>
<p>${fullDesc}</p>

<h3>Ưu điểm & Tính năng vượt trội</h3>
<ul>
  <li>Thiết kế đón đầu xu hướng thời trang và công nghệ mới nhất.</li>
  <li>Chất liệu chọn lọc kỹ lưỡng, độ bền vượt trội theo thời gian.</li>
  <li>Đầy đủ phụ kiện và tem mác niêm phong chính hãng.</li>
  <li>Dễ dàng sử dụng và bảo quản tiện lợi.</li>
</ul>

<h3>Chính sách bán hàng Shopdee</h3>
<ul>
  <li>Cam kết 100% sản phẩm đúng mô tả và hình ảnh thực tế.</li>
  <li>Đổi mới miễn phí trong vòng 15 ngày nếu phát sinh lỗi từ nhà sản xuất.</li>
  <li>Hỗ trợ đồng kiểm khi nhận hàng trên toàn quốc.</li>
  <li>Bảo hành chính hãng 12 tháng uy tín.</li>
</ul>
`.trim();

      const galleryImgs = [
        { url: it.img, alt: `${it.name} - Ảnh chính`, sortOrder: 0, isPrimary: true },
        { url: it.img, alt: `${it.name} - Góc nghiêng`, sortOrder: 1, isPrimary: false },
        { url: it.img, alt: `${it.name} - Chi tiết sản phẩm`, sortOrder: 2, isPrimary: false },
      ];

      products.push({
        _id: new mongoose.Types.ObjectId(),
        name: it.name,
        slug,
        description: fullDesc,
        shortDescription: shortDesc,
        descriptionHtml: descHtml,
        brand: "SHOPDEE STUDIO",
        categoryId: cat._id,
        categorySlug: cat.slug,
        categoryName: cat.name,
        images: [it.img, it.img, it.img],
        galleryImages: galleryImgs,
        price: it.price,
        originalPrice: it.orig,
        discountPercent: discount,
        variants: it.variants || [{ name: "Phân loại", options: ["Bản Tiêu Chuẩn", "Bản Cao Cấp (+20k)"] }],
        ratingAverage: +(4.6 + (globalIndex % 4) * 0.1).toFixed(1),
        reviewCount: Math.floor(sold * 0.15),
        soldCount: sold,
        stock: 500,
        tags: ["shopdee", "genz", cat.slug],
        specifications: specList,
        isFeatured: globalIndex % 3 === 0,
        isTrending: !!it.trend,
        isFlashSale: !!it.flash,
        flashSalePrice: it.flash ? Math.round(it.price * 0.8) : undefined,
        status: "active",
        viewCount: sold * 4 + 100,
        likeCount: Math.floor(sold * 0.6),
        cartAddCount: Math.floor(sold * 0.8),
        shareCount: Math.floor(sold * 0.15),
        trendScore: 70 + (globalIndex % 30),
        createdAt: new Date(Date.now() - globalIndex * 3600000 * 12),
        updatedAt: new Date(),
      });
    }
  }

  await db.collection("products").insertMany(products);
  console.log(`Seeded ${products.length} products across all categories.`);
  return products;
}
