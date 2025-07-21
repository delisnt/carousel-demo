import { useState, useCallback } from "react";
import {
  type useImageInteractionsResult,
  type ImageInteractions,
} from "../lib/types";

export const useImageInteractions = (): useImageInteractionsResult => {
  const [imgInteractions, setImgInteractions] = useState<ImageInteractions>({
    selectedItem: 2,
    hoveredImg: null,
    slideDirection: "right",
    isDragging: false,
    visibleArray: [],
  });

  const handleSetSelectedItem = useCallback((id: number | null) => {
    console.log(id);
    setImgInteractions((prev) => ({ ...prev, selectedItem: id }));
  }, []);

  const handleSetHoveredImg = useCallback((id: number | null) => {
    setImgInteractions((prev) => ({ ...prev, hoveredImg: id }));
  }, []);

  const handleSetIsDragging = useCallback((status: boolean) => {
    setImgInteractions((prev) => ({ ...prev, isDragging: status }));
  }, []);

  const handleSetSlideDirection = useCallback(
    (direction: "right" | "center" | "left") => {
      setImgInteractions((prev) => ({ ...prev, slideDirection: direction }));
    },
    []
  );

  const handleSetVisibleArray = useCallback((arr: number[]) => {
    setImgInteractions((prev) => ({ ...prev, visibleArray: arr }));
  }, []);

  const handleNavigationHook = (
    direction: "left" | "right" | "center",
    visibleArr: number[] | null,
    id: number | null
  ) => {
    handleSetSlideDirection(direction);

    if (direction === "center") {
      handleSetSelectedItem(id);
      return;
    }
    if (id !== null && visibleArr !== null) {
      handleSetVisibleArray(visibleArr);
      handleSetSelectedItem(id);
    } else {
      console.warn(
        "ID or visibleArray missing for 'left' or 'right' navigation."
      );
    }
  };

  const handleResetInteractions = useCallback(() => {
    setImgInteractions({
      selectedItem: null,
      hoveredImg: null,
      slideDirection: "center",
      isDragging: false,
      visibleArray: [],
    });
  }, []);

  return [
    imgInteractions,
    {
      handleSetSelectedItem,
      handleSetHoveredImg,
      handleSetIsDragging,
      handleSetSlideDirection,
      handleSetVisibleArray,
      handleNavigationHook,
      handleResetInteractions,
    },
  ];
};
