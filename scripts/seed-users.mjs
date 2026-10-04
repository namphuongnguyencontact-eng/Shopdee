import bcrypt from "bcryptjs";
import mongoose from "mongoose";

export async function seedUsers(db) {
  console.log("Seeding Users...");
  const adminPassHash = await bcrypt.hash("ChangeMe123!", 10);
  const userPassHash = await bcrypt.hash("User123!", 10);
  const generalPassHash = await bcrypt.hash("Pass1234!", 10);

  const adminUser = {
    _id: new mongoose.Types.ObjectId(),
    name: "Admin ShopDee Master",
    username: "admin",
    email: "admin@shopdee.local",
    passwordHash: adminPassHash,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    role: "admin",
    level: 8,
    xp: 7200,
    walletBalance: 10000000,
    favoriteCategories: ["tech", "fashion", "gaming"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const demoUser = {
    _id: new mongoose.Types.ObjectId(),
    name: "Nguyễn Minh Châu (GenZ)",
    username: "chaushopdee",
    email: "user@shopdee.local",
    passwordHash: userPassHash,
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200",
    role: "user",
    level: 3,
    xp: 850,
    walletBalance: 5000000,
    favoriteCategories: ["fashion", "beauty", "cute-stuff"],
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const sampleNames = [
    ["Lê Bảo Nam", "namle", "namle@gmail.com"],
    ["Trần Khánh Vy", "khanhvy", "vy.tran@gmail.com"],
    ["Đặng Hoàng Long", "longdang", "long.dang@gmail.com"],
    ["Phạm Thu Thảo", "thaopham", "thao.p@gmail.com"],
    ["Vũ Đức Duy", "duyvu", "duy.vu@gmail.com"],
    ["Hoàng Mai Linh", "linhmai", "linh.m@gmail.com"],
    ["Bùi Gia Hưng", "hungbg", "hung.bui@gmail.com"],
    ["Đỗ Phương Anh", "phuonganhecom", "anh.do@gmail.com"],
    ["Ngô Tuấn Kiệt", "kietngo", "kiet.ngo@gmail.com"],
    ["Dương Mỹ Duyên", "duyenduong", "duyen.d@gmail.com"],
    ["Nguyễn Trọng Hiếu", "hieunguyen", "hieu.ng@gmail.com"],
    ["Lê Thị Ngọc Ánh", "ngocanh", "anh.le@gmail.com"],
    ["Võ Minh Triết", "trietvo", "triet.vo@gmail.com"],
    ["Phan Thanh Hà", "thanhha", "ha.phan@gmail.com"],
    ["Trịnh Quốc Bảo", "quocbao", "bao.trinh@gmail.com"],
    ["Đoàn Quỳnh Nga", "quynhnga", "nga.doan@gmail.com"],
    ["Lâm Hải Đăng", "haidang", "dang.lam@gmail.com"],
    ["Mai Thảo My", "thaomy", "my.mai@gmail.com"],
    ["Tạ Đức Anh", "ducanhta", "anh.ta@gmail.com"],
    ["Cao Thùy Trang", "thuytrang", "trang.cao@gmail.com"],
    ["Hồ Vĩnh Phúc", "vinhphuc", "phuc.ho@gmail.com"],
    ["Lý Gia Mẫn", "giaman", "man.ly@gmail.com"],
    ["Trương Thảo Nhi", "thaonhi", "nhi.truong@gmail.com"],
    ["Châu Khải Phong", "khaiphong", "phong.chau@gmail.com"],
    ["Vương Gia Linh", "gialinh", "linh.vuong@gmail.com"],
    ["Hà My Duyên", "myduyen", "duyen.ha@gmail.com"],
    ["Lương Minh Trí", "minhtri", "tri.luong@gmail.com"],
    ["Tô Cẩm Nhung", "camnhung", "nhung.to@gmail.com"],
    ["Đinh Tiến Đạt", "tiendat", "dat.dinh@gmail.com"],
    ["Chu Bích Phương", "bichphuong", "phuong.chu@gmail.com"],
  ];

  const sampleAvatars = [
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200",
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200",
    "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200",
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200",
    "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200",
    "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=200",
  ];

  const otherUsers = sampleNames.map(([name, username, email], idx) => ({
    _id: new mongoose.Types.ObjectId(),
    name,
    username,
    email,
    passwordHash: generalPassHash,
    avatar: sampleAvatars[idx % sampleAvatars.length],
    role: "user",
    level: Math.floor(Math.random() * 8) + 1,
    xp: Math.floor(Math.random() * 3500) + 100,
    walletBalance: Math.floor(Math.random() * 8000000) + 1000000,
    favoriteCategories: ["fashion", "tech", "beauty", "gaming"].slice(0, 2 + (idx % 2)),
    isActive: true,
    createdAt: new Date(Date.now() - idx * 86400000 * 2),
    updatedAt: new Date(),
  }));

  const allUsers = [adminUser, demoUser, ...otherUsers];
  await db.collection("users").insertMany(allUsers);
  console.log(`Seeded ${allUsers.length} users.`);
  return { adminUser, demoUser, otherUsers };
}
