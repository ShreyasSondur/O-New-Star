import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserButton } from "@/components/auth/user-button"
import { Menu, X } from "lucide-react"

export function SiteHeader() {
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 md:gap-3">
                        <div className="relative w-10 h-10 md:w-12 md:h-12">
                            <img
                                src="/logo.png"
                                alt="NEW STAR LODGE"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="text-gray-900 font-bold text-lg md:text-xl tracking-tight">NEW STAR LODGE</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        <Link href="/" className="text-gray-900 hover:text-[#2671D9] transition-colors font-medium">
                            Home
                        </Link>
                        <Link href="/#rooms" className="text-gray-600 hover:text-[#2671D9] transition-colors">
                            Rooms
                        </Link>
                        <Link href="/#amenities" className="text-gray-600 hover:text-[#2671D9] transition-colors">
                            Amenities
                        </Link>
                        <Link href="/#location" className="text-gray-600 hover:text-[#2671D9] transition-colors">
                            Location
                        </Link>
                        <Link href="/#contact" className="text-gray-600 hover:text-[#2671D9] transition-colors">
                            Contact
                        </Link>
                    </nav>

                    {/* Desktop Auth & Actions */}
                    <div className="hidden md:flex items-center gap-4">
                        <UserButton />
                        <Link href="/rooms" passHref>
                            <Button className="bg-[#2671D9] hover:bg-[#1e5bbf] text-white px-6 font-semibold shadow-sm transition-all hover:shadow-md">
                                Book Now
                            </Button>
                        </Link>
                    </div>

                    {/* Mobile Menu Toggle & User */}
                    <div className="flex items-center gap-4 md:hidden">
                        <UserButton />
                        <button
                            className="p-2 text-gray-600"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation Menu */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 p-4 shadow-lg animate-in slide-in-from-top-5">
                    <nav className="flex flex-col space-y-4">
                        <Link
                            href="/"
                            className="text-gray-900 font-medium p-2 hover:bg-gray-50 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            href="/#rooms"
                            className="text-gray-600 p-2 hover:bg-gray-50 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Rooms
                        </Link>
                        <Link
                            href="/#amenities"
                            className="text-gray-600 p-2 hover:bg-gray-50 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Amenities
                        </Link>
                        <Link
                            href="/#location"
                            className="text-gray-600 p-2 hover:bg-gray-50 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Location
                        </Link>
                        <Link
                            href="/#contact"
                            className="text-gray-600 p-2 hover:bg-gray-50 rounded-md"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Contact
                        </Link>
                        <div className="pt-2 border-t border-gray-100">
                            <Link href="/rooms" passHref onClick={() => setIsMenuOpen(false)}>
                                <Button className="w-full bg-[#2671D9] hover:bg-[#1e5bbf] text-white font-semibold">
                                    Book Now
                                </Button>
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}
