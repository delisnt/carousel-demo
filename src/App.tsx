import ImageContainer from "./components/imageContainer/ImageContainer";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import styles from "./app.module.scss";
import { useEffect, useState } from "react";
import { useFetch } from "./hooks/useFetch";
import { getWrappedSlice } from "./lib/utils";

function App() {
  const url = `https://api.nekosapi.com/v4/images?limit=10`;
  const [selectedItem, setSelectedItem] = useState<number | null>(2);
  const [visibleArray, setVisibleArray] = useState<number[]>([]);
  const [preloadedImgs, setPreloadedImgs] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const { data } = useFetch(url);
  const MEDIA_SCREEN = {
    tablet: 768,
    mobile: 600,
  };


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

  return (
    <main className={styles.mainContainer}>
      <LoadingScreen />
      <ImageContainer />
    </main>
  );
}

export default App;
