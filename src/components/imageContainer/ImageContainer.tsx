import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, type PanInfo } from "motion/react";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import { useDragControls } from "motion/react";
import styles from "./ImageContainer.module.scss";
import Image from "./ImgComponent/Image";


function ImageContainer() {
  const imageArray = Array.from({ length: 10 }, (_, i) => i + 1);
  const controls = useDragControls();
  // const dragX = useMotionValue(0);
  const screenWidth = useWindowDimensions().width;
  const SCREEN_WIDTHS = {
    MOBILE: 500,
    TABLET: 768,
    LAPTOP: 1024,
    DESKTOP: 1500,
  };

  const xTranslation = useMotionValue(0);

  const [images, setImages] = useState(imageArray);
  const [selectedImg, setSelectedImg] = useState<number | null>(null);
  const [hoveredImg, setHoveredImg] = useState<number | null>(null);
  const [_imgIndex, setImgIndex] = useState<number>(0);
  const [translateX, setTranslateX] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [currentImgWidth, setCurrentImgWidth] = useState<number | null>(null);
  const scrollTimeout = useRef<number | null>(null);

  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef(null);
  const lastImageRef = useRef<HTMLDivElement | null>(null);
  const selectedImgRef = useRef<number | null>(null);
  const prevImgWidthRef = useRef<number | null>(null);
  const isLoadingRef = useRef(false);
  const isInView = useInView(lastImageRef, {
    once: false,
    amount: 0.3,
  });

  useEffect(() => {
    if (isInView) {
      infiniteLoading();
    }
  }, [isInView]);

  useEffect(() => {
    const updateWidth = () => {
      if (lastImageRef.current) {
        const newWidth = lastImageRef.current.clientWidth;
        const oldWidth = prevImgWidthRef.current;
        const screenWidthWindow = window.innerWidth;

        //TO DO check migliore per l'if tra 1024 e 1500 ad ogni resize scrolla in avanti di 1

        const isLaptop =
          screenWidthWindow < SCREEN_WIDTHS.DESKTOP &&
          screenWidthWindow > SCREEN_WIDTHS.TABLET;

        if (oldWidth) {
          setIsScrolling(false);
          console.log(`New Width: ${newWidth}, Old Width: ${oldWidth}`);
          setTranslateX((prev) => {
            console.log("snap");
            const offsets = {
              selected: screenWidthWindow > SCREEN_WIDTHS.DESKTOP ? 2 : 1,
            };
            let currentIndexNotSelected = Math.round(prev / oldWidth);

            let selectedIndex = selectedImgRef.current;
            const currentIndex =
              selectedIndex !== null
                ? selectedIndex - offsets.selected
                : currentIndexNotSelected;
            let snapped = isLaptop
              ? currentIndex * newWidth - (screenWidthWindow - newWidth) / 2
              : currentIndex * newWidth;
            console.log(`snapped at: ${snapped} index: ${currentIndex}`);
            return snapped;
          });
        }
        // Aggiorna i riferimenti
        prevImgWidthRef.current = newWidth;
        setCurrentImgWidth(newWidth);
      }
    };

    // Delay to ensure the element is rendered
    requestAnimationFrame(updateWidth);

    // Debounced resize
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateWidth, 300);
    };

    let timeoutId = setTimeout(() => {}, 0);
    window.addEventListener("wheel", handleResize);
    window.addEventListener("resize", handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("wheel", handleResize);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    selectedImgRef.current = selectedImg;
  }, [selectedImg]);

  const onDragStart = () => {
    setIsDragging(true);
    setSelectedImg(null);
  };

  const onDragEnd = (_e: MouseEvent, info: PanInfo) => {
    setIsDragging(false);
    setSelectedImg(null);

    const { offset } = info;

    if (currentImgWidth) {
      if (offset.x > 1) {
        setTranslateX((prev) => Math.max(0, prev - currentImgWidth));
      } else if (offset.x < -1) {
        setTranslateX((prev) => Math.max(0, prev + currentImgWidth));
      }
      snapToCenter();
    }
  };

  const handleIndex = (index: number) => {
    setImgIndex(index - 1);
    console.log(`index: ${index}`);
  };

  const infiniteLoading = () => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    setTimeout(() => {
      setImages((prev) => {
        if (prev.length > 40 && currentImgWidth) {
          console.log(`infinite loading prev:${prev.length}`);
          setTranslateX(0);
          return prev.slice(-5);
        }
        const start = prev.length;
        const newBatch = Array.from({ length: 10 }, (_, i) => start + i + 1);
        return [...prev, ...newBatch];
      });

      isLoadingRef.current = false;
    }, 200);
  };

  const snapToCenter = () => {
    const isResponsive =
      screenWidth < SCREEN_WIDTHS.DESKTOP && screenWidth > SCREEN_WIDTHS.TABLET;

    setIsScrolling(false);
    const offsets = {
      selected: screenWidth > SCREEN_WIDTHS.DESKTOP ? 2 : 1,
    };

    if (!currentImgWidth) return;

    setTranslateX((prev) => {
      let currentIndex = Math.round(prev / currentImgWidth);
      let snapped = isResponsive
        ? currentIndex * currentImgWidth - (screenWidth - currentImgWidth) / 2
        : currentIndex * currentImgWidth;

      console.log(`snapped to ${snapped} at index ${currentIndex + 2}`);

      setSelectedImg(currentIndex + offsets.selected);

      return snapped;
    });
  };

  // const snapToCenterMotion = () => {
  //   const isResponsive =
  //     screenWidth < SCREEN_WIDTHS.DESKTOP && screenWidth > SCREEN_WIDTHS.TABLET;

  //   const offsets = {
  //     selected: screenWidth > SCREEN_WIDTHS.DESKTOP ? 2 : 1,
  //   };
  //   animate(xTranslation, 0, {
  //     type: "spring",
  //     damping: 20,
  //     stiffness: 300,
  //   });
  //   setIsScrolling(false);
  // };

  // const handleWheelMotion = (e: React.WheelEvent<HTMLDivElement>) => {
  //   setIsScrolling(true);
  //   setSelectedImg(null);

  //   const { deltaX } = e;

  //   let current = xTranslation.get();
  //   current += deltaX * 10;
  //   console.log(current)

  //   let controls;

  //   controls = animate(xTranslation, current, {
  //     ease: "linear",
  //     duration: 0.3,
  //   });

  //   if (scrollTimeout.current) {
  //     clearTimeout(scrollTimeout.current);
  //   }

  //   scrollTimeout.current = window.setTimeout(() => {
  //     controls.stop();
  //     snapToCenter();
  //   }, 150);
  // };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    setIsScrolling(true);
    setSelectedImg(null);

    const { deltaX, deltaY } = e;

    if (currentImgWidth) {
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        setTranslateX((prev) => Math.max(-currentImgWidth, prev - deltaY));
      } else {
        setTranslateX((prev) => Math.max(-currentImgWidth, prev + deltaX));
      }
    }

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = window.setTimeout(() => {
      snapToCenter();
    }, 150);
  };

  const handleSelectedImg = (index: number) => {
    setSelectedImg((prev) => (prev === index ? null : index));
  };

  const scrollToImage = (index: number) => {
    if (isScrolling) return;

    const offsetResponsive = screenWidth > SCREEN_WIDTHS.DESKTOP ? 2 : 1;

    if (currentImgWidth && screenWidth > SCREEN_WIDTHS.TABLET) {
      let currentIndex = Math.round(
        translateX / currentImgWidth + offsetResponsive
      );
      console.log(currentImgWidth);

      // Lunghezza dello step è uguale alla lunghezza del contenitore content singolo
      const step = currentImgWidth;

      console.log(`currentIndex: ${currentIndex} index: ${index}`);

      if (screenWidth < SCREEN_WIDTHS.DESKTOP && step) {
        if (currentIndex > index) {
          setTranslateX((prev) => prev - step);
        } else if (currentIndex < index) {
          setTranslateX((prev) => prev + step);
        }
      }
      if (screenWidth > SCREEN_WIDTHS.DESKTOP && step) {
        if (currentIndex > index) {
          setTranslateX((prev) => prev - step);
        } else if (currentIndex < index) {
          setTranslateX((prev) => prev + step);
        } else {
          setTranslateX((prev) => Math.round(prev / step) * step);
        }
      }
    }
  };

  const getScale = (index: number): number => {
    if (isScrolling || isDragging) return 1.1;

    if (selectedImg !== null) {
      if (selectedImg === index) return 1.2;
      if (hoveredImg === index) return 1.1;
      return 0.9;
    }

    if (hoveredImg !== null) {
      return hoveredImg === index ? 1.1 : 0.9;
    }

    return 1;
  };

  return (
    <motion.div ref={dragRef} className={styles.imageContainer}>
      <motion.div
        ref={containerRef}
        onWheel={handleWheel}
        className={styles.content}
        animate={{
          x: -translateX,
        }}
        transition={{
          type: "keyframes",
          duration: 0.5,
          ease: "easeOut",
        }}
        onDragEnd={onDragEnd}
        onDragStart={onDragStart}
        drag="x"
        dragConstraints={dragRef}
        dragMomentum={false}
        dragControls={controls}
        onPointerDown={(event) => {
          controls.start(event);
        }}
      >
        {images.map((index, i) => {
          const isSecondToLast = i === images.length - 2;
          return (
            <motion.div
              animate={{ scale: getScale(index) }}
              onClick={() => {
                scrollToImage(index);
                handleSelectedImg(index);
              }}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              className={styles.singleImg}
              key={index}
              ref={(item) => {
                imageRefs.current[i] = item;
                if (isSecondToLast) {
                  lastImageRef.current = item;
                }
              }}
            >
              <motion.div
                transition={{ duration: 0.3 }}
                animate={{
                  marginInline: `${
                    selectedImg === index ? "3.5rem" : "2.75rem"
                  }`,
                }}
              >
                <motion.div
                  transition={{ duration: 0.3 }}
                  onMouseEnter={() => setHoveredImg(index)}
                  onMouseLeave={() => setHoveredImg(null)}
                  className={index % 2 === 0 ? styles.bigImg : styles.smallImg}
                  onViewportEnter={() => handleIndex(index)}
                >
                  <Image
                    src={`https://picsum.photos/600?random=${index}.webp`}
                    alt={`Image ${index}`}
                    width={450}
                    height={index % 2 === 0 ? 600 : 400}
                  />

                  {isSecondToLast && (
                    <motion.div
                      className={styles.singleImg}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      whileInView={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                      onViewportEnter={infiniteLoading}
                      viewport={{
                        once: false,
                      }}
                    ></motion.div>
                  )}
                </motion.div>
              </motion.div>
            </motion.div>
          );
        })}
      </motion.div>
    </motion.div>
  );
}

export default ImageContainer;
