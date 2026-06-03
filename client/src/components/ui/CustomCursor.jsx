import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

const CustomCursor = ({ variant }) => {
  const [isVisible, setIsVisible] = useState(false)

  const cursorX = useMotionValue(-100)
  const cursorY = useMotionValue(-100)
  const cursorSize = useMotionValue(8)
  const outlineSize = useMotionValue(40)

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 }
  const cursorXSpring = useSpring(cursorX, springConfig)
  const cursorYSpring = useSpring(cursorY, springConfig)
  const cursorSizeSpring = useSpring(cursorSize, { damping: 20, stiffness: 400 })
  const outlineSizeSpring = useSpring(outlineSize, { damping: 20, stiffness: 400 })

  useEffect(() => {
    let rafId
    let mouseX = 0
    let mouseY = 0

    const moveCursor = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      // FIX: Always call setIsVisible(true) — avoids stale closure bug
      setIsVisible(true)
    }

    const updateCursor = () => {
      cursorX.set(mouseX)
      cursorY.set(mouseY)
      rafId = requestAnimationFrame(updateCursor)
    }

    const handleMouseLeave = () => setIsVisible(false)
    const handleMouseEnter = () => setIsVisible(true)

    window.addEventListener('mousemove', moveCursor, { passive: true })
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)
    document.documentElement.addEventListener('mouseenter', handleMouseEnter)

    rafId = requestAnimationFrame(updateCursor)

    return () => {
      window.removeEventListener('mousemove', moveCursor)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
      document.documentElement.removeEventListener('mouseenter', handleMouseEnter)
      cancelAnimationFrame(rafId)
    }
  }, [cursorX, cursorY])

  useEffect(() => {
    switch (variant) {
      case 'text':
        cursorSize.set(40)
        outlineSize.set(80)
        break
      case 'button':
        cursorSize.set(20)
        outlineSize.set(60)
        break
      case 'link':
        cursorSize.set(16)
        outlineSize.set(50)
        break
      default:
        cursorSize.set(8)
        outlineSize.set(40)
    }
  }, [variant, cursorSize, outlineSize])

  return (
    <div aria-hidden="true">
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999]"
        style={{ x: cursorXSpring, y: cursorYSpring, opacity: isVisible ? 1 : 0 }}
      >
        <motion.div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-subtle-gold"
          style={{
            width: cursorSizeSpring,
            height: cursorSizeSpring,
            boxShadow: '0 0 20px rgba(201, 169, 110, 0.5)',
          }}
        />
      </motion.div>
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9998]"
        style={{ x: cursorXSpring, y: cursorYSpring, opacity: isVisible ? 1 : 0 }}
      >
        <motion.div
          className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-subtle-gold/30"
          style={{ width: outlineSizeSpring, height: outlineSizeSpring }}
        />
      </motion.div>
    </div>
  )
}

export default React.memo(CustomCursor)
