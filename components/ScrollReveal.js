"use client";

import { useEffect } from "react";

export default function ScrollReveal() {
  useEffect(() => {
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      return;
    }

    const observed = new WeakSet();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    function observe(element) {
      if (observed.has(element)) return;
      observed.add(element);

      const siblings = Array.from(element.parentElement?.children ?? []).filter(
        (sibling) => sibling.hasAttribute("data-reveal"),
      );
      const delay = Math.min(siblings.indexOf(element) * 70, 210);
      element.style.setProperty("--reveal-delay", `${delay}ms`);
      observer.observe(element);
    }

    function scan(node) {
      if (!(node instanceof Element)) return;
      if (node.hasAttribute("data-reveal")) observe(node);
      node.querySelectorAll("[data-reveal]").forEach(observe);
    }

    document.documentElement.classList.add("motion-ready");
    scan(document.body);

    const mutations = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach(scan));
    });
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      mutations.disconnect();
      observer.disconnect();
      document.documentElement.classList.remove("motion-ready");
    };
  }, []);

  return null;
}
