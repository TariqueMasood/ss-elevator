import Link from "next/link";
export default function ProductCard({ p, more = true }) {
  return (
    <Link className="card pc" href={`/products/${p.slug}`}>
      <div className="ph">{p.images[0] && <img loading="lazy" alt={p.name} src={p.images[0]} />}</div>
      <h3>{p.name}</h3>
      <p>{p.description}</p>
      <span className="tag">{p.code}</span>
      {more && <div className="more">View details →</div>}
    </Link>
  );
}
