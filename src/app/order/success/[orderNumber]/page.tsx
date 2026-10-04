import React from "react";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import OrderSuccessClient from "./OrderSuccessClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderSuccessPage({ params }: PageProps) {
  await connectDB();
  const { orderNumber } = await params;

  const order = await Order.findOne({ orderNumber }).lean();
  if (!order) notFound();

  const serializedOrder = JSON.parse(JSON.stringify(order));

  return <OrderSuccessClient order={serializedOrder} />;
}
