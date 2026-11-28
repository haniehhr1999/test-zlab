"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PRODUCTS, type ProductCategory } from "@/lib/products";

const CATEGORIES: Array<"All" | ProductCategory> = [
  "All",
  "Mining & Industry",
  "Robotics",
  "Energy & Networking",
  "Mobility & Safety",
  "Retail & Finance",
  "Mining & Mineral Industries",
];

const CATEGORY_ACCENT: Record<ProductCategory, string> = {
  "Mining & Industry": "#f27121",
  Robotics: "#3db8ff",
  "Energy & Networking": "#46c79a",
  "Mobility & Safety": "#ffb020",
  "Retail & Finance": "#c084fc",
  "Mining & Mineral Industries": "#fb7185",
};

export function ProductGrid() {
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("All");

  const filtered = useMemo(
    () =>
      category === "All"
        ? PRODUCTS
        : PRODUCTS.filter((p) => p.category === category),
    [category],
  );

  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(242,113,33,0.18), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 20%, rgba(61,184,255,0.08), transparent 45%), linear-gradient(#0a0f16, #0c1118 40%, #0a1018)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage:
            "radial-gradient(ellipse 70% 60% at 50% 0%, black, transparent)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-8 sm:pt-14">
        <header className="mx-auto max-w-3xl text-center" dir="rtl">
          <p className="text-[12px] font-semibold uppercase tracking-[0.32em] text-[#f27121]">
            ZLab Projects
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            انیمیشن محصولات
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-8 text-slate-400 sm:text-lg">
            روی هر کارت کلیک کنید تا مدل سه‌بعدی و انیمیشن Explode همان محصول را
            ببینید.
          </p>
        </header>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {CATEGORIES.map((item) => {
            const active = item === category;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                className={`rounded-full px-3.5 py-1.5 text-xs transition ${
                  active
                    ? "bg-[#f27121] text-white shadow-[0_0_0_1px_rgba(242,113,33,0.35)]"
                    : "border border-white/10 bg-white/[0.03] text-slate-300 hover:border-white/25 hover:bg-white/[0.06]"
                }`}
              >
                {item === "All" ? "همه" : item}
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-center text-sm text-slate-500">
          نمایش {filtered.length} از {PRODUCTS.length} محصول
        </p>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => {
            const accent = CATEGORY_ACCENT[product.category];
            return (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#121820]/80 p-5 transition duration-300 hover:-translate-y-1 hover:border-white/25 hover:bg-[#161e28]"
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px opacity-80 transition group-hover:opacity-100"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                  }}
                />
                <div
                  aria-hidden
                  className="mb-5 h-28 rounded-xl border border-white/5"
                  style={{
                    background: `linear-gradient(145deg, ${accent}33, transparent 55%), radial-gradient(circle at 80% 20%, ${accent}22, transparent 40%), #0d131c`,
                  }}
                />
                <p
                  className="text-[11px] font-medium uppercase tracking-[0.18em]"
                  style={{ color: accent }}
                >
                  {product.category}
                </p>
                <h2 className="mt-2 text-lg font-semibold text-white" dir="rtl">
                  {product.titleFa}
                </h2>
                <p
                  className="mt-2 line-clamp-3 text-sm leading-7 text-slate-400"
                  dir="rtl"
                >
                  {product.descriptionFa}
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {product.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <p className="mt-5 text-sm font-medium text-[#f27121] transition group-hover:translate-x-[-2px]">
                  مشاهده انیمیشن ←
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
