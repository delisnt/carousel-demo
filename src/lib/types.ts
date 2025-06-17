export interface ImageProps {
    src: string,
    alt: string,
    width: number,
    height: number,
}

export type Index = {
    index: number;
}

export interface ImageType {
    id: string,
    author: string,
    width: number,
    height: number,
    download_url: string,
    url: string
}