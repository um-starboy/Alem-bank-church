import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { churchAPI, sermonsAPI, eventsAPI, ministriesAPI, galleryAPI } from '../utils/api'

const ChurchDataContext = createContext(null)

const defaultData = {
  churchInfo: { name: 'አለም ባንክ ገነት ቤተ ክርስቲያን', shortName: 'አለም ባንክ ገነት', tagline: 'A place of worship, transformation, and divine encounter', description: 'Experience the presence of God in a life-changing way.', pastorName: '', pastorMessage: '', address: '', phone: '', email: '', socialLinks: { facebook: '', instagram: '', youtube: '', telegram: '' } },
  hero: { title: 'አለም ባንክ ገነት', subtitle: 'ቤተ ክርስቲያን', primaryButtonText: 'Join Us This Sunday', primaryButtonLink: '#contact', secondaryButtonText: 'Watch Live', secondaryButtonLink: '#', backgroundType: 'gradient', backgroundImage: '', backgroundVideo: '' },
  about: { mission: { title: 'Our Mission', description: '', icon: '✝️' }, vision: { title: 'Our Vision', description: '', icon: '👁️' }, story: { title: 'Our Story', description: '', icon: '📖' } },
  sermons: [], events: [], ministries: [], gallery: [],
  contact: { address: '', phone: '', email: '', mapEmbedUrl: '' },
}

export const ChurchDataProvider = ({ children }) => {
  const [churchData, setChurchData] = useState(defaultData)
  const [loading, setLoading] = useState(true)

  // Load all data from API on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [churchInfo, hero, sermons, events, ministries, gallery] = await Promise.allSettled([
          contentAPI.getInfo(),
          contentAPI.getHero(),
          sermonsAPI.getAll(),
          fetch(`${import.meta.env.VITE_API_URL}/events`).then(r => r.json()),
          fetch(`${import.meta.env.VITE_API_URL}/ministries`).then(r => r.json()),
          fetch(`${import.meta.env.VITE_API_URL}/gallery`).then(r => r.json()),
        ])

        setChurchData(prev => ({
          ...prev,
          churchInfo: churchInfo.status === 'fulfilled' ? { ...prev.churchInfo, ...churchInfo.value } : prev.churchInfo,
          hero: hero.status === 'fulfilled' ? { ...prev.hero, ...hero.value } : prev.hero,
          sermons: sermons.status === 'fulfilled' ? (Array.isArray(sermons.value) ? sermons.value : []) : [],
          events: events.status === 'fulfilled' ? (Array.isArray(events.value) ? events.value : []) : [],
          ministries: ministries.status === 'fulfilled' ? (Array.isArray(ministries.value) ? ministries.value : []) : [],
          gallery: gallery.status === 'fulfilled' ? (Array.isArray(gallery.value) ? gallery.value : []) : [],
        }))
      } catch (err) {
        console.error('Failed to load church data:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Church Info ──────────────────────────────────────────────────────────────
  const updateChurchInfo = useCallback(async (info) => {
    await churchAPI.updateInfo(info)
    setChurchData(prev => ({ ...prev, churchInfo: { ...prev.churchInfo, ...info } }))
  }, [])

  // ── Hero ─────────────────────────────────────────────────────────────────────
  const updateHero = useCallback(async (heroData) => {
    await churchAPI.updateHero(heroData)
    setChurchData(prev => ({ ...prev, hero: { ...prev.hero, ...heroData } }))
  }, [])

  // ── About ────────────────────────────────────────────────────────────────────
  const updateAbout = useCallback(async (aboutData) => {
    for (const key of Object.keys(aboutData)) {
      await churchAPI.updateAbout(key, aboutData[key])
    }
    setChurchData(prev => ({ ...prev, about: { ...prev.about, ...aboutData } }))
  }, [])

  // ── Sermons ──────────────────────────────────────────────────────────────────
  const addSermon = useCallback(async (sermon) => {
    const created = await sermonsAPI.create(sermon)
    setChurchData(prev => ({ ...prev, sermons: [...prev.sermons, created] }))
  }, [])

  const updateSermon = useCallback(async (id, sermonData) => {
    const updated = await sermonsAPI.update(id, sermonData)
    setChurchData(prev => ({ ...prev, sermons: prev.sermons.map(s => s.id === id ? updated : s) }))
  }, [])

  const deleteSermon = useCallback(async (id) => {
    await sermonsAPI.delete(id)
    setChurchData(prev => ({ ...prev, sermons: prev.sermons.filter(s => s.id !== id) }))
  }, [])

  // ── Events ───────────────────────────────────────────────────────────────────
  const addEvent = useCallback(async (event) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/events`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
      body: JSON.stringify(event)
    })
    const created = await res.json()
    setChurchData(prev => ({ ...prev, events: [...prev.events, created] }))
  }, [])

  const updateEvent = useCallback(async (id, eventData) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/events/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
      body: JSON.stringify(eventData)
    })
    const updated = await res.json()
    setChurchData(prev => ({ ...prev, events: prev.events.map(e => e.id === id ? updated : e) }))
  }, [])

  const deleteEvent = useCallback(async (id) => {
    await fetch(`${import.meta.env.VITE_API_URL}/events/${id}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    })
    setChurchData(prev => ({ ...prev, events: prev.events.filter(e => e.id !== id) }))
  }, [])

  // ── Ministries ───────────────────────────────────────────────────────────────
  const addMinistry = useCallback(async (ministry) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/ministries`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
      body: JSON.stringify(ministry)
    })
    const created = await res.json()
    setChurchData(prev => ({ ...prev, ministries: [...prev.ministries, created] }))
  }, [])

  const updateMinistry = useCallback(async (id, ministryData) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/ministries/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
      body: JSON.stringify(ministryData)
    })
    const updated = await res.json()
    setChurchData(prev => ({ ...prev, ministries: prev.ministries.map(m => m.id === id ? updated : m) }))
  }, [])

  const deleteMinistry = useCallback(async (id) => {
    await fetch(`${import.meta.env.VITE_API_URL}/ministries/${id}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    })
    setChurchData(prev => ({ ...prev, ministries: prev.ministries.filter(m => m.id !== id) }))
  }, [])

  // ── Gallery ──────────────────────────────────────────────────────────────────
  const addGalleryItem = useCallback(async (item) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/gallery`, {
      method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` },
      body: JSON.stringify(item)
    })
    const created = await res.json()
    setChurchData(prev => ({ ...prev, gallery: [...prev.gallery, created] }))
  }, [])

  const updateGalleryItem = useCallback(async (id, itemData) => {
    setChurchData(prev => ({ ...prev, gallery: prev.gallery.map(g => g.id === id ? { ...g, ...itemData } : g) }))
  }, [])

  const deleteGalleryItem = useCallback(async (id) => {
    await fetch(`${import.meta.env.VITE_API_URL}/gallery/${id}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
    })
    setChurchData(prev => ({ ...prev, gallery: prev.gallery.filter(g => g.id !== id) }))
  }, [])

  // ── Contact ──────────────────────────────────────────────────────────────────
  const updateContact = useCallback(async (contactData) => {
    setChurchData(prev => ({ ...prev, contact: { ...prev.contact, ...contactData } }))
  }, [])

  const resetToDefault = useCallback(() => setChurchData(defaultData), [])

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(churchData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const link = document.createElement('a')
    link.setAttribute('href', dataUri)
    link.setAttribute('download', `church-data-backup-${new Date().toISOString().split('T')[0]}.json`)
    link.click()
  }, [churchData])

  const importData = useCallback((jsonData) => {
    try {
      const parsed = JSON.parse(jsonData)
      if (parsed && typeof parsed === 'object') { setChurchData(parsed); return true }
      return false
    } catch { return false }
  }, [])

  return (
    <ChurchDataContext.Provider value={{
      churchData, loading,
      updateChurchInfo, updateHero, updateAbout,
      addSermon, updateSermon, deleteSermon,
      addEvent, updateEvent, deleteEvent,
      addMinistry, updateMinistry, deleteMinistry,
      addGalleryItem, updateGalleryItem, deleteGalleryItem,
      updateContact, resetToDefault, exportData, importData,
    }}>
      {children}
    </ChurchDataContext.Provider>
  )
}

export const useChurchData = () => {
  const context = useContext(ChurchDataContext)
  if (!context) throw new Error('useChurchData must be used within a ChurchDataProvider')
  return context
}
