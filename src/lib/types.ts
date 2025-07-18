export interface ImageProps {
    src: string,
    alt: string,
    width: number,
    height: number,
    scale: number
}

export interface LoadingScreenProps {
    isPending: boolean;
    
  }  


export interface ImageContainerProps {
    selectedItem: number | null; 
    data: ApiResult[]; 
    visibleArray: number[]; 
    preloadedImgs: number[]; 
    sliderDirection: "left" | "right" | "center"; 
    handleNavigation: (
        direction: "left" | "right" | "center",
        newVisibleArray: number[] | null, 
        newSelectedItem: number | null,
    ) => void;
  }

export interface ApiResult {
    "id": number,
    "url": string,
    "rating": string,
    "color_dominant": number[
    ],
    "color_palette": number[][

    ],
    "artist_name": null | string,
    "tags": string[
    ],
    "source_url": null | string
}

export interface ImageType {
    id: string,
    author: string,
    width: number,
    height: number,
    download_url: string,
    url: string
}
