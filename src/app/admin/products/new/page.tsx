import React from "react";
import ProductForm from "@/components/admin/ProductForm";

export const metadata = {
  title: "Thêm sản phẩm mới - Admin Shopdee",
};

export default function NewProductAdminPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <ProductForm isEdit={false} />
    </div>
  );
}
