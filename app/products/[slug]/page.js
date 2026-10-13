import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/lib/products";
import Gallery from "@/components/Gallery";
import ProductCard from "@/components/ProductCard";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }) {
  const p = products.find((x) => x.slug === params.slug);
  return p ? { title: `${p.name} (${p.code}) – SS Elevator`, description: p.description } : {};
}

export default function ProductPage({ params }) {
  const p = products.find((x) => x.slug === params.slug);
  if (!p) notFound();
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 3);
  return (
    <section>
      <div className="w">
        <p className="crumb"><Link href="/">Home</Link> / <Link href="/#products">Products</Link> / {p.category}</p>
        <div className="two dtop">
          <Gallery images={p.images} name={p.name} />
          <div>
            <h2>{p.name}</h2>
            <span className="tag" style={{ marginTop: 0 }}>{p.code}</span>
            <p style={{ margin: "16px 0 0" }}>{p.description}</p>
          </div>
        </div>
        <div style={{ height: 24 }} />
        {p.specs.length > 0 && (
          <>
            <h3>Specifications</h3>
            <div className="tw"><table><tbody>{p.specs.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}</tbody></table></div>
          </>
        )}
        {p.table && (
          <>
            <h3 style={{ marginTop: 28 }}>Models &amp; Data</h3>
            <div className="tw"><table>
              <thead><tr>{p.table.h.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{p.table.r.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j}>{c}</td>)}</tr>)}</tbody>
            </table></div>
          </>
        )}
        <p style={{ marginTop: 28 }}><Link className="btn" href="/#products">← Back to products</Link></p>
        {related.length > 0 && (
          <>
            <h3 style={{ marginTop: 36 }}>Related products</h3>
            <div className="grid">{related.map((r) => <ProductCard key={r.slug} p={r} more={false} />)}</div>
          </>
        )}
      </div>
    </section>
  );
}
