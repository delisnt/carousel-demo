import {
  motion,
  useDragControls,
  useMotionValue,
  type PanInfo,
} from "motion/react";
import { useFetch } from "../../hooks/useFetch";
import styles from "./ImageContainer.module.scss";
import ImageComponent from "./ImgComponent/Image";
import { useEffect, useRef, useState } from "react";
import { useThrottle } from "../../hooks/useThrottle";

function ImageContainer() {
  const url = `https://api.nekosapi.com/v4/images?limit=10`;
  const { data } = useFetch(url);
  const [selectedItem, setSelectedItem] = useState<number | null>(2);
  const [hoveredImg, setHoveredImg] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [visibleArray, setVisibleArray] = useState<number[]>([]);
  const [preloadedImgs, setPreloadedImgs] = useState<number[]>([]);
  const controls = useDragControls();
  const containerRef = useRef<HTMLDivElement>(null);
  const slideDirectionRef = useRef<"right" | "left">("right");
  const imagesRef = useRef<HTMLDivElement>(null);
  const thresholdRef = useRef(1);
  const timeoutRef = useRef<number | null>(null);
  const isLocked = useRef(false);
  const [_first, second, center, fourth, _last] = visibleArray;
  const x = useMotionValue(0);
  const MEDIA_SCREEN = {
    tablet: 768,
    mobile: 600,
  };

  console.log("Visible Images IDs:", visibleArray);
  console.log("Preloaded Images IDs:", preloadedImgs);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const startingVisible = data.slice(0, 5).map((item) => item.id);
    setVisibleArray(startingVisible);
    setSelectedItem(startingVisible[2]);
  }, [data]);

  // useEffect(() => {
  //   if (!data || visibleArray.length === 0) {
  //     return;
  //   }
  //   const width = window.innerWidth;
  //   const isMobile = width <= MEDIA_SCREEN.mobile;
  //   const preloadRange = isMobile ? 2 : 3;
  //   const centerIndex = data.findIndex((img) => img.id === selectedItem);
  //   const newPreloadedIds = getWrappedSlice(
  //     data.map((_, i) => i),
  //     centerIndex,
  //     preloadRange
  //   );
  //   const preloadIds = newPreloadedIds.map((i) => data[i].id);
  //   setPreloadedImgs(preloadIds);

  //   const filteredData = newPreloadedIds.map((index) => data[index]);
  //   console.log(filteredData);

  //   const preloadImages = async () => {
  //     try {
  //       const imgPromises = filteredData.map((img) => {
  //         return new Promise((res, rej) => {
  //           const imgObj = new Image();
  //           imgObj.src = img.url;
  //           imgObj.fetchPriority = "high";
  //           imgObj.onload = () => {
  //             res(imgObj);
  //           };
  //           imgObj.onerror = () =>
  //             rej(new Error("could not fetch image: " + img.url));
  //         });
  //       });
  //       console.log("Preloading:", newPreloadedIds.map(id => data[id]?.id));
  //       console.log("Rendering visible:", visibleArray);

  //       const images = await Promise.all(imgPromises);
  //       console.log(images);
  //     } catch (err) {
  //       console.error("Errore durante il preload:", err);
  //     }
  //   };

  //   preloadImages();
  // }, [visibleArray]);

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
    switch (animation) {
      case "initial":
        return {
          x: slideDirectionRef.current === "right" ? offset : -offset,
          opacity: 0,
        };

      case "animate":
        return {
          x: 0,
          opacity: 1,
        };

      case "exit":
        return {
          x: slideDirectionRef.current === "right" ? -offset : offset,
          opacity: 0,
        };
      default:
        return {};
    }
  };

  const handleNavigation = (
    id: number,
    visibleArr: number[],
    direction: "left" | "right"
  ) => {
    setVisibleArray(visibleArr);
    setSelectedItem(id);
    slideDirectionRef.current = direction;
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
      handleNavigation(id, newArray, "left");
    } else if (id === fourth) {
      handleNavigation(id, newArray, "right");
    } else if (id === center) {
      setSelectedItem((prev) => (prev === id ? null : id));
    }

    setTimeout(() => {
      isLocked.current = false;
    }, 300);
  };

  const getWrappedSlice = (
    arr: number[],
    centerIndex: number,
    range: number
  ) => {
    const result = [];
    const len = arr.length;

    for (let offset = -range; offset <= range; offset++) {
      const i = (centerIndex + offset + len) % len;
      console.log(i);
      result.push(arr[i]);
    }

    return result;
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
