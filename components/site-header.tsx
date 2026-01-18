import Link from "next/link"
import { Button } from "@/components/ui/button"
import { UserButton } from "@/components/auth/user-button"

export function SiteHeader() {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
            <div className="container mx-auto px-6">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3">
                        <div className="relative w-12 h-12">
                            <img
                                src="/logo.png"
                                alt="NEW STAR LODGE"
                                className="w-full h-full object-contain"
                            />
                        </div>
                        <span className="text-gray-900 font-bold text-xl tracking-tight">NEW STAR LODGE</span>
                    </Link>

                    {/* Navigation */}
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

                    {/* Auth & Actions */}
                    <div className="flex items-center gap-4">
                        <UserButton />
                        <Link href="/rooms" passHref>
                            <Button className="bg-[#2671D9] hover:bg-[#1e5bbf] text-white px-6 font-semibold shadow-sm transition-all hover:shadow-md">
                                Book Now
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    )
}
