export default function About() {
  return (
    <section id="about">
      <div className="w two">
        <div>
          <h2>About Us</h2>
          <p>Established in 2022 in Uttar Pradesh, SS Elevator Components International Trader is a reliable and dynamic trading firm specialising in sourcing, marketing and distribution of elevator spare parts across the Middle East.</p>
          <p>We bridge the gap between global manufacturers and local markets through efficient logistics and strategic partnerships.</p>
        </div>
        <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
          <div className="card"><h3>Our Mission</h3><p>To provide seamless, efficient and ethical trading services that empower our clients to succeed in their respective markets.</p></div>
          <div className="card"><h3>Our Vision</h3><p>To be the most preferred global sourcing partner known for reliability, speed and uncompromising quality.</p></div>
        </div>
      </div>
    </section>
  );
}
