"use client";

import Link from "next/link";
import { categoryHash } from "@/lib/products";

export default function FooterCategoryLinks({ categories }) {
  return categories.map((category) => {
    const hash = categoryHash(category);

    return (
      <Link
        key={category}
        href={`/${hash}`}
        onClick={(event) => {
          if (window.location.pathname !== "/") return;

          event.preventDefault();
          if (window.location.hash !== hash) {
            window.history.pushState(null, "", `/${hash}`);
          }
          window.dispatchEvent(
            new CustomEvent("product-category-navigation", {
              detail: category,
            }),
          );
        }}
      >
        {category}
      </Link>
    );
  });
}
