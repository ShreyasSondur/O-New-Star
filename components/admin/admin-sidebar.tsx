"use client"

import { Hotel, LayoutDashboard, Building2, Ban, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

interface AdminSidebarProps {
  currentView: "dashboard" | "floors-rooms" | "room-blocking"
  onViewChange: (view: "dashboard" | "floors-rooms" | "room-blocking") => void
  onLogout: () => void
}

export function AdminSidebar({ currentView, onViewChange, onLogout }: AdminSidebarProps) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "floors-rooms", label: "Floors & Rooms", icon: Building2 },
    { id: "room-blocking", label: "Room Blocking", icon: Ban },
  ] as const

  return (
    <aside className="w-64 bg-white border-r flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-900 rounded-full flex items-center justify-center">
            <Hotel className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Ō New Star Hotel</h2>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                  isActive ? "bg-blue-50 text-blue-600" : "text-gray-700 hover:bg-gray-50",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-left"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
