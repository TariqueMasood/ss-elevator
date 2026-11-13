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
          <Link className="btn" href="/catalog" onClick={() => setOpen(false)}>PDF Catalog</Link>
          <a className="btn whatsapp" href={wa()} target="_blank" rel="noopener">WhatsApp</a>
        </nav>
      </div>
    </header>
  );
}
