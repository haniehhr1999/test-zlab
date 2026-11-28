"use client";

import Link from "next/link";
import type { Product } from "@/lib/products";
import { ProductScene } from "@/components/viewer/ProductScene";

export function ProductDetail({ product }: { product: Product }) {
  return (
    <div className="relative h-dvh w-full overflow-hidden bg-[#0c1118]">
      <ProductScene product={product} />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 bg-gradient-to-b from-[#0c1118] via-[#0c1118]/75 to-transparent px-5 pb-20 pt-5 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-start justify-between gap-4">
          <Link
            href="/"
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3.5 py-1.5 text-sm text-slate-200 backdrop-blur-md transition hover:border-white/25 hover:bg-black/45"
          >
            → بازگشت به محصولات
          </Link>
          <a
            href={product.zlabUrl}
            target="_blank"
            rel="noreferrer"
            className="pointer-events-auto hidden rounded-full border border-white/10 bg-black/30 px-3.5 py-1.5 text-sm text-[#f27121] backdrop-blur-md transition hover:border-[#f27121]/40 sm:inline-flex"
          >
            صفحه ZLab
          </a>
        </div>

        <div className="mx-auto mt-8 max-w-6xl" dir="rtl">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#f27121]">
            {product.category}
          </p>
          <h1 className="mt-2 max-w-3xl text-2xl font-semibold tracking-tight text-white sm:text-4xl">
            {product.titleFa}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            {product.descriptionFa}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[11px] text-slate-300 backdrop-blur-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#0c1118] via-[#0c1118]/70 to-transparent px-5 pb-7 pt-20">
        <p className="text-center text-sm text-slate-300/90">
          روی قطعات هاور کنید · درگ برای چرخش دور محصول
        </p>
      </div>
    </div>
  );
}
