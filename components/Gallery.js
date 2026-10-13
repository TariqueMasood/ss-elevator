"use client";
import { useState } from "react";
export default function Gallery({ images, name }) {
  const [i, setI] = useState(0);
  if (!images.length) return <div className="gal"><div className="big" /></div>;
  return (
    <div className="gal">
      <div className="big"><img alt={name} src={images[i]} /></div>
      {images.length > 1 && (
        <div className="thumbs">
          {images.map((m, j) => <button key={m} className={j === i ? "on" : ""} onClick={() => setI(j)} aria-label={`Photo ${j + 1}`}><img alt="" src={m} /></button>)}
        </div>
      )}
    </div>
  );
}
