import type { ImageProps } from "../../../lib/types";
import { motion } from "motion/react";

export default function Image({ src, alt, width, height }: ImageProps) {
  return (
    <div>
      <motion.img
        layout
        src={src}
        alt={alt}
        width={width}
        height={height}
        onError={(e) => {
          e.currentTarget.onerror = null; // prevent infinite loop
          e.currentTarget.src = "https://placehold.co/600x450";
        }}
      />
    </div>
  );
}
