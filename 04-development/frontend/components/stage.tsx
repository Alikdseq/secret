"use client";

import { motion } from "framer-motion";

const slots = [
  { x: "18%", y: "28%", size: 132, rot: -12 },
  { x: "62%", y: "16%", size: 118, rot: 10 },
  { x: "48%", y: "48%", size: 146, rot: -4 },
  { x: "24%", y: "58%", size: 110, rot: 8 },
  { x: "58%", y: "62%", size: 124, rot: -14 },
  { x: "38%", y: "22%", size: 100, rot: 6 },
];

export function Stage({
  image,
  alt,
  layers,
  scale,
  wrap,
}: {
  image: string;
  alt: string;
  layers: { id: string; src: string }[];
  scale: number;
  wrap: string;
}) {
  return (
    <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[32px] bg-[#fbf8f3]">
      <div className="absolute bottom-[14%] left-1/2 h-24 w-44 -translate-x-1/2 rounded-full opacity-90" style={{ background: wrap }} />
      <img
        src={image}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover transition duration-500"
        style={{ transform: `scale(${scale})` }}
      />
      {layers.slice(0, 6).map((layer, index) => {
        const slot = slots[index % slots.length];
        return (
          <motion.img
            key={layer.id}
            src={layer.src}
            alt=""
            initial={{ opacity: 0, scale: 0.75, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.42, ease: "easeOut" }}
            className="absolute rounded-full object-cover"
            style={{
              left: slot.x,
              top: slot.y,
              width: slot.size * scale,
              height: slot.size * scale,
              rotate: slot.rot,
              mixBlendMode: "multiply",
            }}
          />
        );
      })}
    </div>
  );
}
