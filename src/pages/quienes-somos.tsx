import { Open_Sans } from "next/font/google"
import Image from "next/image"
import Head from "next/head"
import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"

const openSans = Open_Sans({ subsets: ["latin"] })

export default function QuienesSomos() {
    return (
        <>
            <Head>
                <title>Quiénes Somos | La Fabbrica</title>
                <link rel="icon" type="image/png" href="/isotipo.png" />
            </Head>
            <main className={`${openSans.className} bg-black min-h-screen`}>
                <Header enableScroll={false} />

                <div className="pt-24 w-full">
                    <div className="relative w-full">
                        <Image
                            src="/padre de pillier.png"
                            alt="Domingo Pilier — Fundador"
                            width={1528}
                            height={772}
                            priority
                            className="w-full h-auto"
                        />
                        <div className="absolute top-6 right-6 flex flex-col items-end gap-1">
                            <div
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg animate-bounce"
                                style={{ backgroundColor: "#0a0a0a", color: "#ffffff", whiteSpace: "nowrap" }}
                            >
                                <span>Visita nuestro sitio</span>
                                <span>↓</span>
                            </div>
                            <a
                                href="https://www.romanaebanisteria.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <Image
                                    src="/RomanaEbanistería.png"
                                    alt="Romana Ebanistería"
                                    width={140}
                                    height={56}
                                    className="object-contain hover:opacity-80 transition-opacity duration-200"
                                />
                            </a>
                        </div>
                    </div>
                </div>

                <Footer />
            </main>
        </>
    )
}
