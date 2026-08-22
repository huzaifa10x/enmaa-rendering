"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from "lucide-react"
import image1 from "@/public/images/image65452.webp"

const AUTOPLAY_MS = 3200
const RESUME_MS = 4000

export default function ProjectSlider() {
    const projects = useMemo(
        () => [
            { title: "Project 110 DXB", subtitle: "Enmaa Engineering Consultants — Dubai", image: image1 },
            { title: "Marina Tower", subtitle: "Seafront Residences — Doha", image: image1 },
            { title: "Atrium Offices", subtitle: "Business District — Abu Dhabi", image: image1 },
            { title: "Hillside Villas", subtitle: "Residential — Muscat", image: image1 },
            { title: "Cultural Pavilion", subtitle: "Arts Quarter — Riyadh", image: image1 },
        ],
        [],
    )

    const containerRef = useRef(null)
    const trackRef = useRef(null)
    const cardRefs = useRef([])

    const [activeIndex, setActiveIndex] = useState(0)
    const [offsetX, setOffsetX] = useState(0)
    const [animate, setAnimate] = useState(false)

    // Refs mirror state so the interval/observer callbacks always read fresh
    // values without re-subscribing on every render.
    const activeIndexRef = useRef(0)
    const offsetRef = useRef(0)
    const pausedRef = useRef(false)
    const resumeTimer = useRef(null)

    /**
     * Measure how far the track must move so that `index` sits in the middle of
     * the container. Card widths are percentage-based, so this has to be read
     * from the layout rather than calculated from constants.
     */
    const centerOn = useCallback((index, withAnimation = true) => {
        const container = containerRef.current
        const card = cardRefs.current[index]
        if (!container || !card) return

        const containerRect = container.getBoundingClientRect()
        const cardRect = card.getBoundingClientRect()

        const containerCenter = containerRect.left + containerRect.width / 2
        const cardCenter = cardRect.left + cardRect.width / 2

        // cardRect already includes the current translate, so add the delta.
        const nextOffset = offsetRef.current + (containerCenter - cardCenter)

        offsetRef.current = nextOffset
        setAnimate(withAnimation)
        setOffsetX(nextOffset)
    }, [])

    const goTo = useCallback(
        (index, withAnimation = true) => {
            const total = projects.length
            const next = (index + total) % total
            activeIndexRef.current = next
            setActiveIndex(next)
            centerOn(next, withAnimation)
        },
        [centerOn, projects.length],
    )

    // Pause autoplay after a manual interaction, then resume once idle.
    const pauseThenResume = useCallback(() => {
        pausedRef.current = true
        if (resumeTimer.current) clearTimeout(resumeTimer.current)
        resumeTimer.current = setTimeout(() => {
            pausedRef.current = false
        }, RESUME_MS)
    }, [])

    const prev = () => {
        pauseThenResume()
        goTo(activeIndexRef.current - 1)
    }

    const next = () => {
        pauseThenResume()
        goTo(activeIndexRef.current + 1)
    }

    // Initial position, autoplay, and responsive recalculation.
    useEffect(() => {
        const raf = requestAnimationFrame(() => goTo(0, false))

        const interval = setInterval(() => {
            if (pausedRef.current) return
            goTo(activeIndexRef.current + 1)
        }, AUTOPLAY_MS)

        const recenter = () => goTo(activeIndexRef.current, false)

        // ResizeObserver isn't in very old engines; fall back to resize alone.
        let ro = null
        if (typeof ResizeObserver !== "undefined" && containerRef.current) {
            ro = new ResizeObserver(recenter)
            ro.observe(containerRef.current)
        }
        window.addEventListener("resize", recenter)

        return () => {
            cancelAnimationFrame(raf)
            clearInterval(interval)
            if (resumeTimer.current) clearTimeout(resumeTimer.current)
            if (ro) ro.disconnect()
            window.removeEventListener("resize", recenter)
        }
    }, [goTo])

    return (
        <section
            className="relative py-16 md:py-24"
            style={{
                backgroundImage:
                    "linear-gradient(to bottom, rgba(255,255,255,0.85), rgba(255,255,255,0.92)), url('/images/projects-blueprint-bg.webp')",
                backgroundSize: "cover",
                backgroundPosition: "center",
            }}
        >
            <div className="container mx-auto px-4">
                <p className="text-center text-balance font-sans font-semibold leading-tight text-4xl md:text-6xl">
                    {"Creative "}
                    <span className="font-extrabold text-primary">{"Projects That Define"}</span> {"Our Style"}
                </p>

                <div
                    ref={containerRef}
                    className="relative mt-10 md:mt-14 overflow-hidden"
                    onMouseEnter={() => {
                        pausedRef.current = true
                    }}
                    onMouseLeave={() => {
                        pausedRef.current = false
                    }}
                >
                    <div
                        ref={trackRef}
                        className={`flex gap-6 md:gap-8 will-change-transform ${animate ? "transition-transform duration-1000 ease-out" : ""
                            }`}
                        style={{ transform: `translateX(${offsetX}px)` }}
                    >
                        {projects.map((p, i) => {
                            const isActive = i === activeIndex
                            return (
                                <article
                                    key={i}
                                    ref={(el) => (cardRefs.current[i] = el)}
                                    className={[
                                        "relative shrink-0 rounded-xl overflow-hidden transition-all duration-500 ease-out",
                                        "h-[320px] md:h-[420px]",
                                        "w-[78%] sm:w-[65%] md:w-[45%] lg:w-[26%] xl:w-[22%]",
                                        isActive ? "scale-105 z-10 shadow-xl" : "scale-[0.96] opacity-90",
                                    ].join(" ")}
                                >
                                    <img
                                        src={p.image.src}
                                        alt={p.title}
                                        loading={i === 0 ? "eager" : "lazy"}
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />

                                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center px-6">
                                        <h3 className="text-white text-2xl md:text-4xl font-extrabold drop-shadow-md">
                                            {p.title}
                                        </h3>
                                        <div className="mt-2 h-[2px] w-16 bg-white/70" />
                                        <p className="mt-2 text-white/90 text-sm md:text-base font-medium">{p.subtitle}</p>
                                    </div>
                                </article>
                            )
                        })}
                    </div>
                </div>

                {/* controls */}
                <div className="mt-10 md:mt-12 flex items-center justify-center gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Previous project"
                        className="h-12 w-12 rounded-full bg-transparent"
                        onClick={prev}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>

                    <Button asChild aria-label="Explore all projects" className="h-12 px-8 rounded-full">
                        <Link href="/our-projects/">Explore All</Link>
                    </Button>

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        aria-label="Next project"
                        className="h-12 w-12 rounded-full bg-transparent"
                        onClick={next}
                    >
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>
        </section>
    )
}