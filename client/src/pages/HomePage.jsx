import React from 'react'
import { motion } from 'framer-motion'
import HeroSection from '../components/hero/HeroSection'
import AboutSection from '../components/about/AboutSection'
import SermonsSection from '../components/sermons/SermonsSection'
import EventsSection from '../components/events/EventsSection'
import MinistriesSection from '../components/ministries/MinistriesSection'
import GallerySection from '../components/gallery/GallerySection'
import ContactSection from '../components/contact/ContactSection'
import Footer from '../components/layout/Footer'
import { useSmoothScroll } from '../hooks/useSmoothScroll'

const HomePage = ({ setCursorVariant }) => {
  useSmoothScroll()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <HeroSection setCursorVariant={setCursorVariant} />
      <AboutSection setCursorVariant={setCursorVariant} />
      <SermonsSection setCursorVariant={setCursorVariant} />
      <EventsSection setCursorVariant={setCursorVariant} />
      <MinistriesSection setCursorVariant={setCursorVariant} />
      <GallerySection setCursorVariant={setCursorVariant} />
      <ContactSection setCursorVariant={setCursorVariant} />
      <Footer setCursorVariant={setCursorVariant} />
    </motion.div>
  )
}

export default HomePage
