import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllProductSlugs,
  getProductBySlug,
} from "@/lib/products";
import { ProductDetail } from "@/components/ProductDetail";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllProductSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: "محصول یافت نشد" };
  return {
    title: `${product.titleFa} · ZLab`,
    description: product.descriptionFa,
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();
  return <ProductDetail product={product} />;
}
