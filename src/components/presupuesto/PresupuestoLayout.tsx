"use client"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import LeftColumn from "./LeftColumn"
import RightColumn from "./RightColumn"
import { usePresupuesto } from "./usePresupuesto"

export default function PresupuestoLayout() {
  const {
    loading, error,
    search, setSearch,
    filteredProducts, uniqueTypes, uniqueVendors, counts, filters, onFilterChange,
    addItem,
    selectedList, subtotal, tax, total,
    changeQty, removeItem, clearSelected,
    exportPDF, proceedToBuy,
  } = usePresupuesto()

  if (loading) return <div className="container mx-auto px-4 py-12 mt-24">Cargando productos…</div>
  if (error) return <div className="container mx-auto px-4 py-12 mt-24 text-red-600">{error}</div>

  return (
    <main>
      <Header />
      <div className="container mx-auto px-4 py-12 mt-24">
        <h1 className="text-2xl font-semibold text-gray-900">Presupuesto</h1>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <LeftColumn
            search={search}
            setSearch={setSearch}
            filteredProducts={filteredProducts}
            uniqueTypes={uniqueTypes}
            uniqueVendors={uniqueVendors}
            counts={counts}
            filters={filters}
            onFilterChange={onFilterChange}
            onAdd={addItem}
          />
          <RightColumn
            items={selectedList as any}
            subtotal={subtotal}
            tax={tax}
            total={total}
            onQtyChange={changeQty}
            onRemove={removeItem}
            onClear={clearSelected}
            onDownload={exportPDF}
            onProceed={proceedToBuy}
          />
        </div>
      </div>
      <Footer />
    </main>
  )
}
