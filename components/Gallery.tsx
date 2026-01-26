"use client"

import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Slide = { src: string; alt: string }

function encodePath(path: string) {
  // Safely encode paths that include spaces or parentheses
  return path
    .split("/")
    .map((seg) => encodeURIComponent(decodeURIComponent(seg)))
    .join("/")
}

function Carousel({ title, slides, ratio = 4 / 3 }: { title: string; slides: Slide[]; ratio?: number }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [current, setCurrent] = useState(0)

  const scrollTo = (idx: number) => {
    const el = containerRef.current
    if (!el) return
    const clamped = Math.max(0, Math.min(idx, slides.length - 1))
    const child = el.children[clamped] as HTMLElement | undefined
    if (child) child.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" })
    setCurrent(clamped)
  }

  const handlePrev = () => scrollTo(current - 1)
  const handleNext = () => scrollTo(current + 1)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const onScroll = () => {
      const { left, width } = el.getBoundingClientRect()
      const center = left + width / 2
      let bestIdx = 0
      let bestDist = Infinity
      for (let i = 0; i < el.children.length; i++) {
        const c = el.children[i] as HTMLElement
        const rect = c.getBoundingClientRect()
        const dist = Math.abs(rect.left + rect.width / 2 - center)
        if (dist < bestDist) {
          bestDist = dist
          bestIdx = i
        }
      }
      setCurrent(bestIdx)
    }

    el.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => el.removeEventListener("scroll", onScroll)
  }, [])

  const isAtStart = current === 0
  const isAtEnd = current === slides.length - 1

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault()
      handlePrev()
    } else if (e.key === "ArrowRight") {
      e.preventDefault()
      handleNext()
    } else if (e.key === "Home") {
      e.preventDefault()
      scrollTo(0)
    } else if (e.key === "End") {
      e.preventDefault()
      scrollTo(slides.length - 1)
    }
  }

  return (
    <div className="space-y-4" role="region" aria-label={`${title} gallery`}>
      <h3 className="text-2xl font-semibold text-foreground tracking-tight">{title}</h3>
      <div className="relative">
        {/* Arrows */}
        <button
          aria-label="Previous slide"
          onClick={handlePrev}
          disabled={isAtStart}
          className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 grid place-items-center h-8 w-8 rounded-full bg-card/80 border border-border shadow hover:bg-card ${
            isAtStart ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          <ChevronLeft className="h-4 w-4 text-foreground" />
        </button>
        <button
          aria-label="Next slide"
          onClick={handleNext}
          disabled={isAtEnd}
          className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 grid place-items-center h-8 w-8 rounded-full bg-card/80 border border-border shadow hover:bg-card ${
            isAtEnd ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          <ChevronRight className="h-4 w-4 text-foreground" />
        </button>
        {/* Edge fade hints */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-background to-transparent rounded-l-xl" />
        <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-background to-transparent rounded-r-xl" />
        <div
          ref={containerRef}
          className="flex overflow-x-auto gap-4 snap-x snap-mandatory scroll-smooth pb-4 pr-6 focus:outline-none"
          style={{ scrollbarWidth: "none" }}
          aria-roledescription="carousel"
          aria-live="polite"
          tabIndex={0}
          onKeyDown={onKeyDown}
        >
          {slides.map((s, i) => (
            <figure
              key={`${title}-${i}`}
              className="snap-center shrink-0 w-[88%] sm:w-[70%] md:w-[50%] lg:w-[32%] xl:w-[28%] rounded-xl border border-border overflow-hidden bg-card transition-transform duration-300"
            >
              <div className="relative w-full" style={{ aspectRatio: `${ratio}` }}>
                <Image src={encodePath(s.src)} alt={s.alt} fill className="object-cover" sizes="(max-width: 768px) 85vw, (max-width: 1024px) 60vw, 33vw" />
              </div>
            </figure>
          ))}
        </div>
        {/* Dots removed for a simpler, clean UI */}
        <p className="sr-only">Slide {current + 1} of {slides.length}</p>
      </div>
    </div>
  )
}

export function Gallery() {
  const outside: Slide[] = [
    { src: "/images/room/outside1.jpeg", alt: "Outside view 1" },
    { src: "/images/room/outside 2.jpeg", alt: "Outside view 2" },
    { src: "/images/room/outside 3.jpeg", alt: "Outside view 3" },
    { src: "/images/room/outside 4.jpeg", alt: "Outside view 4" },
    { src: "/images/room/outside 5.jpeg", alt: "Outside view 5" },
  ]

  const rooms: Slide[] = [
    { src: "/images/room/room 5.jpeg", alt: "Room 1" },
    { src: "/images/room/room2.jpeg", alt: "Room 2" },
    { src: "/images/room/room3.jpeg", alt: "Room 3" },
    { src: "/images/room/room 4.jpeg", alt: "Room 4" },
    { src: "/images/room/room1.jpeg", alt: "Room 5" },
  ]

  return (
    <section id="gallery" className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-foreground tracking-tight mb-4">Gallery</h2>

          <div className="space-y-12">
            <Carousel title="Outside" slides={outside} ratio={4 / 3} />
            <Carousel title="Rooms" slides={rooms} ratio={4 / 3} />
          </div>
        </div>
      </div>
    </section>
  )
}
