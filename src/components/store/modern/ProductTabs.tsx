"use client"

import type React from "react"

import { AnimatePresence, motion } from "framer-motion"
import { useState } from "react"

interface TabDef {
  key: string
  label: string
  content: React.ReactNode
}

interface ProductTabsProps {
  description: string
  details?: React.ReactNode
  shipping?: React.ReactNode
}

export function ProductTabs({ description, details, shipping }: ProductTabsProps) {
  const tabs: TabDef[] = [
    {
      key: "description",
      label: "Descripción",
      content: <p className="leading-7 text-slate-700 text-base">{description}</p>,
    },
    {
      key: "details",
      label: "Detalles",
      content: details || <p className="text-base text-slate-500">Sin detalles adicionales.</p>,
    },
    {
      key: "shipping",
      label: "Envío",
      content: shipping || <p className="text-base text-slate-500">Información de envío no disponible.</p>,
    },
  ]
  const [active, setActive] = useState(tabs[0].key)
  return (
    <div className="mt-20">
      <div role="tablist" className="flex gap-8 border-b border-slate-200/80">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={active === t.key}
            onClick={() => setActive(t.key)}
            className={`relative -mb-px px-1 pb-4 text-base font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-slate-900/20 focus:ring-offset-2 ${active === t.key ? "text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
          >
            {t.label}
            {active === t.key && (
              <motion.span
                layoutId="modern-tab-underline"
                className="absolute -bottom-[1px] left-0 right-0 h-[3px] bg-slate-900 rounded-full"
              />
            )}
          </button>
        ))}
      </div>
      <div className="relative">
        <AnimatePresence mode="wait">
          {tabs.map(
            (t) =>
              active === t.key && (
                <motion.div
                  key={t.key}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="mt-8"
                >
                  {t.content}
                </motion.div>
              ),
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
