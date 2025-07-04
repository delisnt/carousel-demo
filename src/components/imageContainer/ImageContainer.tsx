import {
  AnimatePresence,
  motion,
  useDragControls,
  useMotionValue,
  type PanInfo,
} from "motion/react";
import { useFetch } from "../../hooks/useFetch";
import styles from "./ImageContainer.module.scss";
import ImageComponent from "./ImgComponent/Image";
import { useEffect, useRef, useState } from "react";
import { image } from "motion/react-client";

function ImageContainer() {
  const PAGE_NUMBER = 1;
  const [url, _setUrl] = useState(
    `https://picsum.photos/v2/list?page=${PAGE_NUMBER}&limit=10`
  );

  const { data, isPending } = useFetch(url);
  const [selectedItem, setSelectedItem] = useState<number | null>(2);
  const [hoveredImg, setHoveredImg] = useState<number | null>(null);
  const [direction, _setDirection] = useState<1 | -1>(1);
  const [isScrolling, _setIsScrolling] = useState(false);
  const [isDragging, _setIsDragging] = useState(false);
  const [visibleArray, setVisibleArray] = useState<number[]>([0, 1, 2, 3, 4]);
  const [imgWidth, setImgWidth] = useState(0);
  const [_preloadedImgs, setPreloadedImgs] = useState([
    visibleArray[0] - 1,
    ...visibleArray,
    visibleArray[visibleArray.length - 1] + 1,
  ]);
  const controls = useDragControls();
  const containerRef = useRef<HTMLDivElement>(null);
  const imagesRef = useRef<HTMLDivElement>(null);
  const isLocked = useRef(false);
  const [first, second, center, fourth, last] = visibleArray;
  const isVisible = (id: number) => {
    return id === first || id === last ? "hidden" : "";
  };

  const MEDIA_SCREEN = {
    tablet: 768,
  };

  const x = useMotionValue(0);

  useEffect(() => {
    if (visibleArray.length > 0) {
      setPreloadedImgs([
        visibleArray[0] - 1,
        ...visibleArray,
        visibleArray[visibleArray.length - 1] + 1,
      ]);
    }
  }, [visibleArray]);

  useEffect(() => {
    if (!data) return;
    const preloadImgs = async () => {
      if (visibleArray.length === 0) return;

      const width = window.innerWidth;
      const isTablet = width <= MEDIA_SCREEN.tablet;

      const max = data.length - 1;
      const prev = first - 1 < 0 ? max : first - 1;
      const next = last + 1 > max ? 0 : last + 1;

      const newPreloaded = isTablet
        ? [...visibleArray].filter(
            (id, index, arr) => id >= 0 && arr.indexOf(id) === index
          )
        : [prev, ...visibleArray, next].filter(
            (id, index, arr) => id >= 0 && arr.indexOf(id) === index
          );

      setPreloadedImgs(newPreloaded);

      const filteredData = data.filter((img) => newPreloaded.includes(+img.id));

      try {
        const imgPromises = filteredData.map((img) => {
          return new Promise((res, rej) => {
            const imgObj = new Image();
            imgObj.src = img.download_url;
            imgObj.fetchPriority = "high";
            imgObj.onload = () => res(imgObj);
            imgObj.onerror = () =>
              rej(new Error("could not fetch image: " + img.download_url));
          });
        });

        const images = await Promise.all(imgPromises);
      } catch (err) {
        console.error("Errore durante il preload:", err);
      }
    };
    preloadImgs();
  }, [visibleArray, data]);

  useEffect(() => {
    if (imagesRef.current) {
      setImgWidth(imagesRef.current.clientWidth);
    }
  }, []);

  const handleVisibleArray = (id: number) => {
    if (!data || isLocked.current) return;
    isLocked.current = true;

    console.log(id);

    const totalLength = data.length;

    // Caso 1: da [0,1,2,3,4] reset inizio
    if (
      JSON.stringify(visibleArray) === JSON.stringify([0, 1, 2, 3, 4]) &&
      id === 1
    ) {
      const newArray = [totalLength - 1, first, second, center, fourth];
      console.log(newArray);
      setVisibleArray(newArray);
      setSelectedItem(id);
      setTimeout(() => {
        isLocked.current = false;
      }, 300);
      return;
    }

    // Caso 2: da [6,7,8,9,10] reset fine
    if (
      JSON.stringify(visibleArray) === JSON.stringify([5, 6, 7, 8, 9]) &&
      id === 8
    ) {
      //[6,7,8,9,10]
      // const newArray = [9, 10, first];
      const newArray = [second, center, fourth, last, 0];
      setVisibleArray(newArray);
      setSelectedItem(id);
      setTimeout(() => {
        isLocked.current = false;
      }, 300);
      return;
    }

    // Navigazione normale
    if (id === second) {
      setSelectedItem(id);
      const newArray = [first - 1, first, second, center, fourth];
      setVisibleArray(newArray);
    } else if (id === center) {
      setSelectedItem((prev) => (prev === id ? null : id));
    } else if (id === fourth) {
      const newArray = [second, center, fourth, last, last + 1];
      setVisibleArray(newArray);
      setSelectedItem(id);
    }

    setTimeout(() => {
      isLocked.current = false;
    }, 300);
  };

  const handleDragEnd = async (_e: MouseEvent, info: PanInfo) => {
    const { offset } = info;
    const DRAG_LIMIT = 50;
    let imgToDelete = null;

    console.log(offset.x);
    console.log(offset.x < -DRAG_LIMIT);

    if (offset.x < -DRAG_LIMIT) {
      imgToDelete = fourth;
      console.log(`img to delete is ${imgToDelete}`);
    } else if (offset.x > DRAG_LIMIT) {
      imgToDelete = second;
      console.log(`img to delete is ${imgToDelete}`);
    }

    if (imgToDelete !== null) {
      handleVisibleArray(imgToDelete);
    }
  };

  const thresholdRef = useRef(10);
  const timeoutRef = useRef<number | null>(null);

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const { deltaX, deltaY } = e;
    let delta = Math.abs(deltaX) > Math.abs(deltaY) ? deltaX : deltaY;

    let imgToDelete = null;
    const threshold = thresholdRef.current;

    if (delta >= threshold) {
      imgToDelete = fourth;
    } else if (delta <= -threshold) {
      imgToDelete = second;
    }

    console.log("delta:", delta, "threshold:", threshold);

    if (imgToDelete !== null) {
      handleVisibleArray(imgToDelete);

      // Alza temporaneamente la soglia per 500ms
      thresholdRef.current = 1000; // o qualsiasi valore più alto tu voglia

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        thresholdRef.current = 10; // torna alla soglia normale
      }, 1000);
    }
  };

  const getScale = (index: number): number => {
    if (isScrolling || isDragging) return 1.1;
    if (selectedItem !== null) {
      if (selectedItem === index) return 1.3;
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
      {!isPending ? (
        <motion.div
          className={styles.imageContainer}

          dragConstraints={containerRef}
          dragMomentum={false}
          dragControls={controls}
          onPointerDown={(event) => {
            controls.start(event);
          }}
          onDragEnd={handleDragEnd}
        >
          <AnimatePresence custom={direction} initial={false}>
            {data &&
              visibleArray.map((id) => {
                const img = data.find((item) => +item.id === id);
                if (!img) return null;
                let imgId = +img.id;

                return (
                  <motion.div
                    ref={imagesRef}
                    onMouseEnter={() => setHoveredImg(imgId)}
                    onMouseLeave={() => setHoveredImg(null)}
                    className={styles.singleImg}
                    transition={{
                      duration: 0.3,
                      ease: "linear",
                    }}
                    whileInView={{ opacity: 1 }}
                    // animate={{ scale: getScale(imgId) }}
                    key={img.id}
                    onClick={() => handleVisibleArray(imgId)}
                    // onViewportLeave={() => handleVisibleArray(imgId, "scroll")}
                  >
                    <ImageComponent
                      src={img.download_url}
                      alt={`${img.author} - ${img.id}`}
                      width={450}
                      height={300}
                    />
                  </motion.div>
                );
              })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div>loading...</div>
      )}
    </motion.div>
  );
}

export default ImageContainer;
