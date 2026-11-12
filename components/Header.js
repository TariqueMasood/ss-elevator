"use client";
import Link from "next/link";
import { useState } from "react";
import { wa } from "@/lib/config";

const LINKS = [["Home", "/"], ["About", "/#about"], ["Products", "/#products"], ["Why Us", "/#why"], ["Contact", "/#contact"]];

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header>
      <div className="w nav">
        <Link className="logo" href="/"><b>SS</b> ELEVATOR</Link>
        <button className="burger" aria-label="Menu" onClick={() => setOpen(!open)}>{open ? "✕" : "☰"}</button>
        <nav className={"links" + (open ? " open" : "")}>
          {LINKS.map(([n, h]) => <Link key={n} href={h} onClick={() => setOpen(false)}>{n}</Link>)}
          <a className="btn" href="/ss-elevator-components.pdf" download="SS. Elevetor. Componets.pdf" onClick={() => setOpen(false)}>Download PDF</a>
          <a className="btn whatsapp" href={wa()} target="_blank" rel="noopener">WhatsApp</a>
        </nav>
      </div>
    </header>
  );
}
