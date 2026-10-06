import mongoose from "mongoose";

const MONGODB_URI = "mongodb+srv://fnamhaycuoi_db_user:syngucii@cluster0.rvh9uyc.mongodb.net/shopdee?retryWrites=true&w=majority&appName=Cluster0";

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const users = await mongoose.connection.collection("users").find({}).toArray();
  console.log("Total users:", users.length);
  users.forEach((u) => {
    console.log(`- User: ${u.username} (${u.name}), Role: ${u.role}, Source: ${u.acquisitionSource || "NONE"}`);
  });

  const totalSessions = await mongoose.connection.collection("trafficsessions").countDocuments({});
  console.log("Total traffic sessions:", totalSessions);

  const adminSessions = await mongoose.connection.collection("trafficsessions").countDocuments({
    $or: [{ isAdmin: true }, { currentPage: /^\/admin/ }, { landingPage: /^\/admin/ }]
  });
  console.log("Admin traffic sessions:", adminSessions);

  const totalEvents = await mongoose.connection.collection("analyticsevents").countDocuments({});
  console.log("Total analytics events:", totalEvents);

  const adminEvents = await mongoose.connection.collection("analyticsevents").countDocuments({
    $or: [{ isAdmin: true }, { path: /^\/admin/ }]
  });
  console.log("Admin analytics events:", adminEvents);

  const distinctIps = await mongoose.connection.collection("trafficsessions").distinct("ip");
  console.log("Distinct session IPs:", distinctIps);

  const distinctVisitors = await mongoose.connection.collection("trafficsessions").distinct("visitorId");
  console.log("Distinct visitorIds:", distinctVisitors.length);

  await mongoose.disconnect();
}

main().catch(console.error);
