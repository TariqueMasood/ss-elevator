import CatalogDownload from "@/components/CatalogDownload";

const CATALOG_PAGE_COUNT = 37;

export const metadata = {
  title: "Elevator Components Catalog | SS Elevator",
  description: "View the SS Elevator components catalog and request a PDF download.",
};

export default function CatalogPage() {
  return (
    <main className="catalog-page">
      <div className="w">
        <h1 data-reveal>SS Elevator Components Catalog</h1>
        <p className="sub" data-reveal>
          Preview the catalog below. To receive a downloadable PDF, submit the
          request form and we will email you a secure link.
        </p>
        <div
          className="catalog-viewer"
          data-reveal
          role="region"
          aria-label="Catalog preview pages"
          tabIndex={0}
        >
          {Array.from({ length: CATALOG_PAGE_COUNT }, (_, index) => {
            const pageNumber = index + 1;
            const imageNumber = String(pageNumber).padStart(3, "0");

            return (
              <img
                key={pageNumber}
                className="catalog-preview-page"
                src={`/catalog-preview/page-${imageNumber}.jpg`}
                alt={`SS Elevator catalog page ${pageNumber}`}
                width="810"
                height="1080"
                loading={pageNumber === 1 ? "eager" : "lazy"}
              />
            );
          })}
        </div>
        <p className="catalog-viewer-note">
          To download the complete PDF, request a secure link by email below.
        </p>
        <CatalogDownload />
      </div>
    </main>
  );
}
