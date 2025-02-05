"use client"

import { useTranslation } from "@/hook/UseTranslation"
import { useRouter } from "next/router"
import { useEffect, useState, Fragment } from "react"
import { fetchEmpresasByType } from "../../../sanity/sanityQueries"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronDownIcon, Globe, MenuIcon, X, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { Dialog, Disclosure, Transition, Menu } from "@headlessui/react"

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

export default function Header() {
  const dict = useTranslation()
  const { header } = dict
  const router = useRouter()
  const { locale }: any = router
  const [scrollPosition, setScrollPosition] = useState(0)
  const [empresas, setEmpresas] = useState([])
  const [proyectos, setProyectos] = useState([])
  const [marcas, setMarcas] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const empresasData = await fetchEmpresasByType("empresa", locale)
      const proyectosData = await fetchEmpresasByType("proyecto", locale)
      const marcasData = await fetchEmpresasByType("marca", locale)
      setEmpresas(empresasData)
      setProyectos(proyectosData)
      setMarcas(marcasData)
    }
    fetchData()
  }, [locale])

  const changeLanguage = (newLocale: "en" | "es") => {
    if (newLocale !== locale) {
      router.push(router.pathname, router.asPath, { locale: newLocale })
    }
  }

  // Variantes para el header
  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  }

  // Variantes para el menú móvil
  const mobileMenuVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2, ease: "easeIn" } },
  }

  const isScrolled = scrollPosition > 50

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className={`sticky top-0 z-50 transition-colors duration-300 backdrop-blur-md px-4 lg:px-8 ${
        isScrolled ? "bg-white/95 shadow-lg" : "bg-transparent"
      }`}
    >
      <nav className="mx-auto container">
        {/* ===== MOBILE HEADER ===== */}
        <div className="lg:hidden flex items-center justify-between py-4">
          {/* Botón CTA a la derecha */}
          <div className="w-1/3">
            {/* <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-1 text-gray-800 hover:text-gray-900">
                <Globe className="w-5 h-5" />
                <span className="uppercase">{locale}</span>
                <ChevronDownIcon className="w-4 h-4" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Menu.Items className="absolute left-0 mt-2 w-20 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => changeLanguage("en")}
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "block w-full text-left px-4 py-2 text-sm text-gray-700",
                        )}
                      >
                        EN
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => changeLanguage("es")}
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "block w-full text-left px-4 py-2 text-sm text-gray-700",
                        )}
                      >
                        ES
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu> */}
            <motion.button
                  className="
                    bg-primary text-white rounded-full 
                    transition-transform flex items-center justify-center h-12 w-12
                    "
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart className="h-6 w-6" />
                </motion.button>
          </div>
          {/* Logo centrado */}
          <Link href="/" className="flex-shrink-0 w-1/3 flex justify-center">
            <span className="sr-only">Logo</span>
            <Image src="/RomanaEbanistería.png" alt="Logo" width={120} height={50} />
          </Link>
          {/* Botón de menú a la izquierda */}
          <button
            type="button"
            className="p-2 text-gray-800 w-1/3 flex justify-end"
            onClick={() => setMobileMenuOpen(true)}
          >
            <MenuIcon className="h-8 w-8" />
          </button>
        </div>
        {/* ===== DESKTOP HEADER ===== */}
        <div className="hidden lg:flex items-center justify-between py-4">
          <div className="flex items-center">
            <Link href="/" className="">
              <span className="sr-only">Logo</span>
              <Image src="/RomanaEbanistería.png" alt="Logo" width={150} height={50} />
            </Link>
          </div>
          <div className="flex space-x-8 text-gray-800 text-base font-medium">
            <Link href="/">{header?.nav?.home}</Link>
            <Link href="/about">{header?.nav?.about}</Link>
            <Link href="/services">{header?.nav?.services}</Link>
            <Link href="/store">{header?.nav?.store}</Link>
            <Link href="/proyectos">{header?.nav?.projects}</Link>
            <Link href="/news">{header?.nav?.news}</Link>
          </div>
          <div className="flex items-center space-x-4">
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-1 text-gray-800 hover:text-gray-900">
                <Globe className="w-5 h-5" />
                <span className="uppercase">{locale}</span>
                <ChevronDownIcon className="w-4 h-4" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Menu.Items className="absolute left-0 mt-2 w-20 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => changeLanguage("en")}
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "block w-full text-left px-4 py-2 text-sm text-gray-700",
                        )}
                      >
                        EN
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => changeLanguage("es")}
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "block w-full text-left px-4 py-2 text-sm text-gray-700",
                        )}
                      >
                        ES
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
            <motion.button
              className="bg-primary text-white p-3 rounded-full transition-transform"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <ShoppingCart className="h-6 w-6 mr-[1px]" />
            </motion.button>
          </div>
        </div>
      </nav>
      {/* ===== MENÚ MÓVIL ===== */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <Dialog as="div" className="lg:hidden" open={mobileMenuOpen} onClose={setMobileMenuOpen}>
            {/* Fondo semitransparente */}
            <div className="fixed inset-0 z-50 bg-black bg-opacity-25" />
            <Dialog.Panel
              as={motion.div}
              variants={mobileMenuVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white p-6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <Link href="/" className="-m-2 p-2">
                  <span className="sr-only">Logo</span>
                  <Image src="/RomanaEbanistería.png" alt="Logo" width={150} height={50} />
                </Link>
                <button type="button" className="p-2 text-gray-800" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-8 w-8" />
                </button>
              </div>
              <div className="mt-6 space-y-4">
                <Link
                  href="/"
                  className="block text-lg font-medium text-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {header?.nav?.home}
                </Link>
                <Link
                  href="/about"
                  className="block text-lg font-medium text-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {header?.nav?.about}
                </Link>
                <Link
                  href="/services"
                  className="block text-lg font-medium text-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {header?.nav?.services}
                </Link>
                <Link
                  href="/store"
                  className="block text-lg font-medium text-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {header?.nav?.store}
                </Link>
                <MobileNavDisclosure
                  items={proyectos}
                  title={header?.nav?.projects}
                  indexPath="/projects"
                  setMobileMenuOpen={setMobileMenuOpen}
                />
                <MobileNavDisclosure
                  items={empresas}
                  title={header?.nav?.companies}
                  indexPath="/companies"
                  setMobileMenuOpen={setMobileMenuOpen}
                />
                <MobileNavDisclosure
                  items={marcas}
                  title={header?.nav?.brands}
                  indexPath="/brands"
                  setMobileMenuOpen={setMobileMenuOpen}
                />
                <Link
                  href="/news"
                  className="block text-lg font-medium text-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {header?.nav?.news}
                </Link>
              </div>
              <div className="mt-8 space-y-4">
                <Menu as="div" className="relative">
                  <Menu.Button className="flex w-full items-center justify-between rounded bg-gray-100 px-4 py-3 text-lg font-medium text-gray-800">
                    {locale.toUpperCase()}
                    <ChevronDown className="h-6 w-6 text-gray-500" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 scale-95"
                    enterTo="opacity-100 scale-100"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 scale-100"
                    leaveTo="opacity-0 scale-95"
                  >
                    <Menu.Items className="mt-2 rounded bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => {
                              router.push(router.pathname, router.asPath, { locale: "en" })
                              setMobileMenuOpen(false)
                            }}
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block w-full px-4 py-2 text-lg text-gray-800 text-left",
                            )}
                          >
                            English
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => {
                              router.push(router.pathname, router.asPath, { locale: "es" })
                              setMobileMenuOpen(false)
                            }}
                            className={classNames(
                              active ? "bg-gray-100" : "",
                              "block w-full px-4 py-2 text-lg text-gray-800 text-left",
                            )}
                          >
                            Español
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
                <motion.button
                  className="w-full bg-primary text-white px-4 py-3 rounded-full transition-transform flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ShoppingCart className="h-6 w-6" />
                </motion.button>
              </div>
            </Dialog.Panel>
          </Dialog>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

// ---------- COMPONENTE AUXILIAR: MobileNavDisclosure ----------

const MobileNavDisclosure = ({
  items,
  title,
  indexPath,
  setMobileMenuOpen,
}: {
  items: any[]
  title: string
  indexPath: string
  setMobileMenuOpen: (open: boolean) => void
}) => {
  return (
    <Disclosure as="div" className="border-t border-gray-200 pt-4">
      {({ open }) => (
        <>
          <Disclosure.Button className="flex w-full items-center justify-between text-lg font-medium text-gray-800">
            {title}
            <ChevronDown className={`h-6 w-6 transition-transform ${open ? "rotate-180" : ""}`} />
          </Disclosure.Button>
          <Disclosure.Panel className="mt-2 space-y-2">
            <Link
              href={indexPath}
              className="block pl-4 text-lg text-gray-700"
              onClick={() => setMobileMenuOpen(false)}
            >
              Ver todos
            </Link>
            {items.map((item: any) => (
              <Disclosure.Button
                key={item.nombreEmpresa["es"]}
                as="a"
                href={`${indexPath}/${item.slug}`}
                className="block pl-4 text-lg text-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.nombreEmpresa["es"]}
              </Disclosure.Button>
            ))}
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

