import CatalogDownload from "@/components/CatalogDownload";

export const metadata = {
  title: "Elevator Components Catalog | SS Elevator",
  description: "View the SS Elevator components catalog and request a PDF download.",
};

export default function CatalogPage() {
  return (
    <main className="catalog-page">
      <div className="w">
        <h1>SS Elevator Components Catalog</h1>
        <p className="sub">
          Browse the catalog below. To download a copy, enter your details in
          the request form.
        </p>
        <div className="catalog-viewer">
          <iframe
            src="/ss-elevator-components.pdf#toolbar=0&navpanes=0"
            title="SS Elevator components catalog PDF"
          />
        </div>
        <CatalogDownload />
      </div>
    </main>
  );
}
