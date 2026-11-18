"use client";
import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import { products, categories } from "@/lib/products";

export default function ProductList() {
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const items = useMemo(() => {
    const s = q.trim().toLowerCase();
    return products.filter((p) => (cat === "All" || p.category === cat) && (!s || `${p.name} ${p.code} ${p.description}`.toLowerCase().includes(s)));
  }, [cat, q]);
  return (
    <section className="alt" id="products">
      <div className="w">
        <h2 data-reveal>Our Products</h2>
        <p className="sub" data-reveal>Click any product to see its full details.</p>
        <input className="search" data-reveal placeholder="Search products or codes…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="tabs" data-reveal>
          {["All", ...categories].map((n) => <button key={n} type="button" className={"tab" + (cat === n ? " on" : "")} aria-pressed={cat === n} onClick={() => setCat(n)}>{n}</button>)}
        </div>
        <div className="grid" data-reveal>{items.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
        {items.length === 0 && <p>No products match your search.</p>}
      </div>
    </section>
  );
}
