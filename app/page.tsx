"use client"

import { useState } from "react"
import { SearchForm } from "@/components/search-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, Phone, Mail, Wifi, Car, Coffee, Wind, Tv, MapPinned } from "lucide-react"

export default function HomePage() {
  const [searchData, setSearchData] = useState<any>(null)

  const handleSearch = async (data: { checkIn: string; checkOut: string; adults: number; children: number }) => {
    setSearchData(data)
    // Navigate to rooms page with search params
    const params = new URLSearchParams({
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      adults: data.adults.toString(),
      children: data.children.toString(),
    })
    window.location.href = `/rooms?${params.toString()}`
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                <span className="text-white font-bold text-xl">Ō</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/" className="text-gray-900 hover:text-[#2671D9] transition-colors font-medium">
                Home
              </Link>
              <Link href="#rooms" className="text-gray-600 hover:text-[#2671D9] transition-colors">
                Rooms
              </Link>
              <Link href="#amenities" className="text-gray-600 hover:text-[#2671D9] transition-colors">
                Amenities
              </Link>
              <Link href="#location" className="text-gray-600 hover:text-[#2671D9] transition-colors">
                Location
              </Link>
              <Link href="#contact" className="text-gray-600 hover:text-[#2671D9] transition-colors">
                Contact
              </Link>
            </nav>

            {/* Book Now Button */}
            <Button className="bg-[#2671D9] hover:bg-[#1e5bbf] text-white px-6">Book Now</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-[650px] flex items-center justify-center mt-16">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url(/images/hero-bg.jpg)" }}
        />

        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/40" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4">
          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-white text-5xl md:text-6xl font-bold mb-3">Ō New Star Hotel</h1>
            <p className="text-white/90 text-lg">Comfortable Stay. Affordable Rates.</p>
          </div>

          {/* Search Form Container */}
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-[900px] mx-auto">
            <SearchForm onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Our Hotel Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">Our Hotel</h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Lobby */}
            <div className="relative h-[280px] rounded-xl overflow-hidden group cursor-pointer">
              <img
                src="/images/lobby.jpg"
                alt="Lobby"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <h3 className="absolute bottom-6 left-6 text-white text-2xl font-semibold">Lobby</h3>
            </div>

            {/* Common Area */}
            <div className="relative h-[280px] rounded-xl overflow-hidden group cursor-pointer">
              <img
                src="/images/common-area.jpg"
                alt="Common Area"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <h3 className="absolute bottom-6 left-6 text-white text-2xl font-semibold">Common Area</h3>
            </div>

            {/* Restaurant */}
            <div className="relative h-[280px] rounded-xl overflow-hidden group cursor-pointer">
              <img
                src="/images/restaurant.jpg"
                alt="Restaurant"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <h3 className="absolute bottom-6 left-6 text-white text-2xl font-semibold">Restaurant</h3>
            </div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">About Us</h2>
            <p className="text-gray-600">Discover the story behind Ō New Star Hotel</p>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            {/* Images */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img src="/images/room-1.jpg" alt="Hotel Room" className="w-full h-[300px] object-cover rounded-lg" />
                <img
                  src="/images/room-2.jpg"
                  alt="Hotel Room"
                  className="w-full h-[300px] object-cover rounded-lg mt-8"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Comfort Meets Affordability</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Welcome to Ō New Star Hotel, where we are dedicated to providing exceptional hospitality and creating
                memorable experiences for our guests. Since our establishment, we have been committed to offering the
                perfect blend of comfort, convenience, and value.
              </p>

              <div className="space-y-6">
                {/* Prime Location */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#2671D9]/10 flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-[#2671D9]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Prime Location</h4>
                    <p className="text-gray-600 text-sm">
                      Located in the heart of the city with easy access to public transport, restaurants, and local
                      attractions.
                    </p>
                  </div>
                </div>

                {/* Modern Amenities */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#2671D9]/10 flex items-center justify-center">
                    <Wifi className="w-6 h-6 text-[#2671D9]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Modern Amenities</h4>
                    <p className="text-gray-600 text-sm">
                      Our hotel offers contemporary accommodations with all the essential amenities for a comfortable
                      and relaxing stay.
                    </p>
                  </div>
                </div>

                {/* Exceptional Service */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#2671D9]/10 flex items-center justify-center">
                    <Coffee className="w-6 h-6 text-[#2671D9]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Exceptional Service</h4>
                    <p className="text-gray-600 text-sm">
                      Our friendly and professional staff is always ready to assist you, ensuring your stay is pleasant
                      and memorable.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mt-8 leading-relaxed">
                Our commitment is to deliver quality service at budget-friendly prices, making us the perfect choice for
                travelers seeking value without compromising on comfort.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hotel Amenities Section */}
      <section id="amenities" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">Hotel Amenities</h2>
            <p className="text-gray-600">Everything you need for a comfortable stay</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
            {/* Free WiFi */}
            <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2671D9]/10 flex items-center justify-center">
                <Wifi className="w-8 h-8 text-[#2671D9]" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Free WiFi</h4>
            </div>

            {/* Free Parking */}
            <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2671D9]/10 flex items-center justify-center">
                <Car className="w-8 h-8 text-[#2671D9]" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Free Parking</h4>
            </div>

            {/* Breakfast Available */}
            <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2671D9]/10 flex items-center justify-center">
                <Coffee className="w-8 h-8 text-[#2671D9]" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Breakfast Available</h4>
            </div>

            {/* Air Conditioning */}
            <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2671D9]/10 flex items-center justify-center">
                <Wind className="w-8 h-8 text-[#2671D9]" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Air Conditioning</h4>
            </div>

            {/* Flat Screen TV */}
            <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2671D9]/10 flex items-center justify-center">
                <Tv className="w-8 h-8 text-[#2671D9]" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Flat Screen TV</h4>
            </div>

            {/* Central Location */}
            <div className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#2671D9]/10 flex items-center justify-center">
                <MapPinned className="w-8 h-8 text-[#2671D9]" />
              </div>
              <h4 className="font-semibold text-gray-900 text-sm">Central Location</h4>
            </div>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-gray-900 mb-12">Location</h2>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
            {/* Location Info */}
            <div>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Conveniently located near Chilka Railway Station in Balurgaon, with easy access to public transport and
                local attractions.
              </p>

              <div className="space-y-6">
                {/* Address */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[#2671D9]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Address</h4>
                    <p className="text-gray-600 text-sm">
                      Plot No-68/1858, City - Balurgaon,
                      <br />
                      Near Chilka Railway Station,
                      <br />
                      Dist - Khordha, Balurgaon, Balugaon
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Phone className="w-5 h-5 text-[#2671D9]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Contact</h4>
                    <p className="text-gray-600 text-sm">
                      +91-6370949<span className="text-gray-400">XX</span>
                      <br />
                      +91-9583125<span className="text-gray-400">XX</span>
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    <Mail className="w-5 h-5 text-[#2671D9]" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
                    <p className="text-gray-600 text-sm">info@onewstar.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Map */}
            <div className="h-[400px] rounded-xl overflow-hidden border border-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d119540.68319568652!2d85.19332234335938!3d19.79013960000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a19c7a5e5b5e5e5%3A0x5e5e5e5e5e5e5e5e!2sChilka%20Railway%20Station!5e0!3m2!1sen!2sin!4v1234567890123!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
                  <Link href="#rooms" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Rooms
                  </Link>
                </li>
                <li>
                  <Link href="#amenities" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Amenities
                  </Link>
                </li>
                <li>
                  <Link href="#location" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Location
                  </Link>
                </li>
                <li>
                  <Link href="#contact" className="text-gray-400 hover:text-white transition-colors text-sm">
                    Contact
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
    </div>
  )
}
