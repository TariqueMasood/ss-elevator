import Link from "next/link";

export const metadata = {
  title: "Page Not Found – SS Elevator",
};

export default function NotFound() {
  return (
    <section>
      <div className="w" style={{ textAlign: "center", paddingTop: "var(--space-16)", paddingBottom: "var(--space-16)" }}>
        <p style={{ fontSize: "5rem", fontWeight: "var(--weight-bold)", color: "var(--pri)", lineHeight: 1, margin: "0 0 var(--space-4)" }}>
          404
        </p>
        <h1 style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "var(--pri)", margin: "0 0 var(--space-4)" }}>
          Page not found
        </h1>
        <p style={{ color: "var(--mut)", maxWidth: "480px", margin: "0 auto var(--space-8)" }}>
          The page you are looking for does not exist or may have been moved.
        </p>
        <div style={{ display: "flex", gap: "var(--space-3)", justifyContent: "center", flexWrap: "wrap" }}>
          <Link className="btn" href="/">
            Go to home
          </Link>
          <Link className="btn" href="/#products">
            Browse products
          </Link>
        </div>
      </div>
    </section>
  );
}
