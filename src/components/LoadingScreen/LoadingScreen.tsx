import { AnimatePresence, motion } from "framer-motion";

function LoadingScreen() {

  return (
      <motion.div
        initial={{y: 0}}
        exit={{ y: "100%"}}
        key="loadingScreenOverlay"
        transition={{ duration: 1.5, ease: "easeInOut" }}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgb(61,55,34)",
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "2rem",
          zIndex: 9999,
        }}
      >
        Kombu
      </motion.div>
  );
}

export default LoadingScreen;
