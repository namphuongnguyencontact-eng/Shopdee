import mongoose from "mongoose";
import { seedUsers } from "./seed-users.mjs";
import { seedCategories } from "./seed-categories.mjs";
import { seedProducts } from "./seed-products.mjs";
import { seedGamification } from "./seed-gamification.mjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shopdee";

async function runSeed() {
  console.log("Connecting to MongoDB for seeding:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  console.log("Connected successfully to MongoDB.");

  const db = mongoose.connection.db;

  // Clear existing collections
  const collections = await db.listCollections().toArray();
  for (const c of collections) {
    if (!c.name.startsWith("system.")) {
      console.log(`Clearing collection: ${c.name}`);
      await db.collection(c.name).deleteMany({});
    }
  }

  // 1. Seed users
  const { adminUser, demoUser, otherUsers } = await seedUsers(db);

  // 2. Seed categories
  const categories = await seedCategories(db);

  // 3. Seed products (105+ products across 10 categories)
  const products = await seedProducts(db, categories);

  // 4. Seed vouchers, badges, challenges, notifications
  await seedGamification(db, demoUser, otherUsers);

  // 5. Seed sample reviews
  console.log("Seeding Reviews...");
  const reviewsData = [
    {
      productId: products[0]._id,
      userId: demoUser._id,
      userName: demoUser.name,
      userAvatar: demoUser.avatar,
      rating: 5,
      comment: "Áo baby tee mặc tôn eo cực kỳ luôn á! Vải thun cotton mịn không xù lông. Đặt mua mô phỏng mà cảm giác sướng rơn người haha ✨",
      variantName: "Trắng Sữa / M",
      status: "approved",
      createdAt: new Date(Date.now() - 86400000),
      updatedAt: new Date(),
    },
    {
      productId: products[0]._id,
      userId: otherUsers[0]._id,
      userName: otherUsers[0].name,
      userAvatar: otherUsers[0].avatar,
      rating: 5,
      comment: "Đồ đẹp xỉu up xỉu down, giao đơn ảo chỉ 1 giây là xong. Đã khoe đơn lên story bạn bè hỏi xin link quá trời!",
      variantName: "Hồng Pastel / S",
      status: "approved",
      createdAt: new Date(Date.now() - 172800000),
      updatedAt: new Date(),
    },
    {
      productId: products[15]._id,
      userId: otherUsers[1]._id,
      userName: otherUsers[1].name,
      userAvatar: otherUsers[1].avatar,
      rating: 5,
      comment: "Chất son căng bóng tráng gương siêu mê! Mua thử mà ngắm hoài không chán.",
      variantName: "#01 Đỏ Cherry",
      status: "approved",
      createdAt: new Date(Date.now() - 86400000 * 3),
      updatedAt: new Date(),
    },
    {
      productId: products[25]._id,
      userId: otherUsers[2]._id,
      userName: otherUsers[2].name,
      userAvatar: otherUsers[2].avatar,
      rating: 5,
      comment: "Bàn phím cơ gõ đầm tay cực kỳ. Led RGB đổi màu theo nhạc ảo diệu vô cùng!",
      variantName: "Linear Cream Yellow",
      status: "approved",
      createdAt: new Date(Date.now() - 86400000 * 2),
      updatedAt: new Date(),
    },
  ];
  await db.collection("reviews").insertMany(reviewsData);
  console.log(`Seeded ${reviewsData.length} reviews.`);

  // 6. Seed sample order for demo user
  console.log("Seeding Sample Order...");
  const demoOrder = {
    orderNumber: "VN829314",
    userId: demoUser._id,
    items: [
      {
        productId: products[0]._id,
        name: products[0].name,
        slug: products[0].slug,
        image: products[0].images[0],
        price: products[0].price,
        quantity: 1,
        variantName: "Trắng Sữa / M",
      },
      {
        productId: products[15]._id,
        name: products[15].name,
        slug: products[15].slug,
        image: products[15].images[0],
        price: products[15].price,
        quantity: 1,
        variantName: "#01 Đỏ Cherry",
      },
    ],
    shippingAddress: {
      fullName: demoUser.name,
      phone: "0901234567",
      city: "TP. Hồ Chí Minh (Mô phỏng)",
      district: "Quận 1",
      address: "88 Đường Nguyễn Huệ, Phường Bến Nghé",
      isSimulated: true,
    },
    subtotal: products[0].price + products[15].price,
    discount: 50000,
    shippingFee: 0,
    total: products[0].price + products[15].price - 50000,
    voucherCode: "GENZ50",
    paymentMethod: "WALLET",
    paymentStatus: "COMPLETED",
    orderStatus: "COMPLETED",
    isSimulation: true,
    timeline: [
      {
        status: "PLACED",
        title: "Đặt hàng thành công",
        description: "Đơn hàng trải nghiệm ảo #VN829314 đã được tiếp nhận.",
        timestamp: new Date(Date.now() - 86400000 * 2),
      },
      {
        status: "CONFIRMED",
        title: "Thanh toán mô phỏng thành công",
        description: "Hệ thống đã trừ số dư Ví Ảo SHOPDEE WALLET an toàn.",
        timestamp: new Date(Date.now() - 86400000 * 2 + 1000 * 60 * 2),
      },
      {
        status: "PREPARING",
        title: "Đang chuẩn bị trải nghiệm",
        description: "SHOPDEE đang gói trọn niềm vui cho đơn hàng của bạn.",
        timestamp: new Date(Date.now() - 86400000 * 2 + 1000 * 60 * 15),
      },
      {
        status: "COMPLETED",
        title: "Hoàn tất trải nghiệm mua sắm",
        description: "Bạn đã nhận trọn vẹn cảm giác mua được món đồ yêu thích!",
        timestamp: new Date(Date.now() - 86400000),
      },
    ],
    createdAt: new Date(Date.now() - 86400000 * 2),
    updatedAt: new Date(Date.now() - 86400000),
  };

  const insertedOrder = await db.collection("orders").insertOne(demoOrder);

  // 7. Seed shared order
  await db.collection("sharedorders").insertOne({
    shareId: "shopdee-happy-chau",
    userId: demoUser._id,
    userName: demoUser.name,
    userAvatar: demoUser.avatar,
    orderNumber: demoOrder.orderNumber,
    orderId: insertedOrder.insertedId,
    itemCount: 2,
    totalAmount: demoOrder.total,
    showPrice: true,
    quote: "Tự thưởng cho bản thân một chút hôm nay ✨",
    template: "modern",
    background: "bg-gradient-to-tr from-blue-600 to-indigo-800",
    products: demoOrder.items.map((it) => ({
      name: it.name,
      image: it.image,
      price: it.price,
    })),
    viewsCount: 42,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // 8. Seed analytics events
  const eventTypes = [
    ...Array(150).fill("product_view"),
    ...Array(80).fill("add_to_cart"),
    ...Array(45).fill("checkout_start"),
    ...Array(30).fill("order_created"),
    ...Array(20).fill("share_order"),
  ];

  const sampleEvents = eventTypes.map((type, idx) => ({
    userId: idx % 3 === 0 ? demoUser._id : (idx % 2 === 0 ? otherUsers[0]._id : undefined),
    sessionId: `sess_${Math.random().toString(36).substring(2, 9)}`,
    eventType: type,
    productId: products[idx % products.length]._id,
    categoryId: products[idx % products.length].categoryId,
    metadata: { source: "seed" },
    device: idx % 2 === 0 ? "mobile" : "desktop",
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 7 * 86400000)),
  }));
  await db.collection("analyticsevents").insertMany(sampleEvents);

  console.log("\n========================================================");
  console.log("✅ SEED HOÀN TẤT THÀNH CÔNG RỰC RỠ!");
  console.log("========================================================");
  console.log("Admin Account: admin@shopdee.local / ChangeMe123!");
  console.log("Demo User:     user@shopdee.local  / User123!");
  console.log(`Số lượng Categories: ${categories.length}`);
  console.log(`Số lượng Products:   ${products.length}`);
  console.log("========================================================\n");

  await mongoose.disconnect();
}

runSeed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
