"use client";
import { useState } from "react";
import { SITE, wa } from "@/lib/config";

export default function Contact() {
  const [f, setF] = useState({ name: "", email: "", purpose: "Customer", msg: "" });
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const send = (e) => {
    e.preventDefault();
    window.open(wa(`Hello SS Elevator,\nName: ${f.name}\nEmail: ${f.email}\nPurpose: ${f.purpose}\nMessage: ${f.msg}`), "_blank");
  };
  return (
    <section className="alt" id="contact">
      <div className="w two">
        <div>
          <h2>Get in Touch</h2>
          <p className="sub">Send your enquiry — it opens directly in WhatsApp.</p>
          <p><b>Phone:</b> <a href={`tel:+${SITE.phone}`}>{SITE.phoneDisplay}</a></p>
          <p><b>Email:</b> <a href={`mailto:${SITE.email}`}>{SITE.email}</a></p>
          <p><b>Web:</b> {SITE.web}</p>
          <p><b>Address:</b> {SITE.address}</p>
        </div>
        <div className="card">
          <form onSubmit={send}>
            <input required placeholder="Your name" value={f.name} onChange={set("name")} />
            <input type="email" placeholder="Email" value={f.email} onChange={set("email")} />
            <select value={f.purpose} onChange={set("purpose")}><option>Customer</option><option>Supplier</option><option>Career</option></select>
            <textarea required rows="4" placeholder="Tell us what you need" value={f.msg} onChange={set("msg")} />
            <button className="btn" type="submit">Send via WhatsApp</button>
          </form>
        </div>
      </div>
    </section>
  );
}
