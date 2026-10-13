const S = [["Quality Assurance", "Rigorous supplier selection ensuring international standards."], ["Logistics Reliability", "Expertise in international shipping, customs and timely delivery."], ["Competitive Pricing", "Strong direct supplier network for optimal value."], ["Middle East Reach", "Saudi Arabia, Kuwait, UAE, Qatar and Oman."]];
const N = [["6", "Product groups"], ["33+", "Catalog pages"], ["5", "Countries served"], ["2022", "Established"]];
export default function Why() {
  return (
    <section id="why">
      <div className="w">
        <h2>Why SS Elevator</h2>
        <p className="sub">Your trusted partner for elevator components.</p>
        <div className="grid">{S.map(([t, d]) => <div className="card" key={t}><h3>{t}</h3><p>{d}</p></div>)}</div>
        <div className="grid" style={{ marginTop: 28 }}>{N.map(([n, l]) => <div className="card stat" key={l}><b>{n}</b><p>{l}</p></div>)}</div>
      </div>
    </section>
  );
}
