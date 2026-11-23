"use client";

import { useEffect, useState } from "react";

/** How far down the page (px) before the button appears. */
const SCROLL_THRESHOLD_PX = 320;

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    function updateVisibility() {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD_PX);
    }

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  return (
    <button
      className={`back-to-top${isVisible ? " is-visible" : ""}`}
      type="button"
      aria-label="Scroll to top"
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg
        aria-hidden="true"
        focusable="false"
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 19V5m-7 7 7-7 7 7" />
      </svg>
    </button>
  );
}
