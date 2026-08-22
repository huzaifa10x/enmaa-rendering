"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import image1 from "@/public/images/home-services/home1.webp"
import image2 from "@/public/images/home-services/home2.webp"
import image3 from "@/public/images/home-services/home3.webp"

import mobImage1 from "@/public/images/home-services/home1-mob.webp"
import mobImage2 from "@/public/images/home-services/home2-mob.webp"
import mobImage3 from "@/public/images/home-services/home3-mob.webp"
import Navbar from "../Navbar"
import useCounterAnimation from "./useCounterAnimation"

const slides = [
    {
        id: 1,
        title: "DISCOVER",
        subtitle: "DISCOVER CASE",
        background: image1,
        mobBg: mobImage1,
    },
    {
        id: 2,
        title: "EXPLORE",
        subtitle: "EXPLORE CASE",
        background: image2,
        mobBg: mobImage2,
    },
    {
        id: 3,
        title: "CREATE",
        subtitle: "CREATE CASE",
        background: image3,
        mobBg: mobImage3,
    },
]

// Must match the CSS duration on the text block below.
const FADE_MS = 300

export default function DiscoverSlider() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isReady, setIsReady] = useState(false)
    const [isFading, setIsFading] = useState(false)

    const sectionRef = useRef(null)
    const fadeTimer = useRef(null)

    const counterV1Ref = useRef(null)
    const counterV2Ref = useRef(null)
    const counterV3Ref = useRef(null)

    useCounterAnimation(counterV1Ref, 400)
    useCounterAnimation(counterV2Ref, 900)
    useCounterAnimation(counterV3Ref, 900)

    const date = new Date()
    const yearExp = date.getFullYear() - 2015

    const counterStyle = {
        WebkitTextStroke: "2px #fff",
        fontFamily: "system-ui",
    }

    // Let the browser finish the LCP paint before anything animates.
    useEffect(() => {
        const timer = setTimeout(() => setIsReady(true), 3000)
        return () => clearTimeout(timer)
    }, [])

    // CSS-only crossfade: fade out, swap, fade back in.
    const goToSlide = (newIndex) => {
        if (fadeTimer.current) clearTimeout(fadeTimer.current)
        setIsFading(true)
        fadeTimer.current = setTimeout(() => {
            setCurrentSlide(newIndex)
            setIsFading(false)
        }, FADE_MS)
    }

    const nextSlide = () => {
        if (!isReady) return
        goToSlide((currentSlide + 1) % slides.length)
    }

    const prevSlide = () => {
        if (!isReady) return
        goToSlide(currentSlide === 0 ? slides.length - 1 : currentSlide - 1)
    }

    useEffect(() => () => {
        if (fadeTimer.current) clearTimeout(fadeTimer.current)
    }, [])

    useEffect(() => {
        if (!isReady) return
        const interval = setInterval(() => {
            goToSlide((currentSlide + 1) % slides.length)
        }, 5000)
        return () => clearInterval(interval)
    }, [currentSlide, isReady])

    const textFadeClass = isFading
        ? "opacity-0 -translate-y-6"
        : "opacity-100 translate-y-0"

    return (
        <div ref={sectionRef} className="relative h-screen w-full overflow-hidden bg-black">

            {/* Desktop Images */}
            <div className="hidden lg:block absolute inset-0 z-0">
                {slides.map((slide, index) => (
                    <div
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
                            }`}
                    >
                        <img
                            src={slide.background.src}
                            alt={slide.title}
                            loading={index === 0 ? "eager" : "lazy"}
                            className="absolute inset-0 h-full w-full object-cover object-center"
                        />
                    </div>
                ))}
                <div className="absolute inset-0 bg-black/40 z-10" />
            </div>

            {/* Mobile Images */}
            <div className="lg:hidden absolute inset-0 z-0">
                {slides.map((slide, index) => (
                    <div
                        key={`mob-${slide.id}`}
                        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
                            }`}
                    >
                        <img
                            src={slide.mobBg.src}
                            alt={slide.title}
                            loading={index === 0 ? "eager" : "lazy"}
                            className="absolute inset-0 h-full w-full object-cover object-center"
                        />
                    </div>
                ))}
                <div className="absolute inset-0 bg-black/40 z-10" />
            </div>

            <Navbar />

            {/* Main Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-evenly z-20">
                <div></div>

                <div
                    className={`text-center will-change-transform transition-all duration-300 ease-out ${textFadeClass}`}
                >
                    <p className="text-5xl md:text-6xl lg:text-9xl text-white font-black mb-4 tracking-tight block fallback-font-fix">
                        {slides[currentSlide].title}
                    </p>
                    <p className="text-white/80 text-lg tracking-[0.3em] font-light">
                        {slides[currentSlide].subtitle}
                    </p>
                </div>

                <div className="absolute bottom-0 w-full h-[200px] bg-gradient-to-t from-black via-black/55 to-transparent z-10"></div>

                <div className="lg:max-w-4xl w-full mx-auto z-20">
                    <div className="bottom-20 grid grid-cols-3">
                        {/* Counter 1 */}
                        <div className="relative md:left-0">
                            <div
                                ref={counterV2Ref}
                                data-value="2750"
                                className="text-4xl lg:text-6xl xl:text-[60px] text-center font-light text-transparent lg:-mb-2 font-ps"
                                style={counterStyle}
                            >
                                0
                            </div>
                            <p className="text-xs text-white mt-5 text-center md:tracking-[0.15em] font-medium">
                                NUMBER OF <br /> CLIENTS
                            </p>
                        </div>

                        {/* Counter 2 */}
                        <div className="relative md:left-0">
                            <div
                                ref={counterV1Ref}
                                data-value={yearExp}
                                className="text-4xl lg:text-6xl xl:text-[60px] text-center font-light text-transparent lg:-mb-2 font-ps"
                                style={counterStyle}
                            >
                                0
                            </div>
                            <p className="text-xs text-white mt-5 text-center md:tracking-[0.15em] font-medium">
                                YEARS OF <br /> EXPERIENCE
                            </p>
                        </div>

                        {/* Counter 3 */}
                        <div className="md:ml-10 relative md:left-0">
                            <div
                                ref={counterV3Ref}
                                data-value="2963"
                                className="text-4xl lg:text-6xl xl:text-[60px] text-center font-light text-transparent lg:-mb-2 font-ps"
                                style={counterStyle}
                            >
                                0
                            </div>
                            <p className="text-xs text-white mt-5 text-center md:tracking-[0.15em] font-medium">
                                COMPLETED <br /> PROJECTS
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Navigation */}
                <div className="bottom-16 left-0 right-0 z-30 max-w-7xl w-full mx-auto">
                    <div className="flex items-center justify-between px-8">
                        <div className="flex items-center space-x-8">
                            <div className="flex items-center space-x-4 text-white/60 text-sm">
                                <span>{String(currentSlide + 1).padStart(2, "0")}</span>
                                <div className="w-24 h-px bg-white/20 relative">
                                    <div
                                        className="absolute left-0 top-0 h-full bg-white transition-all duration-500 ease-out"
                                        style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
                                    />
                                </div>
                                <span>{String(slides.length).padStart(2, "0")}</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-6">
                            <Button
                                variant="ghost"
                                disabled={!isReady}
                                onClick={prevSlide}
                                className="text-white text-sm tracking-wider font-light disabled:opacity-50"
                            >
                                PREV
                            </Button>
                            <Button
                                variant="ghost"
                                disabled={!isReady}
                                onClick={nextSlide}
                                className="text-white text-sm tracking-wider font-light disabled:opacity-50"
                            >
                                NEXT
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}