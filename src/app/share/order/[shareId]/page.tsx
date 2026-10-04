import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import SharedOrder from "@/models/SharedOrder";
import { formatVND, formatDate } from "@/lib/utils";
import { Sparkles, ShoppingBag, Eye, Heart, ArrowRight } from "lucide-react";
import PublicShareViewClient from "./PublicShareViewClient";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ shareId: string }>;
}

export default async function PublicShareOrderPage({ params }: PageProps) {
  await connectDB();
  const { shareId } = await params;

  const shared = await SharedOrder.findOne({ shareId });
  if (!shared) notFound();

  // Increment views count
  shared.viewsCount = (shared.viewsCount || 0) + 1;
  await shared.save();

  const serialized = JSON.parse(JSON.stringify(shared));

  return <PublicShareViewClient shared={serialized} />;
}
