import Link from "next/link"
import { MapPin, Phone, Mail } from "lucide-react"

export function SiteFooter() {
    return (
        <footer id="contact" className="bg-gray-900 text-white py-16">
            <div className="container mx-auto px-6">
                <div className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto">
                    {/* O New Star */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">O New Star</h3>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Comfortable and affordable accommodation for travelers.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <Link href="/#rooms" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Rooms
                                </Link>
                            </li>
                            <li>
                                <Link href="/#amenities" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Amenities
                                </Link>
                            </li>
                            <li>
                                <Link href="/#location" className="text-gray-400 hover:text-white transition-colors text-sm">
                                    Location
                                </Link>
                            </li>
                            <li className="mt-4 pt-4 border-t border-gray-800">
                                <Link href="/privacy-policy" className="text-gray-400 hover:text-white transition-colors text-sm block mb-2">
                                    Privacy Policy
                                </Link>
                                <Link href="/terms-conditions" className="text-gray-400 hover:text-white transition-colors text-sm block mb-2">
                                    Terms & Conditions
                                </Link>
                                <Link href="/refund-policy" className="text-gray-400 hover:text-white transition-colors text-sm block">
                                    Refund Policy
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Us */}
                    <div>
                        <h3 className="text-xl font-bold mb-4">Contact Us</h3>
                        <ul className="space-y-3">
                            <li className="flex gap-2 text-gray-400 text-sm">
                                <MapPin className="w-5 h-5 flex-shrink-0 text-[#2671D9]" />
                                <span>
                                    Plot No-68/1858, City - Balurgaon, Near Chilka Railway Station, Dist - Khordha, Balurgaon, Balugaon
                                </span>
                            </li>
                            <li className="flex gap-2 text-gray-400 text-sm">
                                <Phone className="w-5 h-5 flex-shrink-0 text-[#2671D9]" />
                                <span>
                                    +91-6370949XXX
                                    <br />
                                    +91-9583125XXX
                                </span>
                            </li>
                            <li className="flex gap-2 text-gray-400 text-sm">
                                <Mail className="w-5 h-5 flex-shrink-0 text-[#2671D9]" />
                                <span>info@onewstar.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-800 mt-12 pt-8 text-center">
                    <p className="text-gray-400 text-sm">© 2026 O New Star Hotel. All rights reserved.</p>
                </div>
            </div>
        </footer>
    )
}
