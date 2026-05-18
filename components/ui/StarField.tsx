"use client";

import { useMemo } from "react";

export default function StarField() {
  const stars = useMemo(() => {
    return Array.from({ length: 70 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 0.5,
      duration: `${Math.random() * 4 + 2}s`,
      delay: `${Math.random() * 5}s`,
      maxOpacity: Math.random() * 0.6 + 0.2,
    }));
  }, []);

  return (
    <div className="stars-layer">
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            "--duration": star.duration,
            "--max-opacity": star.maxOpacity,
            animationDelay: star.delay,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
