import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://fnamhaycuoi_db_user:syngucii@cluster0.rvh9uyc.mongodb.net/shopdee?retryWrites=true&w=majority&appName=Cluster0";

async function main() {
  await mongoose.connect(MONGODB_URI);
  const users = await mongoose.connection.collection("users").find({}).toArray();
  for (const u of users) {
    const session = await mongoose.connection.collection("trafficsessions").findOne({ userId: u._id });
    const order = await mongoose.connection.collection("orders").findOne({ userId: u._id });
    console.log(`User ${u.username}: session source=${session?.source}, order source=${order?.analyticsAttribution?.lastTouchSource}`);
  }
  await mongoose.disconnect();
}

main().catch(console.error);
