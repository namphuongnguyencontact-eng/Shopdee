import React from "react";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import ProductForm from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductAdminPage({ params }: PageProps) {
  await connectDB();
  const { id } = await params;

  const product = await Product.findById(id).lean();
  if (!product) {
    notFound();
  }

  const serializedProduct = JSON.parse(JSON.stringify(product));

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ProductForm initialData={serializedProduct} isEdit={true} />
    </div>
  );
}
