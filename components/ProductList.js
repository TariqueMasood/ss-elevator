"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import { products, categories, categoryHash } from "@/lib/products";

export default function ProductList() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const activeTabRef = useRef(null);
  const previousCategoryRef = useRef(activeCategory);

  useEffect(() => {
    if (previousCategoryRef.current === activeCategory) return;
    previousCategoryRef.current = activeCategory;
    activeTabRef.current?.scrollIntoView({
      block: "nearest",
      inline: "center",
    });
  }, [activeCategory]);

  useEffect(() => {
    function selectCategory(category) {
      if (!categories.includes(category)) return;
      setActiveCategory(category);
      setSearchQuery("");
      requestAnimationFrame(() => {
        document.getElementById("products")?.scrollIntoView();
      });
    }

    function handleFooterNavigation(event) {
      selectCategory(event.detail);
    }

    function handleHashChange() {
      const category = categories.find(
        (item) => categoryHash(item) === window.location.hash,
      );
      if (category) selectCategory(category);
    }

    handleHashChange();
    window.addEventListener(
      "product-category-navigation",
      handleFooterNavigation,
    );
    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener(
        "product-category-navigation",
        handleFooterNavigation,
      );
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const visibleProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return products.filter(
      (product) =>
        (activeCategory === "All" || product.category === activeCategory) &&
        (!query ||
          `${product.name} ${product.code} ${product.description}`
            .toLowerCase()
            .includes(query))
    );
  }, [activeCategory, searchQuery]);

  return (
    <section className="alt" id="products">
      <div className="w">
        <h2 data-reveal>Our Products</h2>
        <p className="sub" data-reveal>Click any product to see its full details.</p>
        <label htmlFor="product-search" className="sr-only">
          Search products
        </label>
        <input
          id="product-search"
          className="search"
          data-reveal
          placeholder="Search products or codes…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search products by name or code"
        />
        <div className="tabs" data-reveal>
          {["All", ...categories].map((category) => (
            <button
              key={category}
              ref={activeCategory === category ? activeTabRef : undefined}
              type="button"
              className={"tab" + (activeCategory === category ? " on" : "")}
              aria-pressed={activeCategory === category}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="grid">
          {visibleProducts.map((product) => (
            <ProductCard key={product.slug} p={product} />
          ))}
        </div>
        {visibleProducts.length === 0 && (
          <p>No products match your search.</p>
        )}
      </div>
    </section>
  );
}
