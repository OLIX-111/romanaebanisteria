import Link from "next/link"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer";
import { useRouter } from "next/router";

const AboutUs = () => {
    const { ref, inView } = useInView({
        threshold: 0.3,
    });

    const { ref: refTwo, inView: inViewTwo } = useInView({
        threshold: 0.1,
        triggerOnce: true,
    });

    return (
        <div className="px-4 lg:px-8">
            {/* Hero Container */}
            <div className="mx-auto w-full container py-16 lg:py-24">
                {/* Component */}
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, y: 50 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="grid items-center justify-items-start gap-8 sm:gap-20 lg:grid-cols-2"
                >
                    <div className="flex flex-col">
                        <h2 className="mt-2 text-gray-900 text-3xl md:text-4xl leading-tight font-semibold">
                            {"Acerca de ROMAna Ebanistería"}
                        </h2>
                        <p className="mb-6 mt-6 text-sm text-gray-600 sm:text-lg md:mb-10 lg:mb-12">
                            {
                                "Con más de 48 años de trayectoria, nos enorgullecemos de ser la fábrica de ebanistería y carpintería en aluminio más grande de La Romana. Fundada en 1977, ROMAna Ebanistería ha evolucionado desde la fabricación tradicional de puertas y muebles en madera, hasta convertirse en un referente en la innovación con materiales modernos como melamina y MDF."
                            }
                            <br />
                            <br />
                            {
                                "Hoy, colaboramos con desarrolladores inmobiliarios, cadenas hoteleras y proyectos residenciales de alto nivel, brindando soluciones integrales y personalizadas. Nuestro compromiso es ofrecer resultados excepcionales, cuidando cada detalle para garantizar precisión, calidad y durabilidad."
                            }
                        </p>
                        <div className="flex items-center">
                            <Link href="/contact-us">
                                <button
                                    className="
                                        flex items-center shadow-md bg-primary text-white
                                        px-6 text-base py-4 font-medium rounded
                                        hover:px-8 duration-200
                                    "
                                >
                                    {"Conoce mas"}
                                </button>
                            </Link>
                        </div>
                    </div>
                    {/* Hero Image */}
                    <div className="flex flex-row-reverse w-full">
                        <img
                            src="/home/about_romana_ebanisteria.jpg"
                            alt="ROMAna Ebanistería - Más de 48 años de trayectoria"
                            className="inline-block xl:h-[36rem] w-full max-w-2xl object-cover xl:rounded-tl-[10rem] shadow-md"
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default AboutUs;
