import { wa } from "@/lib/config";
export default function Hero() {
  return (
    <section className="hero" id="home">
      <div className="w">
        <h1 data-hero-enter="title">Professional &amp; Excellent in Elevator Spare Parts</h1>
        <p data-hero-enter="copy">SS Elevator Component Intl., Trading sources and distributes high-quality elevator spare parts across Saudi Arabia, Kuwait, UAE, Qatar and Oman.</p>
        <div className="row" data-hero-enter="actions">
          <a className="btn" href="#products">Browse Products</a>
          <a className="btn whatsapp" href={wa()} target="_blank" rel="noopener">Chat on WhatsApp</a>
        </div>
      </div>
    </section>
  );
}
