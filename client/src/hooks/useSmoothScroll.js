import { useEffect, useRef } from 'react'

export const useSmoothScroll = () => {
  const lenisRef = useRef(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    // FIX: Track rafId outside initLenis so cleanup can cancel it
    let rafId

    const initLenis = async () => {
      try {
        const Lenis = (await import('@studio-freight/lenis')).default
        const lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          direction: 'vertical',
          gestureDirection: 'vertical',
          smooth: true,
          mouseMultiplier: 1,
          smoothTouch: false,
          touchMultiplier: 2,
          infinite: false,
        })

        lenisRef.current = lenis

        function raf(time) {
          lenis.raf(time)
          rafId = requestAnimationFrame(raf)
        }

        rafId = requestAnimationFrame(raf)
      } catch (error) {
        console.warn('Lenis smooth scroll failed to initialize:', error)
      }
    }

    initLenis()

    return () => {
      // FIX: Cancel the RAF loop before destroying lenis
      if (rafId) cancelAnimationFrame(rafId)
      if (lenisRef.current) {
        lenisRef.current.destroy()
        lenisRef.current = null
      }
    }
  }, [])

  const scrollTo = (target, options = {}) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, options)
    } else {
      const element = typeof target === 'string' ? document.querySelector(target) : target
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', ...options })
      }
    }
  }

  return { scrollTo, lenis: lenisRef }
}

export default useSmoothScroll
