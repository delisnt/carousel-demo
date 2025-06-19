import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValue, type PanInfo } from "motion/react";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import { useFetch } from "../../hooks/useFetch";
import { useDragControls } from "motion/react";
import styles from "./ImageContainer.module.scss";
import Image from "./ImgComponent/Image";
import useMeasure from "react-use-measure";

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

  const xTranslation = useMotionValue(0);

  // const [images, setImages] = useState<ImageType[] | null>([]);
  const [url, _setUrl] = useState(
    "https://picsum.photos/v2/list?page=2&limit=10"
  );
  const [selectedImg, setSelectedImg] = useState<number | null>(-1);
  const [hoveredImg, setHoveredImg] = useState<number | null>(null);
  // const [_imgIndex, setImgIndex] = useState<number[]>([]);
  // const [translateX, setTranslateX] = useState<number>(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
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
  }, [selectedImg]);

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
      if (contentWidth === 0) return;

      setIsScrolling(true);
      e.preventDefault();

      const delta =
        (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) *
        SCROLL_SPEED;

      loopImgs(delta);
      console.log(xTranslation.get())

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
        const newWidth = lastImageRef.current.clientWidth;
        const oldWidth = prevImgWidthRef.current;
        const screenWidthWindow = window.innerWidth;
        const isLaptop =
          screenWidthWindow < SCREEN_WIDTHS.DESKTOP &&
          screenWidthWindow > SCREEN_WIDTHS.TABLET;

        if (oldWidth !== newWidth && oldWidth) {
          setIsScrolling(false);
          console.log('width changed')
          // const offsets = {
          //   selected: screenWidthWindow > SCREEN_WIDTHS.DESKTOP ? 2 : 1,
          // };
          let currentIndexNotSelected = Math.round(
            xTranslation.get() / oldWidth
          );

          let selectedIndex = selectedImgRef.current;
          const currentIndex =
            selectedIndex !== null ? selectedIndex : currentIndexNotSelected;
          let snapped = isLaptop
            ? currentIndex * newWidth - (screenWidthWindow - newWidth) / 2
            : currentIndex * newWidth;
          xTranslation.set(snapped);
        }
        // Aggiorna i riferimenti
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

  // const onDragEnd = (e: MouseEvent, info: PanInfo) => {
  //   setIsDragging(false);
  //   setSelectedImg(null);

  //   const { offset } = info;

  //   if (currentImgWidth) {
  //     const forward = xTranslation.get() - currentImgWidth;
  //     const backwards = xTranslation.get() + currentImgWidth;
  //     if (offset.x > 1) {
  //       xTranslation.set(backwards);
  //     } else if (offset.x < -1) {
  //       xTranslation.set(forward);
  //     }
  //     snapToCenterMotion();
  //   }
  // };

  // const handleDragEnd = (event: MouseEvent | TouchEvent, info: any) => {
  //   const dragOffset = info.offset.x; // Total distance dragged horizontally
  //   if (!currentImgWidth) return;
  //   let targetDelta = 0; // This will be the delta we pass to loopImgs

  //   if (dragOffset > 20) {
  //     targetDelta = currentImgWidth;
  //   } else if (dragOffset < -20) {
  //     targetDelta = -currentImgWidth;
  //   }

  //   if (targetDelta !== 0) {
  //     loopImgs(targetDelta);
  //   }
  //   scrollTimeout.current = window.setTimeout(() => {
  //     setIsScrolling(false);
  //   }, 150); // Adjust delay as needed
  // };

  // const handleIndex = (index: number) => {
  //   setImgIndex((prev) => {
  //     const newIndexList = [...prev, index];
  //     return newIndexList.slice(-3);
  //   });
  //   console.log(_imgIndex);
  // };

  const loopImgs = (delta: number) => {
    let current = xTranslation.get();
    let next = current - delta;

    const loopWidth = contentWidth / 2;

    // Infinite scroll wrap
    if (next < -loopWidth) {
      next += loopWidth;
    } else if (next > 1) {
      next -= loopWidth;
    }

    xTranslation.set(next);
  };

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
    const oldWidth = prevImgWidthRef.current;
    const isResponsive =
      screenWidth < SCREEN_WIDTHS.DESKTOP && screenWidth > SCREEN_WIDTHS.TABLET;
    if (!lastImageRef.current) return;
    const imgWidth = lastImageRef.current.clientWidth;
    // const offsets = {
    //   selected: screenWidth > SCREEN_WIDTHS.DESKTOP ? 2 : 1,
    // };

    setIsScrolling(false);

    if (oldWidth) {
      let currentIndex = Math.round(xTranslation.get() / imgWidth);
      if (currentIndex === -10) {
        currentIndex = -0
      }
      console.log(currentIndex)

      let snapped = isResponsive
        ? currentIndex * imgWidth - (screenWidth - imgWidth) / 2
        : currentIndex * imgWidth;
      console.log(`snapped at ${snapped} index: ${currentIndex}`)
      xTranslation.set(snapped);
      handleSelectedImg(currentIndex - 1);
    }

    console.log(selectedImg);
  };

  const handleSelectedImg = (index: number) => {
    setSelectedImg((prev) => (prev === index ? null : index));
    console.log('selected')
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

  const scrollToImgMotion = (newImgIndex: number) => {
    const prevIndex = prevSelectedImgRef.current;
    console.log("Previous:", prevIndex, "New:", newImgIndex);

    const step = lastImageRef.current?.clientWidth;
    console.log(step);

    if (prevIndex !== null && step) {
      if (newImgIndex < prevIndex) {
        xTranslation.set(xTranslation.get() - step);
        console.log("Moved forward" + xTranslation.get());
      } else if (newImgIndex > prevIndex) {
        xTranslation.set(xTranslation.get() + step);
        console.log("Moved backward" + xTranslation.get());
      } else {
        console.log("Same image selected");
      }
    }

    prevSelectedImgRef.current = newImgIndex;
    console.log(newImgIndex)
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
        transition={{
          type: "tween",
          duration: 0.5,
          ease: "easeOut",
        }}
        // onDragEnd={handleDragEnd}
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
                  onClick={() => {
                    handleSelectedImg(-index)
                    scrollToImgMotion(-index);
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
                      // onViewportEnter={() => handleIndex(index)}
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
