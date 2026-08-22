"use client"

import { useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function useGsapPin(ref, options = {}) {
    useEffect(() => {
        if (typeof window === "undefined") return
        const section = ref.current
        if (!section) return

        const isDesktop = window.innerWidth >= 1024

        // Full-page screenshot tools (technicalseo Fetch & Render, Googlebot's
        // renderer) expand the viewport to the height of the whole document.
        // A pinned section then covers everything below it, so the page looks
        // like one giant banner. Skip pinning at those viewport heights.
        const isScreenshotViewport = window.innerHeight > 2000

        if (!isDesktop || isScreenshotViewport) return

        const trigger = ScrollTrigger.create({
            trigger: section,
            start: "center center",
            end: "bottom top",
            pin: true,
            pinSpacing: false,
            ...options,
        })

        return () => trigger.kill()
    }, [ref])
}