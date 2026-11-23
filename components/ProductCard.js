import Link from "next/link";
import Image from "next/image";

export default function ProductCard({ p, more = true }) {
  return (
    <Link className="card pc" data-reveal href={`/products/${p.slug}`}>
      <div className="ph">
        {p.images[0] && (
          <Image
            src={p.images[0]}
            alt={p.name}
            width={400}
            height={300}
            loading="lazy"
            style={{ objectFit: "contain", width: "100%", height: "100%" }}
          />
        )}
      </div>
      <span className="tag">{p.code}</span>
      <h3>{p.name}</h3>
      <p>{p.description}</p>
      {more && (
        <div className="more">
          View details <span aria-hidden="true">→</span>
        </div>
      )}
    </Link>
  );
}
