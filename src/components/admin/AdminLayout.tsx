"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { LayoutDashboard, Package, Users, LogOut, Menu, Bell, ChevronLeft } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
  activeTab: "dashboard" | "orders" | "clients"
  onTabChange: (tab: "dashboard" | "orders" | "clients") => void
  user: any
}

const navigation = [
  {
    name: "Dashboard",
    id: "dashboard" as const,
    icon: LayoutDashboard,
    description: "Vista general del sistema",
  },
  {
    name: "Órdenes",
    id: "orders" as const,
    icon: Package,
    description: "Gestión de pedidos",
  },
  {
    name: "Clientes",
    id: "clients" as const,
    icon: Users,
    description: "Gestión de clientes",
  },
]

export default function AdminLayout({ children, activeTab, onTabChange, user }: AdminLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const handleLogout = () => {
    // Limpiar sesión de admin
    localStorage.removeItem("ebadmin_authenticated")
    localStorage.removeItem("ebadmin_email")
    localStorage.removeItem("ebadmin_login_time")

    router.push("/ebadmin/login")
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div
        className={`flex items-center gap-3 px-6 py-5 border-b border-gray-200 bg-white ${sidebarCollapsed ? "px-4 justify-center" : ""}`}
      >
        <div className="w-9 h-9 bg-orange-600 rounded-xl flex items-center justify-center shadow-sm">
          <span className="text-white font-bold text-sm">RE</span>
        </div>
        {!sidebarCollapsed && (
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 tracking-tight">Romana</h1>
            <p className="text-xs text-gray-500 font-medium">Ebanistería Admin</p>
          </div>
        )}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="hidden lg:flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className={`h-4 w-4 transition-transform ${sidebarCollapsed ? "rotate-180" : ""}`} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id

          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id)
                setSidebarOpen(false)
              }}
              className={`w-full flex items-center gap-3 h-11 px-3 rounded-lg font-medium transition-all ${
                sidebarCollapsed ? "justify-center" : "justify-start"
              } ${
                isActive ? "bg-orange-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!sidebarCollapsed && (
                <div className="flex-1 text-left">
                  <div className="text-sm">{item.name}</div>
                  <div className="text-xs opacity-60 font-normal">{item.description}</div>
                </div>
              )}
            </button>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="border-t border-gray-200 bg-white p-4">
        <div className={`flex items-center gap-3 mb-4 ${sidebarCollapsed ? "justify-center" : ""}`}>
          <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-600 font-semibold text-sm">{user?.email?.charAt(0).toUpperCase() || "A"}</span>
          </div>
          {!sidebarCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.email || "Admin"}</p>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Administrador
                </span>
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-3 h-10 px-3 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors ${
            sidebarCollapsed ? "justify-center" : "justify-start"
          }`}
        >
          <LogOut className="h-4 w-4" />
          {!sidebarCollapsed && <span>Cerrar sesión</span>}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transition-all duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } ${sidebarCollapsed ? "w-20" : "w-72"}`}
      >
        <SidebarContent />
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 bg-white bg-opacity-95 backdrop-blur border-b border-gray-200 lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="h-9 w-9 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-orange-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">RE</span>
                </div>
                <span className="font-semibold text-gray-900">Romana Admin</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="h-9 w-9 flex items-center justify-center rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-xs font-semibold text-gray-600">
                  {user?.email?.charAt(0).toUpperCase() || "A"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}
