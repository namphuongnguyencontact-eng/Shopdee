import { redirect } from "next/navigation";

export default async function RedirectCategory({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  redirect(`/category/${slug}`);
}
