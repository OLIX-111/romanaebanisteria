import { motion } from "framer-motion";
import Link from "next/link";
import { useTranslation } from "@/hook/UseTranslation";

export default function Hero() {

    const dict = useTranslation()

    return (
        <div
            className="relative isolate overflow-hidden bg-cover bg-fixed bg-no-repeat min-h-[88vh]"
            style={{ backgroundImage: "url('/hero_romana_ebanisteria.jpg')", backgroundPosition: "0px 0px" }}
        >
            <div
                className="hidden sm:absolute sm:-top-10 sm:right-1/2 sm:-z-10 sm:mr-10 sm:block sm:transform-gpu sm:blur-3xl"
                aria-hidden="true"
            >
                <div
                    className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-secondary to-primary opacity-20"
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                />
            </div>
            <div
                className="absolute -top-52 left-1/2 -z-10 -translate-x-1/2 transform-gpu blur-3xl sm:top-[-28rem] sm:ml-16 sm:translate-x-0 sm:transform-gpu"
                aria-hidden="true"
            >
                <div
                    className="aspect-[1097/845] w-[68.5625rem] bg-gradient-to-tr from-secondary to-primary opacity-20"
                    style={{
                        clipPath:
                            'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
                    }}
                />
            </div>
            <div
                className="
                    absolute top-0 left-0 w-full h-full -z-20
                    bg-gradient-to-b from-slate-900/30 to-blue-950/20
                "
            />
            <div
                className="
                    absolute top-0 left-0 w-full h-full -z-10
                    bg-gradient-to-b from-slate-900/60 to-gray-950/20 lg:to-gray-950/50
                "
            />

            <motion.div
                initial={{ opacity: 0, y: 20 }} // Estado inicial: invisible y ligeramente hacia abajo
                animate={{ opacity: 1, y: 0 }} // Anima hacia opacidad completa y posición original
                transition={{ duration: 0.6 }} // Duración de la transición en segundos

                className="
                    mx-auto w-full max-w-6xl 
                    px-5 md:px-10 
                    pb-16 md:pb-24 lg:pb-28 2xl:pb-36 
                    pt-36 md:pt-48 lg:pt-44 2xl:pt-48
                "
            >
                <div className="mx-auto mb-12 w-full max-w-6xl text-center md:mb-16 lg:mb-20">
                    <h1 className="
                    mb-4 
                    text-[1.8rem] sm:text-[3rem] md:text-[3rem] lg:text-[3.4rem]
                    w-full font-semibold md:font-bold 
                    text-gray-50
                    ">
                        {dict.heroTitle}
                    </h1>
                    <p className="mx-auto m-5 text-lg mb-12 lg:mb-8 text-gray-200">
                        {dict.heroDescription}
                    </p>
                    <div className="flex flex-col lg:flex-row lg:justify-center lg:items-end w-full mx-auto lg:gap-4 gap-6">
                        <Link href="/store">
                            <button
                                className="
                                    flex items-center shadow-md bg-primary text-white 
                                    px-6 text-lg py-4 font-medium rounded hover:px-8 duration-200
                                    border border-primary w-full text-center justify-center
                                "
                            >
                                {dict.heroCallToAction1}
                            </button>
                        </Link>
                        <Link href="/#contact">
                            <button
                                className="
                                    flex items-center shadow-md bg-[#111]/80 border text-white 
                                    px-6 text-lg py-4 font-medium rounded hover:px-8 duration-200
                                    w-full text-center justify-center
                                "
                            >
                                {dict.heroCallToAction2}
                            </button>
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    )
}