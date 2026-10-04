import React from "react";
import { notFound, redirect } from "next/navigation";
import mongoose from "mongoose";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { getSessionUser } from "@/lib/auth";
import { syncOrderDeliveryStatus } from "@/lib/orderService";
import OrderDetailClient from "./OrderDetailClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderTrackingPage({ params }: PageProps) {
  const session = await getSessionUser();
  if (!session) {
    redirect("/login?redirect=/orders");
  }

  await connectDB();
  const { id } = await params;

  let query: Record<string, unknown> = { orderNumber: id };
  if (mongoose.Types.ObjectId.isValid(id)) {
    query = { $or: [{ orderNumber: id }, { _id: id }] };
  }

  const order = await Order.findOne(query);
  if (!order) notFound();

  // If user is not the owner and not admin, forbid
  if (order.userId.toString() !== session.userId && session.role !== "admin") {
    notFound();
  }

  // Sync 24-hour real-time delivery status
  await syncOrderDeliveryStatus(order);

  const serializedOrder = JSON.parse(JSON.stringify(order.toObject ? order.toObject() : order));
  return <OrderDetailClient order={serializedOrder} />;
}
