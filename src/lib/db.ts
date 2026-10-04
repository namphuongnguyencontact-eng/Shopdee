import mongoose from "mongoose";

let rawUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/shopdee";
if (rawUri.includes("/vibeshop")) {
  rawUri = rawUri.replace("/vibeshop", "/shopdee");
}
const MONGODB_URI = rawUri;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

interface MongooseGlobal {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseGlobal | undefined;
}

let cached: MongooseGlobal = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    if (cached.conn.connection?.name && cached.conn.connection.name !== "shopdee") {
      await cached.conn.disconnect().catch(() => {});
      cached.conn = null;
      cached.promise = null;
    } else {
      return cached.conn;
    }
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((m) => {
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
