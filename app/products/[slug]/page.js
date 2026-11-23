import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/lib/products";
import Gallery from "@/components/Gallery";
import ProductCard from "@/components/ProductCard";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = products.find((x) => x.slug === slug);
  return p ? { title: `${p.name} (${p.code}) – SS Elevator`, description: p.description } : {};
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const p = products.find((x) => x.slug === slug);
  if (!p) notFound();
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 3);
  return (
    <section>
      <div className="w">
        <p className="crumb" data-reveal><Link href="/">Home</Link> / <Link href="/#products">Products</Link> / {p.category}</p>
        <div className="two dtop" data-reveal>
          <Gallery images={p.images} name={p.name} />
          <div className="product-summary card">
            <h2>{p.name}</h2>
            <span className="tag product-code">{p.code}</span>
            <p className="product-description">{p.description}</p>
          </div>
        </div>
        {p.specs.length > 0 && (
          <>
            <h3 className="product-section-title product-specs-title" data-reveal>Specifications</h3>
            <div className="tw" data-reveal><table><tbody>{p.specs.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}</tbody></table></div>
          </>
        )}
        {p.table && (
          <>
            <h3 className="product-section-title" data-reveal>Models &amp; Data</h3>
            <div className="tw" data-reveal><table>
              <thead><tr>{p.table.h.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{p.table.r.map((row) => <tr key={row[0]}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>)}</tbody>
            </table></div>
          </>
        )}
        <p className="product-back-link" data-reveal><Link className="btn" href="/#products">← Back to products</Link></p>
        {related.length > 0 && (
          <>
            <h3 className="product-section-title product-related-title" data-reveal>Related products</h3>
            <div className="grid">{related.map((r) => <ProductCard key={r.slug} p={r} more={false} />)}</div>
          </>
        )}
      </div>
    </section>
  );
}
