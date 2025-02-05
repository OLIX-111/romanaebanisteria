import Link from "next/link"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"

const WhyUs = () => {
    const { ref, inView } = useInView({
        threshold: 0.2,
    });

    return (
        <div className="px-4 lg:px-8">
            {/* Hero Container */}
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 50 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mx-auto w-full container py-16 lg:py-24"
            >
                {/* Component */}
                <div className="grid items-center justify-items-start gap-8 sm:gap-20 lg:grid-cols-2">
                    {/* Hero Image */}
                    <div className="flex w-full">
                        <img
                            src="/home/whyus_romana_ebanisteria.jpg"
                            alt="ROMAna Ebanistería - Por qué elegirnos"
                            className="inline-block xl:h-[36rem] w-full max-w-2xl object-cover xl:rounded-tr-[10rem] shadow-md"
                        />
                    </div>
                    {/* Hero Content */}
                    <div className="flex flex-col">
                        {/* Hero Title */}
                        
                        <h2 className="mt-2 mb-5 text-gray-900 text-3xl md:text-4xl leading-tight font-semibold">
                            {"¿Por qué elegirnos?"}
                        </h2>
                        <p className="mb-6 text-sm text-gray-600 sm:text-lg md:mb-10 lg:mb-12">
                            {
                                "Con más de 48 años de trayectoria, somos la fábrica de ebanistería y carpintería en aluminio más grande de La Romana. Nos distinguimos por integrar innovación, precisión y calidad en cada proyecto, ofreciendo soluciones a gran escala y trabajos personalizados para desarrolladores, hoteleros y propietarios que exigen acabados de primer nivel."
                            }
                        </p>
                        {/* Hero Button */}
                        {/* <div className="flex items-center">
                            <Link href="/contact-us">
                                <button
                                    className="
                                        flex items-center shadow-md bg-primary text-white
                                        px-6 text-base py-4 font-medium rounded hover:px-8 duration-200
                                    "
                                >
                                    {"Contáctanos hoy"}
                                </button>
                            </Link>
                        </div> */}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}

export default WhyUs
