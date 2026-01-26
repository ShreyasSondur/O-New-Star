import Image from "next/image"

export function Gallery() {
  return (
    <section id="gallery" className="py-20 bg-white">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Gallery</h2>
          <p className="text-gray-600 mb-10">A glimpse of our spaces — neat, welcoming, and thoughtfully designed.</p>

          <div className="space-y-16">
            {/* Outside View */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Outside View</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[
                  { src: "/images/hero-bg.jpg", alt: "Hotel exterior" },
                  { src: "/images/about-1.png", alt: "Property surroundings" },
                  { src: "/images/about-2.png", alt: "Entrance view" },
                ].map((img, idx) => (
                  <figure key={`outside-${idx}`} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={1200}
                      height={800}
                      className="h-44 sm:h-52 md:h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      priority={idx === 0}
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                      <span className="text-white text-sm">{img.alt}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>

            {/* Garden */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Garden</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[
                  { src: "/images/restaurant.jpg", alt: "Garden seating" },
                  { src: "/images/common-area.jpg", alt: "Green common area" },
                  { src: "/images/lobby.jpg", alt: "Garden lobby access" },
                ].map((img, idx) => (
                  <figure key={`garden-${idx}`} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={1200}
                      height={800}
                      className="h-44 sm:h-52 md:h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                      <span className="text-white text-sm">{img.alt}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>

            {/* Parking */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Parking</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[
                  { src: "/images/common-area.jpg", alt: "Parking area" },
                  { src: "/images/hero-bg.jpg", alt: "Approach road" },
                  { src: "/images/about-2.png", alt: "Parking bays" },
                ].map((img, idx) => (
                  <figure key={`parking-${idx}`} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={1200}
                      height={800}
                      className="h-44 sm:h-52 md:h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                      <span className="text-white text-sm">{img.alt}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>

            {/* Rooms */}
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Rooms</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {[
                  { src: "/images/room-1.jpg", alt: "Deluxe room" },
                  { src: "/images/room-2.jpg", alt: "Standard room" },
                  { src: "/images/common-area.jpg", alt: "Room corridor" },
                ].map((img, idx) => (
                  <figure key={`rooms-${idx}`} className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white">
                    <Image
                      src={img.src}
                      alt={img.alt}
                      width={1200}
                      height={800}
                      className="h-44 sm:h-52 md:h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <figcaption className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                      <span className="text-white text-sm">{img.alt}</span>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
