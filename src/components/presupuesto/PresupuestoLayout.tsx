"use client"

import Header from "@/components/layout/Header"
import Footer from "@/components/layout/Footer"
import LeftColumn from "./LeftColumn"
import RightColumn from "./RightColumn"
import { usePresupuesto } from "./usePresupuesto"

export default function PresupuestoLayout() {
  const {
    loading,
    error,
    search,
    setSearch,
    filteredProducts,
    addItem,
    selectedList,
    subtotal,
    tax,
    total,
    changeQty,
    removeItem,
    clearSelected,
    exportPDF,
    proceedToBuy,
  } = usePresupuesto()

  if (loading) {
    return (
      <main>
        <Header />
        <div className="container mx-auto px-4 py-12 mt-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (error) {
    return (
      <main>
        <Header />
        <div className="container mx-auto px-4 py-12 mt-24">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-500 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <Header />
      <div className="container mx-auto px-4 py-8 mt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Presupuesto</h1>
          <p className="text-gray-600">Selecciona productos y genera tu presupuesto personalizado</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3">
            <LeftColumn search={search} setSearch={setSearch} filteredProducts={filteredProducts} onAdd={addItem} />
          </div>
          <div className="lg:col-span-2">
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
      </div>
      <Footer />
    </main>
  )
}
