"use client"

import { Fragment } from "react"
import { Dialog, Disclosure, Transition } from "@headlessui/react"
import { X, ChevronDown } from "lucide-react"

const productFilters = [
    {
        id: "category",
        name: "Categoría",
        options: [
            { value: "puertas", label: "Puertas" },
            { value: "cocinas", label: "Cocinas" },
            { value: "mobiliario-residencial", label: "Mobiliario Residencial" },
            { value: "mobiliario-hotelero", label: "Mobiliario Hotelero/Oficinas" },
            { value: "escaleras", label: "Escaleras/Revestimientos" },
        ],
    },
    {
        id: "material",
        name: "Material",
        options: [
            { value: "madera-maciza", label: "Madera maciza" },
            { value: "melamina", label: "Melamina" },
            { value: "mdf", label: "MDF" },
            { value: "aluminio", label: "Carpintería en Aluminio" },
        ],
    },
    {
        id: "finish",
        name: "Acabado",
        options: [
            { value: "mate", label: "Mate" },
            { value: "brillante", label: "Brillante" },
            { value: "texturizado", label: "Texturizado" },
            { value: "natural", label: "Color natural" },
            { value: "tinte-oscuro", label: "Tinte oscuro" },
        ],
    },
    {
        id: "availability",
        name: "Disponibilidad",
        options: [
            { value: "en-stock", label: "En stock" },
            { value: "pedido", label: "A pedido" },
            { value: "promocion", label: "En promoción" },
        ],
    },
]

const serviceFilters = [
    {
        id: "category",
        name: "Categoría",
        options: [
            { value: "diseno", label: "Diseño" },
            { value: "instalacion", label: "Instalación" },
            { value: "mantenimiento", label: "Mantenimiento" },
            { value: "consultoria", label: "Consultoría" },
        ],
    },
    {
        id: "duration",
        name: "Duración",
        options: [
            { value: "corto", label: "Corto plazo (1-2 semanas)" },
            { value: "medio", label: "Medio plazo (2-4 semanas)" },
            { value: "largo", label: "Largo plazo (4+ semanas)" },
        ],
    },
    {
        id: "availability",
        name: "Disponibilidad",
        options: [
            { value: "inmediata", label: "Inmediata" },
            { value: "cita", label: "Previa cita" },
            { value: "lista-espera", label: "Lista de espera" },
        ],
    },
]
interface FiltersProps {
    mobileFiltersOpen: boolean
    setMobileFiltersOpen: (open: boolean) => void
    viewMode: "products" | "services"
    setViewMode: (mode: "products" | "services") => void
    children?: any
}

export default function Filters({
    mobileFiltersOpen,
    setMobileFiltersOpen,
    viewMode,
    setViewMode,
    children,
}: FiltersProps) {

    const filters = viewMode === "products" ? productFilters : serviceFilters

    return (
        <>
            {/* Mobile filter dialog */}
            <Transition.Root show={mobileFiltersOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50 lg:hidden" onClose={setMobileFiltersOpen}>
                    <Transition.Child
                        as={Fragment}
                        enter="transition-opacity ease-linear duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="transition-opacity ease-linear duration-300"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <div className="fixed inset-0 bg-black bg-opacity-25" />
                    </Transition.Child>

                    <div className="fixed inset-0 z-40 flex">
                        <Transition.Child
                            as={Fragment}
                            enter="transition ease-in-out duration-300 transform"
                            enterFrom="translate-x-full"
                            enterTo="translate-x-0"
                            leave="transition ease-in-out duration-300 transform"
                            leaveFrom="translate-x-0"
                            leaveTo="translate-x-full"
                        >
                            <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-12 shadow-xl">
                                <div className="flex items-center justify-between px-4">
                                    <h2 className="text-lg font-medium text-gray-900">Filtros</h2>
                                    <button
                                        type="button"
                                        className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md p-2 text-gray-400"
                                        onClick={() => setMobileFiltersOpen(false)}
                                    >
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                {/* Filters */}
                                <form className="border-t border-gray-200 mt-12">
                                    <div className="px-4 mt-4">{children}</div>
                                    {filters.map((section) => (
                                        <Disclosure as="div" key={section.id} className="border-t border-gray-200 px-4 py-6">
                                            {({ open }) => (
                                                <>
                                                    <h3 className="-mx-2 -my-3 flow-root">
                                                        <Disclosure.Button className="flex w-full items-center justify-between px-2 py-3 text-gray-400 hover:text-gray-500">
                                                            <span className="font-medium text-gray-900">{section.name}</span>
                                                            <ChevronDown className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} />
                                                        </Disclosure.Button>
                                                    </h3>
                                                    <Disclosure.Panel className="pt-6">
                                                        <div className="space-y-4">
                                                            {section.options.map((option, optionIdx) => (
                                                                <div key={option.value} className="flex items-center">
                                                                    <input
                                                                        id={`filter-${section.id}-${optionIdx}`}
                                                                        name={`${section.id}[]`}
                                                                        value={option.value}
                                                                        type="checkbox"
                                                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                                    />
                                                                    <label
                                                                        htmlFor={`filter-${section.id}-${optionIdx}`}
                                                                        className="ml-3 text-sm text-gray-600"
                                                                    >
                                                                        {option.label}
                                                                    </label>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </Disclosure.Panel>
                                                </>
                                            )}
                                        </Disclosure>
                                    ))}
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </Dialog>
            </Transition.Root>

            {/* Desktop filters */}
            <form className="hidden lg:block">
                <div className="mt-4 w-fit">
                    {children}
                </div>
                {filters.map((section) => (
                    <Disclosure as="div" key={section.id} className="border-b border-gray-200 py-6">
                        {({ open }) => (
                            <>
                                <h3 className="-my-3 flow-root">
                                    <Disclosure.Button className="flex w-full items-center justify-between py-3 text-sm text-gray-400 hover:text-gray-500">
                                        <span className="font-medium text-gray-900">{section.name}</span>
                                        <ChevronDown className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`} />
                                    </Disclosure.Button>
                                </h3>
                                <Disclosure.Panel className="pt-6">
                                    <div className="space-y-4">
                                        {section.options.map((option, optionIdx) => (
                                            <div key={option.value} className="flex items-center">
                                                <input
                                                    id={`filter-${section.id}-${optionIdx}`}
                                                    name={`${section.id}[]`}
                                                    value={option.value}
                                                    type="checkbox"
                                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                                />
                                                <label htmlFor={`filter-${section.id}-${optionIdx}`} className="ml-3 text-sm text-gray-600">
                                                    {option.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                </Disclosure.Panel>
                            </>
                        )}
                    </Disclosure>
                ))}
            </form>
        </>
    )
}

