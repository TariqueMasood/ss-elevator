"use client";
import { useState } from "react";
import Image from "next/image";

export default function Gallery({ images, name }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) return <div className="gal"><div className="big" /></div>;

  return (
    <div className="gal">
      <div className="big">
        <Image
          src={images[activeIndex]}
          alt={name}
          width={480}
          height={480}
          priority
          style={{ objectFit: "contain", width: "100%", height: "100%" }}
        />
      </div>
      {images.length > 1 && (
        <div className="thumbs">
          {images.map((src, index) => (
            <button
              key={src}
              className={index === activeIndex ? "on" : ""}
              onClick={() => setActiveIndex(index)}
              aria-label={`Photo ${index + 1} of ${images.length}`}
              aria-pressed={index === activeIndex}
            >
              <Image
                src={src}
                alt=""
                width={64}
                height={64}
                style={{ objectFit: "contain", width: "100%", height: "100%" }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
