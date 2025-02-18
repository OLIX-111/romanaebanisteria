import GalleryGrid from "@/components/gallery/GalleryGrid";
import GalleryHero from "@/components/gallery/GalleryHero";
import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";

const Gallery = ()=>{
    return(
        <>
            <Header enableScroll/>
            <GalleryHero/>
            <GalleryGrid/>
            <Footer/>
        </>
    )
}

export default Gallery;