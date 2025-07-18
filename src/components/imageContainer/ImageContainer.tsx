import {
  motion,
  useDragControls,
  useMotionValue,
  type PanInfo,
} from "motion/react";
import styles from "./ImageContainer.module.scss";
import ImageComponent from "./ImgComponent/Image";
import { useRef, useState } from "react";
import { useThrottle } from "../../hooks/useThrottle";
import { getWrappedSlice } from "../../lib/utils";
import type { ImageContainerProps } from "../../lib/types";

function ImageContainer({
  selectedItem,
  data,
  visibleArray,
  preloadedImgs,
  sliderDirection,
  handleNavigation,
}: ImageContainerProps) {
  const [hoveredImg, setHoveredImg] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const controls = useDragControls();
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);
  const thresholdRef = useRef(1);
  const timeoutRef = useRef<number | null>(null);
  const isLocked = useRef(false);
  const [_first, second, center, fourth, _last] = visibleArray;
  const x = useMotionValue(0);

  console.log("Visible Images IDs:", visibleArray);
  console.log("Preloaded Images IDs:", preloadedImgs);

  const getImgToRemove = (
    delta: number,
    threshold: number,
    useCase: "scroll" | "drag"
  ): number | null => {
    if (useCase === "scroll") {
      if (delta < -threshold) return second;
      if (delta > threshold) return fourth;
    } else if (useCase === "drag") {
      if (delta < -threshold) return fourth;
      if (delta > threshold) return second;
    }

    return null;
  };

  const getOffsetAnimation = (
    offset: number,
    animation: "exit" | "initial" | "animate"
  ) => {
    if (sliderDirection === "center") {
      return {
        x: 0,
        opacity: 1,
      };
    }

    switch (animation) {
      case "initial":
        return {
          x: sliderDirection === "right" ? offset : -offset,
          opacity: 0,
        };

      case "animate":
        return {
          x: 0,
          opacity: 1,
        };

      case "exit":
        return {
          x: sliderDirection === "right" ? -offset : offset,
          opacity: 0,
        };
      default:
        return {};
    }
  };

  const handleVisibleArray = (id: number) => {
    if (!data || isLocked.current) return;
    isLocked.current = true;

    const imgIds = data.map((item) => item.id);
    const index = imgIds.indexOf(id);

    if (index === -1) {
      isLocked.current = false;
      return;
    }

    const range = 2; // 2 left, 2 right = 5 items
    const newArray = getWrappedSlice(imgIds, index, range);

    // Determina direzione
    if (id === second) {
      handleNavigation('left', newArray, id);
    } else if (id === fourth) {
      handleNavigation('right', newArray, id);
    } else if (id === center) {
      handleNavigation('center', null, null);
    }

    setTimeout(() => {
      isLocked.current = false;
    }, 300);
  };

  const handleDragEnd = (_e: MouseEvent, info: PanInfo) => {
    const { offset } = info;
    const DRAG_LIMIT = 75;

    let imgToDelete = getImgToRemove(offset.x, DRAG_LIMIT, "drag");

    if (imgToDelete !== null) {
      handleVisibleArray(imgToDelete);
      setIsDragging(false);
    }
  };

  const handleWheel = useThrottle((e: React.WheelEvent<HTMLDivElement>) => {
    const { deltaX, deltaY } = e;
    let delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;
    const threshold = thresholdRef.current;

    let imgToDelete = getImgToRemove(delta, threshold, "scroll");

    if (imgToDelete !== null) {
      handleVisibleArray(imgToDelete);

      thresholdRef.current = 2000;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        thresholdRef.current = 20; // torna alla soglia normale
      }, 500);
    }
  }, 300);

  const getScale = (index: number): number => {
    if (isDragging) return 1.1;
    if (selectedItem !== null) {
      if (selectedItem === index) return 1.2;
      if (hoveredImg === index) return 1.1;
      return 0.9;
    }
    if (hoveredImg !== null) {
      return hoveredImg === index ? 1.2 : 0.9;
    }
    return 1;
  };

  return (
    <motion.div
      style={{ x }}
      ref={containerRef}
      onWheel={(e) => handleWheel(e)}
    >
      <motion.div
        className={styles.imageContainer}
        onKeyDown={(e) => console.log(e.key)}
        drag="x"
        dragConstraints={containerRef}
        dragControls={controls}
        dragElastic={0.3}
        onPointerDown={(event) => {
          controls.start(event);
        }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
      >
        {data &&
          visibleArray.map((element) => {
            const FALLBACK_ENTRY_OFFSET = 400;
            const entryOffset =
              imagesRef.current?.clientWidth || FALLBACK_ENTRY_OFFSET;
            const img2 = data.find((item) => item.id === element);

            if (!img2) return;
            let imgId = img2.id;
            return (
              <motion.div
                transition={{ duration: 0.3 }}
                layout
                ref={imagesRef}
                initial={getOffsetAnimation(entryOffset, "initial")}
                animate={getOffsetAnimation(entryOffset, "animate")}
                exit={getOffsetAnimation(entryOffset, "exit")}
                onMouseEnter={() => setHoveredImg(imgId)}
                onMouseLeave={() => setHoveredImg(null)}
                className={styles.singleImg}
                key={img2.id}
                onClick={() => {
                  if (isDragging) return;
                  handleVisibleArray(imgId);
                }}
              >
                <ImageComponent
                  scale={getScale(img2.id)}
                  src={img2.url}
                  alt={`${img2.id}`}
                  width={450}
                  height={300}
                />
              </motion.div>
            );
          })}
      </motion.div>
    </motion.div>
  );
}

export default ImageContainer;
