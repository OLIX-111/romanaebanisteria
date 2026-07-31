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

                <div className="pt-24 w-full flex justify-center">
                    <Image
                        src="/padre de pillier.png"
                        alt="Domingo Pilier — Fundador"
                        width={1528}
                        height={772}
                        priority
                        className="w-full h-auto"
                    />
                </div>

                <Footer />
            </main>
        </>
    )
}
