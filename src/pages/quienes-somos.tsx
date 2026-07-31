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
                        <a
                            href="https://www.romanaebanisteria.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-6 right-6 flex flex-row items-center gap-3 hover:opacity-80 transition-opacity duration-200"
                        >
                            <div
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg animate-bounce"
                                style={{ backgroundColor: "#0a0a0a", color: "#ffffff", whiteSpace: "nowrap" }}
                            >
                                <span>Conoce más de nuestro aliado</span>
                                <span>→</span>
                            </div>
                            <Image
                                src="/RomanaEbanistería.png"
                                alt="Romana Ebanistería"
                                width={140}
                                height={56}
                                className="object-contain"
                            />
                        </a>
                    </div>
                </div>

                <Footer />
            </main>
        </>
    )
}
