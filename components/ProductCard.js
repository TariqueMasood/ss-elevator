import Link from "next/link";
export default function ProductCard({ p, more = true }) {
  return (
    <Link className="card pc" data-reveal href={p.href || `/products/${p.slug}`}>
      <div className="ph">{p.images[0] && <img loading="lazy" alt={p.name} src={p.images[0]} />}</div>
      <span className="tag">{p.code}</span>
      <h3>{p.name}</h3>
      <p>{p.description}</p>
      {more && <div className="more">View details <span aria-hidden="true">→</span></div>}
    </Link>
  );
}
