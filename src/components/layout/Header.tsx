"use client"

import { useTranslation } from "@/hook/UseTranslation"
import { useRouter } from "next/router"
import { useEffect, useState, Fragment } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown, ChevronDownIcon, Globe, MenuIcon, X, ShoppingCart, User2 } from "lucide-react"
import Link from "next/link"
import { Dialog, Disclosure, Transition, Menu } from "@headlessui/react"
import { useCart } from '@/hook/useCart'
import { useAuth } from '@/context/AuthContext'


interface HeaderProps {
  enableScroll?: boolean
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ")
}

export default function Header({ enableScroll = false }: HeaderProps) {
  const dict = useTranslation()
  const { header } = dict
  const router = useRouter()
  const { locale }: any = router
  const [scrollPosition, setScrollPosition] = useState(0)
  const { count: cartCount } = useCart()

  const [marcas, setMarcas] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user: authUser } = useAuth()

  useEffect(() => {
    const handleScroll = () => setScrollPosition(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // CartContext & AuthContext handle reactivity; local effects removed


  const changeLanguage = (newLocale: "en" | "es") => {
    if (newLocale !== locale) {
      router.push(router.pathname, router.asPath, { locale: newLocale })
    }
  }

  const headerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
  }

  const mobileMenuVariants = {
    hidden: { opacity: 0, x: "100%" },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
    exit: {
      opacity: 0,
      x: "100%",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
      },
    },
  }

  //const isScrolled = scrollPosition > 50

  // If enableScroll is false, always show as scrolled
  const isScrolled = enableScroll ? scrollPosition > 50 : true

  return (
    <motion.header
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className={`fixed w-full top-0 z-50 transition-all duration-300 px-4 lg:px-8 ${
        scrollPosition > 50 ? `bg-white/95 shadow-md` : `${enableScroll ?"bg-transparent": "bg-white border-b"} `
      }`}
    >
      <nav className="mx-auto container">
        {/* ===== MOBILE HEADER ===== */}
        <div className="lg:hidden flex items-center justify-between py-4">
          {/* Botón CTA a la derecha */}
          <div className="w-1/3">
            <motion.button
              className="text-white transition-transform flex items-center justify-center h-12 w-12"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/store/cart" className="relative inline-block" aria-label={`Carrito, ${cartCount} artículos`}>
                <ShoppingCart className={`h-8 w-8 ${isScrolled ? "text-gray-800" : "text-gray-50"}`} />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-1 bg-gray-900 text-white text-[10px] leading-none px-1.5 py-0.5 font-semibold" aria-hidden>
                    {cartCount}
                  </span>
                )}
              </Link>
            </motion.button>
          </div>
          {/* Logo centrado */}
          <Link href="/" className="flex-shrink-0 w-1/3 flex justify-center">
            <span className="sr-only">Logo</span>
            <motion.img
              src={
                isScrolled
                  ? `https://storage.googleapis.com/portfoliprofiles/GG%20studio/romanaEbanisteri%CC%81a.png`
                  : `/romanaEbanistería_alt.png`
              }
              alt="Logo"
              width={120}
              height={50}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            />
          </Link>
          {/* Botón de menú a la izquierda */}
          <motion.button
            type="button"
            className="text-gray-800 w-1/3 flex justify-end"
            onClick={() => setMobileMenuOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <MenuIcon className={`h-8 w-8 ${isScrolled ? "text-gray-800" : "text-gray-50"}`} />
          </motion.button>
        </div>
        {/* ===== DESKTOP HEADER ===== */}
        <div className="hidden lg:flex items-center justify-between py-2">
          <div className="flex items-center">
            <Link href="/" className="">
              <span className="sr-only">Logo</span>
              <motion.img
                src={
                  isScrolled
                    ? `https://storage.googleapis.com/portfoliprofiles/GG%20studio/romanaEbanisteri%CC%81a.png`
                    : `/romanaEbanistería_alt.png`
                }
                alt="Logo"
                width={150}
                height={55}
                className="h-18 object-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              />
            </Link>
          </div>
          <motion.div
            className={`flex space-x-6 text-[14px] font-medium ${isScrolled ? "text-gray-800" : "text-gray-50"}`}
            variants={headerVariants}
          >
            {[
            /* { href: "/about", text: header?.nav?.about }, */
              { href: "/", text: header?.nav?.home },
              { href: "/store/services", text: header?.nav?.services },
              { href: "/store", text: header?.nav?.store },
              { href: "/gallery", text: header?.nav?.projects },
              { href: "/contact", text: header?.nav?.contact },
            ].map((item, index) => (
              <motion.div key={index} variants={navItemVariants}>
                <Link href={item.href} className="hover:text-primary transition-colors duration-200">
                  {item.text}
                </Link>
              </motion.div>
            ))}
          </motion.div>
          <div className="flex items-center space-x-4">
            <Menu as="div" className="relative">
              {/* <Menu.Button className={`flex items-center gap-1 ${isScrolled ? "text-gray-800" : "text-gray-50"}`}>
                <Globe className="w-5 h-5" />
                <span className="uppercase">{locale}</span>
                <ChevronDownIcon className="w-4 h-4" />
              </Menu.Button> */}
              {/* <Transition
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Menu.Items className="absolute left-0 mt-2 w-20 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none overflow-hidden">
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
              </Transition> */}
            </Menu>
            <motion.button
              className={`hidden md:inline-flex items-center gap-2 px-4 py-2 border transition-transform ${
                isScrolled
                  ? "text-gray-800 border-gray-300 hover:bg-gray-100"
                  : "text-gray-50 border-white/60 hover:bg-white/10"
              }`}
            >
              <Link href="/presupuesto">Crear presupuesto</Link>
            </motion.button>
            <div className="hidden md:flex items-center gap-3 pb-1">
              <Link href="/profile"
                className={`hidden md:inline-flex items-center gap-2 px-3 py-2 text-sm transition-colors ${isScrolled ? "text-gray-800 hover:text-gray-600" : "text-gray-50 hover:text-gray-200"}`}
              >
                <User2 className="w-5 h-5" />
              </Link>
            </div>
            <motion.button
              className={` transition-transform ${isScrolled ? "text-gray-800" : "text-gray-50"}`}
            >
              <Link href="/store/cart" className="relative inline-block" aria-label={`Carrito, ${cartCount} artículos`}>
                <ShoppingCart className="h-6 w-6 mr-[1px]" />
                {cartCount > 0 && (
                  <span className="absolute -right-2 -top-2 bg-gray-900 text-white text-[10px] leading-none px-1.5 py-0.5 font-semibold" aria-hidden>
                    {cartCount}
                  </span>
                )}
              </Link>
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
                  <img
                    src={`https://storage.googleapis.com/portfoliprofiles/GG%20studio/romanaEbanisteri%CC%81a.png`}
                    alt="Logo"
                    width={150}
                    height={50}
                  />
                </Link>
                <button type="button" className="p-2 text-gray-800" onClick={() => setMobileMenuOpen(false)}>
                  <X className="h-8 w-8" />
                </button>
              </div>
              <div className="mt-12 space-y-8">
                <Link
                  href="/profile"
                  className="block text-lg font-medium text-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {authUser ? 'Perfil' : 'Perfil / Rastreo'}
                </Link>
                <Link
                  href="/"
                  className="block text-lg font-medium text-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {header?.nav?.home}
                </Link>
                <Link
                  href="/store/services"
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
                <Link
                  href="/news"
                  className="block text-lg font-medium text-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {header?.nav?.news}
                </Link>
                {/* <Link
                  href="/presupuesto"
                  className="block text-lg font-medium text-gray-800"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Crear cotización
                </Link> */}
              </div>
              <div className="mt-8 space-y-4">
                {/* <Menu as="div" className="relative">
                  <Menu.Button className="flex w-full items-center justify-between bg-gray-100 px-4 py-5 text-lg font-medium text-gray-800">
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
                </Menu> */}
                <motion.button
                  className="w-full bg-primary/20 text-primary border-primary/20 border-2 px-4 py-5 transition-transform flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/presupuesto">Crear cotización</Link>
                </motion.button>
                <motion.button
                  className="w-full bg-primary text-white px-4 py-5 transition-transform flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/store/cart">
                    <ShoppingCart className="h-6 w-6" />
                  </Link>
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

