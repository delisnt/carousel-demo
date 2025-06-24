import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  type PanInfo,
} from "motion/react";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import { useFetch } from "../../hooks/useFetch";
import { useDragControls } from "motion/react";
import styles from "./ImageContainer.module.scss";
import Image from "./ImgComponent/Image";
import useMeasure from "react-use-measure";
import { animate } from "motion";

function ImageContainer() {
  // const imageArray = Array.from({ length: 10 }, (_, i) => i + 1);
  const controls = useDragControls();
  // const dragX = useMotionValue(0);
  const screenWidth = useWindowDimensions().width;
  const SCREEN_WIDTHS = {
    MOBILE: 500,
    TABLET: 768,
    LAPTOP: 1024,
    DESKTOP: 1500,
  };
  const SCROLL_SPEED = 1;
  const WRAP_MARGIN = 50;

  const xTranslation = useMotionValue(0);

  // const [images, setImages] = useState<ImageType[] | null>([]);
  const [url, _setUrl] = useState(
    "https://picsum.photos/v2/list?page=2&limit=10"
  );
  const [selectedImg, setSelectedImg] = useState<number | null>(-1);
  const [hoveredImg, setHoveredImg] = useState<number | null>(null);
  const isAnimatingRef = useRef(false);
  const [imgIndex, setImgIndex] = useState<number>(1);
  // const [translateX, setTranslateX] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  // const [currentImgWidth, setCurrentImgWidth] = useState<number | null>(null);
  const scrollTimeout = useRef<number | null>(null);

  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dragRef = useRef<HTMLDivElement>(null);
  // const containerRef = useRef(null);
  const lastImageRef = useRef<HTMLDivElement | null>(null);
  const selectedImgRef = useRef<number | null>(null);
  const prevSelectedImgRef = useRef<number | null>(-1);
  const prevImgWidthRef = useRef<number | null>(null);
  // const isLoadingRef = useRef(false);
  // const isInView = useInView(lastImageRef, {
  //   once: false,
  //   amount: 0.3,
  // });

  const [containerRef, { width: contentWidth }] = useMeasure();
  const { data, isPending, error } = useFetch(url);

  useLayoutEffect(() => {
    selectedImgRef.current = selectedImg;
    prevSelectedImgRef.current = selectedImg;
  }, [selectedImg, prevSelectedImgRef]);

  useLayoutEffect(() => {
    if (lastImageRef.current) {
      prevImgWidthRef.current = lastImageRef.current.clientWidth;
    }
  }, [lastImageRef.current, screenWidth]);

  // loop effect
  useEffect(() => {
    const el = dragRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (contentWidth === 0) return;

      setIsScrolling(true);

      const delta =
        (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) *
        SCROLL_SPEED;

      let current = xTranslation.get();
      let next = current - delta;

      const loopWidth = contentWidth / 2;

      // Infinite scroll wrap
      if (next < -loopWidth - WRAP_MARGIN) {
        next += loopWidth;
      } else if (next > WRAP_MARGIN) {
        next -= loopWidth;
      }

      xTranslation.set(next);
      console.log(xTranslation.get());

      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      scrollTimeout.current = window.setTimeout(() => {
        setIsScrolling(false);
        snapToCenterMotion();
      }, 150);
    };

    el.addEventListener("wheel", handleWheel, { passive: false });

    return () => el.removeEventListener("wheel", handleWheel);
  }, [contentWidth]);

  useEffect(() => {
    const updateWidth = () => {
      if (lastImageRef.current) {
        console.log("help");
        const newWidth = lastImageRef.current.clientWidth;
        const oldWidth = prevImgWidthRef.current;
        const screenWidthWindow = window.innerWidth;
        const isLaptop =
          screenWidthWindow < SCREEN_WIDTHS.DESKTOP &&
          screenWidthWindow > SCREEN_WIDTHS.TABLET;
        console.log(oldWidth, newWidth);

        if (oldWidth) {
          setIsScrolling(false);
          console.log("width changed");

          let currentIndexNotSelected = Math.round(
            xTranslation.get() / oldWidth
          );

          let selectedIndex = selectedImgRef.current;
          const currentIndex =
            selectedIndex !== null ? selectedIndex : currentIndexNotSelected;
            console.log(currentIndex)

          let snapped = isLaptop
            ? currentIndex * newWidth - (screenWidthWindow - newWidth) / 2
            : currentIndex * newWidth;

          animate(xTranslation, snapped, {
            type: "tween",
            duration: 0.3
          });
        }

        prevImgWidthRef.current = newWidth;
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

  const onDragStart = () => {
    setIsDragging(true);
    setSelectedImg(null);
  };

  const onDragEnd = async (_e: MouseEvent, info: PanInfo) => {
    if (lastImageRef.current === null) return;
    setIsDragging(false);
    const imgWidth = lastImageRef.current.clientWidth;
    const { offset } = info;

    if (imgWidth) {
      let target = xTranslation.get();

      if (offset.x < -50) {
        target -= imgWidth + offset.x;
      } else if (offset.x > 50) {
        target += imgWidth - offset.x;
      }

      setIsAnimating(true); // Inizio animazione
      await animate(xTranslation, target, {
        type: "tween",
        duration: 0.3,
      });
      setIsAnimating(false); // Fine animazione
    }

    snapToCenterMotion();
  };

  useAnimationFrame(() => {
    if (contentWidth === 0) return;

    const loopWidth = contentWidth / 2;
    const current = xTranslation.get();
    const wrapped =
      (((current % loopWidth) + loopWidth) % loopWidth) - loopWidth;

    xTranslation.set(wrapped);
  });

  // const getCenterIndex = (
  //   xTranslation: number,
  //   imageWidth: number,
  //   totalImages: number
  // ) => {
  //   const offset = Math.round(Math.abs(xTranslation) / imageWidth);
  //   const centerIndex = (offset + 1) % totalImages;
  //   return centerIndex;
  // };

  // const infiniteLoading = () => {

  //   if (isLoadingRef.current) return;
  //   isLoadingRef.current = true;

  //   setTimeout(() => {
  //     setImages((prev) => {
  //       if (prev.length > 40 && currentImgWidth) {
  //         console.log(`infinite loading prev:${prev.length}`);
  //         setTranslateX(0);
  //         return prev.slice(-5);
  //       }
  //       const start = prev.length;
  //       const newBatch = Array.from({ length: 10 }, (_, i) => start + i + 1);
  //       return [...prev, ...newBatch];
  //     });

  //     isLoadingRef.current = false;
  //   }, 200);
  // };

  // const snapToCenter = () => {
  //   const isResponsive =
  //     screenWidth < SCREEN_WIDTHS.DESKTOP && screenWidth > SCREEN_WIDTHS.TABLET;

  //   setIsScrolling(false);
  //   const offsets = {
  //     selected: screenWidth > SCREEN_WIDTHS.DESKTOP ? 2 : 1,
  //   };

  //   if (!currentImgWidth) return;

  //   setTranslateX((prev) => {
  //     let currentIndex = Math.round(prev / currentImgWidth);
  //     let snapped = isResponsive
  //       ? currentIndex * currentImgWidth - (screenWidth - currentImgWidth) / 2
  //       : currentIndex * currentImgWidth;

  //     setSelectedImg(currentIndex + offsets.selected);

  //     return snapped;
  //   });
  // };

  const snapToCenterMotion = () => {
    if (!data || !lastImageRef.current) return;
    const oldWidth = prevImgWidthRef.current;
    const isResponsive =
      screenWidth < SCREEN_WIDTHS.DESKTOP && screenWidth > SCREEN_WIDTHS.TABLET;
    const imgWidth = lastImageRef.current.clientWidth;
    // const offsets = {
    //   selected: screenWidth > SCREEN_WIDTHS.DESKTOP ? 2 : 1,
    // };

    const x = xTranslation.get();

    setIsScrolling(false);

    if (oldWidth) {
      let currentIndex = Math.round(x / imgWidth);
      let snapped = isResponsive
        ? currentIndex * imgWidth - (screenWidth - imgWidth) / 2
        : currentIndex * imgWidth;
      xTranslation.set(snapped);
      console.log(`snapped at ${snapped} index: ${currentIndex}`);
      setSelectedImg(currentIndex - 1);
      console.log(`current index: ${currentIndex}`);
    }
  };

  const handleSelectedImg = (index: number) => {
    if (isDragging) return;
    setSelectedImg((prev) => (prev === index ? null : index));
  };

  // const scrollToImage = (index: number) => {
  //   if (isScrolling) return;

  //   const offsetResponsive = screenWidth > SCREEN_WIDTHS.DESKTOP ? 2 : 1;
  //   let selected;

  //   if (currentImgWidth && screenWidth > SCREEN_WIDTHS.TABLET) {
  //     let currentIndex = Math.round(xTranslation.get() / currentImgWidth);
  //     console.log(`currentImgWidth: ${currentImgWidth}`);
  //     console.log(`currentIndex: ${currentIndex}`);

  //     // Lunghezza dello step è uguale alla lunghezza del contenitore content singolo
  //     const step = currentImgWidth;

  //     if (screenWidth < SCREEN_WIDTHS.DESKTOP && step) {
  //       if (currentIndex > index) {
  //         selected = xTranslation.get() - step;
  //       } else if (currentIndex < index) {
  //         selected = xTranslation.get() + step;
  //       }
  //     }
  //     if (screenWidth > SCREEN_WIDTHS.DESKTOP && step) {
  //       if (currentIndex > index) {
  //         selected = xTranslation.get() - step;
  //       } else if (currentIndex < index) {
  //         selected = xTranslation.get() + step;
  //       }
  //     }
  //     if (selected) {
  //       xTranslation.set(selected);
  //     }

  //   }
  // };

  // const scrollToImgMotion = (currentIndex: number, e: React.MouseEvent) => {
  //   if (isAnimatingRef.current || isDragging || !data || !lastImageRef.current) return;

  //   isAnimatingRef.current = true;
  //   setIsAnimating(true);

  //   const step = lastImageRef.current.clientWidth;
  //   const x = e.clientX;
  //   const screenWidth = window.innerWidth;

  //   let newValue = xTranslation.get();

  //   if (x < screenWidth / 3) {
  //     newValue += step;
  //   } else if (x > (2 * screenWidth) / 3) {
  //     newValue -= step;
  //   } else {
  //     // clic centrale
  //     isAnimatingRef.current = false;
  //     setIsAnimating(false);
  //     return;
  //   }

  //   const controls = animate(xTranslation, newValue, {
  //     type: "tween",
  //     duration: 0.3,
  //     ease: "easeOut",
  //   });

  //   // fallback in caso l’animazione venga interrotta
  //   const reset = () => {
  //     isAnimatingRef.current = false;
  //     setIsAnimating(false);
  //     snapToCenterMotion()
  //   };

  //   controls.finished.then(reset).catch(reset);

  //   // fallback di sicurezza extra dopo tot ms
  //   setTimeout(reset, 500);
  // };


  const scrollToImgMotion = async (
    clickedIndex: number,
    e: React.MouseEvent
  ) => {
    if (isDragging || !data || !lastImageRef.current || isAnimatingRef.current)
      return;

    const step = lastImageRef.current.clientWidth;
    const totalItems = data.length;
    const logicalClickedIndex = -clickedIndex;
    console.log(logicalClickedIndex);

    // Salva il selected precedente se presente
    // if (selectedImg !== null) {
    //   prevSelectedImgRef.current = selectedImg;
    // }

    const indx = prevSelectedImgRef.current ?? 0;

    // if (logicalClickedIndex === indx) {
    //   setSelectedImg(logicalClickedIndex);
    //   return;
    // }

    let diff = logicalClickedIndex - indx;

    // Gestione loop infinito
    if (diff > totalItems / 2) diff -= totalItems;
    if (diff < -totalItems / 2) diff += totalItems;

    const delta = diff * step;

    try {
      await animate(xTranslation, xTranslation.get() + delta, {
        ease: "easeOut",
        type: "tween",
        duration: 0.4,
      });

      setImgIndex((prev) => prev + diff);
      setSelectedImg(logicalClickedIndex);
      snapToCenterMotion();
    } catch (error) {
      console.warn("Animation error:", error);
    }

    console.log({
      logicalClickedIndex,
      selectedImg,
    });
  };

  const getScale = (index: number): number => {
    // console.log(`selected image: ${selectedImg} index: ${index}`)
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
        className={styles.content}
        style={{ x: xTranslation }}
        // animate={{
        //   x: -xTranslation,
        // }}
        // transition={{
        //   type: "tween",
        //   duration: 0.5,
        //   ease: "easeOut",
        // }}
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
        {isPending && <div>Loading....</div>}
        {data
          ? [...data, ...data].map((img, index) => {
              const iteration = index < data.length ? 0 : 1;
              const key = `${img.id}-${iteration}`;
              return (
                <motion.div
                  animate={{ scale: getScale(-index) }}
                  onClick={(e) => {
                    handleSelectedImg(-index);
                    scrollToImgMotion(index, e);
                  }}
                  className={styles.singleImg}
                  key={key}
                  ref={(item) => {
                    imageRefs.current[index] = item;
                    if (index === data.length - 2) {
                      lastImageRef.current = item;
                    }
                  }}
                >
                  <motion.div
                  // animate={{
                  //   marginInline: `${
                  //     selectedImg === index ? "3.5rem" : "2.75rem"
                  //   }`,
                  // }}
                  >
                    <motion.div
                      onMouseEnter={() => setHoveredImg(-index)}
                      onMouseLeave={() => setHoveredImg(null)}
                      className={
                        index % 2 === 0 ? styles.bigImg : styles.smallImg
                      }
                    >
                      <Image
                        src={img.download_url}
                        alt={`Image ${index}`}
                        width={450}
                        height={index % 2 === 0 ? 600 : 400}
                      />
                    </motion.div>
                  </motion.div>
                </motion.div>
              );
            })
          : error && <div>{error}</div>}
      </motion.div>
    </motion.div>
  );
}

export default ImageContainer;
