"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { FloorsRoomsManager } from "@/components/admin/floors-rooms-manager"
import { RoomBlockingBoard } from "@/components/admin/room-blocking-board"

export default function AdminPage() {
  const [currentView, setCurrentView] = useState<"dashboard" | "floors-rooms" | "room-blocking">("dashboard")
  const router = useRouter()

  const handleLogout = () => {
    // In a real app, clear auth tokens here
    router.push("/admin/login")
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <AdminSidebar currentView={currentView} onViewChange={setCurrentView} onLogout={handleLogout} />

      {/* Main Content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-white border-b px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {currentView === "dashboard" && "Dashboard"}
            {currentView === "floors-rooms" && "Floors & Rooms"}
            {currentView === "room-blocking" && "Room Blocking"}
          </h1>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Logout
          </button>
        </header>

        {/* Content */}
        <main className="p-8">
          {currentView === "dashboard" && <AdminDashboard />}
          {currentView === "floors-rooms" && <FloorsRoomsManager />}
          {currentView === "room-blocking" && <RoomBlockingBoard />}
        </main>
      </div>
    </div>
  )
}
