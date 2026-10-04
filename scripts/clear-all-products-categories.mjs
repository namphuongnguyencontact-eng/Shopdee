import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shopdee";

async function clearData() {
  console.log("Connecting to:", MONGODB_URI);
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;

  const resProducts = await db.collection("products").deleteMany({});
  console.log(`Deleted ${resProducts.deletedCount} products.`);

  const resCategories = await db.collection("categories").deleteMany({});
  console.log(`Deleted ${resCategories.deletedCount} categories.`);

  const resReviews = await db.collection("reviews").deleteMany({});
  console.log(`Deleted ${resReviews.deletedCount} reviews.`);

  await db.collection("carts").deleteMany({});
  await db.collection("wishlists").deleteMany({});

  console.log("All categories, products, and associated reviews/carts have been completely cleared!");
  await mongoose.disconnect();
}

clearData().catch(console.error);
