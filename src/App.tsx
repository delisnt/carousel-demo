import ImageContainer from "./components/imageContainer/ImageContainer";
import LoadingScreen from "./components/LoadingScreen/LoadingScreen";
import styles from './app.module.scss'



function App() {
  return (
    <main className={styles.mainContainer}>
        <LoadingScreen />
        <ImageContainer />
    </main>
  );
}

export default App;
