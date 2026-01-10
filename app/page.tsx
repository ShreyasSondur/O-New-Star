"use client"

import { useState } from "react"
import { SearchForm } from "@/components/search-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, Phone, Mail, Wifi, Car, Coffee, Wind, Tv, MapPinned, Quote } from "lucide-react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

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
      <SiteHeader />

      {/* Hero Section */}
      <section className="relative h-[800px] flex items-center justify-center pt-20">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat fixed-background"
          style={{ backgroundImage: "url(/images/hero-bg.jpg)" }}
        />

        {/* Dark Overlay with Advanced Gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80" />

        {/* Content */}
        <div className="relative z-10 w-full max-w-[1200px] mx-auto px-4 flex flex-col items-center">
          {/* Heading */}
          <div className="text-center mb-12 space-y-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <span className="text-xl font-bold bg-clip-text text-transparent text-white mt-2">
              O New Star Hotel
            </span>
            <p className="text-white/90 text-xl md:text-3xl font-light tracking-wide drop-shadow-lg max-w-2xl mx-auto">
              Your Sanctuary of Comfort in the Heart of the City.
            </p>
          </div>

          {/* Search Form Container */}
          <div className="w-full max-w-[1000px] bg-white rounded-2xl shadow-2xl p-8 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300 transform hover:scale-[1.01] transition-transform">
            <SearchForm onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">About Us</h2>
            <p className="text-gray-600">Discover the story behind O New Star Hotel</p>
          </div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            {/* Images */}
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <img src="/images/about-2.png" alt="Hotel Room" className="w-full h-[300px] object-cover rounded-lg" />
                <img
                  src="/images/about-1.png"
                  alt="Hotel Room"
                  className="w-full h-[300px] object-cover rounded-lg mt-8"
                />
              </div>
            </div>

            {/* Content */}
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Comfort Meets Affordability</h3>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Welcome to O New Star Hotel, where we are dedicated to providing exceptional hospitality and creating
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

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-3">What Our Guests Say</h2>
            <p className="text-gray-600">Real experiences from happy guests</p>
          </div>

          <div className="max-w-6xl mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <Card className="group bg-white border-gray-200 shadow-md transition-transform transition-shadow duration-200 hover:-translate-y-0.5 hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Quote className="w-5 h-5 text-[#2671D9] transition-colors group-hover:text-[#1f5fb4]" />
                  Comfortable and Clean Rooms
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  I had a wonderful stay! The room was spotless, the bed was
                  comfortable, and the staff were very helpful. Great value for money.
                </p>
                <p className="mt-4 font-semibold text-gray-900">— Priya S.</p>
              </CardContent>
            </Card>

            {/* Testimonial 2 */}
            <Card className="group bg-white border-gray-200 shadow-md transition-transform transition-shadow duration-200 hover:-translate-y-0.5 hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Quote className="w-5 h-5 text-[#2671D9] transition-colors group-hover:text-[#1f5fb4]" />
                  Perfect Location and Amenities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  The hotel is in a central location with easy access to transport.
                  WiFi was fast and the AC kept the room cool throughout.
                </p>
                <p className="mt-4 font-semibold text-gray-900">— Arjun K.</p>
              </CardContent>
            </Card>

            {/* Testimonial 3 */}
            <Card className="group bg-white border-gray-200 shadow-md transition-transform transition-shadow duration-200 hover:-translate-y-0.5 hover:shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Quote className="w-5 h-5 text-[#2671D9] transition-colors group-hover:text-[#1f5fb4]" />
                  Friendly Staff and Great Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 leading-relaxed">
                  The team went above and beyond to make our stay pleasant.
                  Quick check-in and prompt support whenever we needed anything.
                </p>
                <p className="mt-4 font-semibold text-gray-900">— Neha R.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section id="location" className="py-20 bg-white">
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

      <SiteFooter />
    </div>
  )
}
