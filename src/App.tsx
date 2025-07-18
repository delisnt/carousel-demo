import ImageContainer from "./components/imageContainer/ImageContainer";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import styles from "./app.module.scss";
import { useEffect, useState } from "react";
import { useFetch } from "./hooks/useFetch";
import { getWrappedSlice } from "./lib/utils";
import { AnimatePresence } from "motion/react";

function App() {
  const url = `https://api.nekosapi.com/v4/images?limit=10`;
  const [selectedItem, setSelectedItem] = useState<number | null>(2);
  const [visibleArray, setVisibleArray] = useState<number[]>([]);
  const [preloadedImgs, setPreloadedImgs] = useState<number[]>([]);
  const [slideDirection, setSlideDirection] = useState<
    "right" | "left" | "center"
  >("right");

  const { data, isPending } = useFetch(url);
  console.log({ isPending });
  const MEDIA_SCREEN = {
    tablet: 768,
    mobile: 600,
  };

  // TODO FINISCI LIFT STATE

  useEffect(() => {
    if (!data || visibleArray.length === 0) {
      return;
    }
    const width = window.innerWidth;
    const isMobile = width <= MEDIA_SCREEN.mobile;
    const preloadRange = isMobile ? 2 : 3;
    const centerIndex = data.findIndex((img) => img.id === selectedItem);
    const newPreloadedIds = getWrappedSlice(
      data.map((_, i) => i),
      centerIndex,
      preloadRange
    );
    const preloadIds = newPreloadedIds.map((i) => data[i].id);
    setPreloadedImgs(preloadIds);

    const filteredData = newPreloadedIds.map((index) => data[index]);
    console.log(filteredData);

    const preloadImages = async () => {
      try {
        const imgPromises = filteredData.map((img) => {
          return new Promise((res, rej) => {
            const imgObj = new Image();
            imgObj.src = img.url;
            imgObj.fetchPriority = "high";
            imgObj.onload = () => {
              res(imgObj);
            };
            imgObj.onerror = () =>
              rej(new Error("could not fetch image: " + img.url));
          });
        });
        console.log(
          "Preloading:",
          newPreloadedIds.map((id) => data[id]?.id)
        );
        console.log("Rendering visible:", visibleArray);

        const images = await Promise.all(imgPromises);
        console.log(images);
      } catch (err) {
        console.error("Errore durante il preload:", err);
      }
    };

    preloadImages();
  }, [visibleArray]);

  useEffect(() => {
    if (!data || data.length === 0) return;
    const startingVisible = data.slice(0, 5).map((item) => item.id);
    setVisibleArray(startingVisible);
    setSelectedItem(startingVisible[2]);
  }, [data]);

  const handleNavigation = (
    direction: "left" | "right" | "center",
    visibleArr: number[] | null,
    id: number | null
  ) => {
    setSlideDirection(direction);

    if (direction === "center") {
      setSelectedItem(id);
      return;
    }
    if (id !== null && visibleArr !== null) {
      setVisibleArray(visibleArr);
      setSelectedItem(id);
    } else {
      console.warn(
        "ID or visibleArray missing for 'left' or 'right' navigation."
      );
    }
  };

  return (
    <main className={styles.mainContainer}>
      <AnimatePresence mode="wait">
        {data && (
          <ImageContainer
            data={data}
            handleNavigation={handleNavigation}
            preloadedImgs={preloadedImgs}
            selectedItem={selectedItem}
            sliderDirection={slideDirection}
            visibleArray={visibleArray}
          />
        )}
        {isPending && <LoadingScreen key="appLoadingScreen" />}
      </AnimatePresence>
    </main>
  );
}

export default App;
