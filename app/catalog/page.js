import CatalogDownload from "@/components/CatalogDownload";

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
          Browse the catalog below. To download a copy, enter your details in
          the request form.
        </p>
        <div className="catalog-viewer" data-reveal>
          <iframe
            src="/ss-elevator-components.pdf#toolbar=0&navpanes=0"
            title="SS Elevator components catalog PDF"
          />
        </div>
        <div data-reveal><CatalogDownload /></div>
      </div>
    </main>
  );
}
