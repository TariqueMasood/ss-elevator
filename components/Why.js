import { SITE } from "@/lib/config";

const STRENGTHS = [
  ["Quality Assurance", "Rigorous supplier selection ensuring international standards."],
  ["Logistics Reliability", "Expertise in international shipping, customs and timely delivery."],
  ["Competitive Pricing", "Strong direct supplier network for optimal value."],
  ["Middle East Reach", "Saudi Arabia, Kuwait, UAE, Qatar and Oman."],
];

export default function Why() {
  return (
    <section id="why">
      <div className="w">
        <h2 data-reveal>Why SS Elevator</h2>
        <p className="sub" data-reveal>Your trusted partner for elevator components.</p>
        <div className="grid">
          {STRENGTHS.map(([title, description]) => (
            <div className="card" data-reveal key={title}>
              <h3>{title}</h3>
              <p>{description}</p>
            </div>
          ))}
        </div>
        <div className="grid stats-grid">
          {SITE.stats.map(({ value, label }) => (
            <div className="card stat" data-reveal key={label}>
              <b>{value}</b>
              <p>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
