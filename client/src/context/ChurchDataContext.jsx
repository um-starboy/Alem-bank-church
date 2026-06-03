import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

const ChurchDataContext = createContext(null)

const defaultData = {
  churchInfo: {
    name: 'አለም ባንክ ገነት ቤተ ክርስቲያን',
    shortName: 'አለም ባንክ ገነት',
    tagline: 'A place of worship, transformation, and divine encounter',
    description: 'Experience the presence of God in a life-changing way.',
    pastorName: '',
    pastorMessage: '',
    address: '',
    phone: '',
    email: '',
    socialLinks: {
      facebook: '',
      instagram: '',
      youtube: '',
      telegram: '',
    },
  },
  hero: {
    title: 'አለም ባንክ ገነት',
    subtitle: 'ቤተ ክርስቲያን',
    primaryButtonText: 'Join Us This Sunday',
    primaryButtonLink: '#contact',
    secondaryButtonText: 'Watch Live',
    secondaryButtonLink: '#',
    backgroundType: 'gradient',
    backgroundImage: '',
    backgroundVideo: '',
  },
  about: {
    mission: { title: 'Our Mission', description: '', icon: '✝️' },
    vision: { title: 'Our Vision', description: '', icon: '👁️' },
    story: { title: 'Our Story', description: '', icon: '📖' },
  },
  sermons: [],
  events: [],
  ministries: [],
  gallery: [],
  contact: {
    address: '',
    phone: '',
    email: '',
    mapEmbedUrl: '',
  },
}

const deepMergeDefaults = (parsed) => {
  return {
    ...defaultData,
    ...parsed,
    churchInfo: {
      ...defaultData.churchInfo,
      ...(parsed.churchInfo || {}),
      socialLinks: {
        ...defaultData.churchInfo.socialLinks,
        ...(parsed.churchInfo?.socialLinks || {}),
      },
    },
    hero: { ...defaultData.hero, ...(parsed.hero || {}) },
    about: {
      mission: { ...defaultData.about.mission, ...(parsed.about?.mission || {}) },
      vision: { ...defaultData.about.vision, ...(parsed.about?.vision || {}) },
      story: { ...defaultData.about.story, ...(parsed.about?.story || {}) },
    },
    sermons: Array.isArray(parsed.sermons) ? parsed.sermons : [],
    events: Array.isArray(parsed.events) ? parsed.events : [],
    ministries: Array.isArray(parsed.ministries) ? parsed.ministries : [],
    gallery: Array.isArray(parsed.gallery) ? parsed.gallery : [],
    contact: { ...defaultData.contact, ...(parsed.contact || {}) },
  }
}

// FIX: Use crypto.randomUUID() instead of Date.now() to avoid ID collisions
const generateId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const ChurchDataProvider = ({ children }) => {
  const [churchData, setChurchData] = useState(() => {
    try {
      const saved = localStorage.getItem('churchData')
      if (saved) {
        const parsed = JSON.parse(saved)
        return deepMergeDefaults(parsed)
      }
    } catch (error) {
      console.error('Error loading church data from localStorage:', error)
    }
    return defaultData
  })

  useEffect(() => {
    try {
      localStorage.setItem('churchData', JSON.stringify(churchData))
    } catch (error) {
      console.error('Error saving church data to localStorage:', error)
    }
  }, [churchData])

  const updateChurchInfo = useCallback((info) => {
    setChurchData(prev => ({ ...prev, churchInfo: { ...prev.churchInfo, ...info } }))
  }, [])

  const updateHero = useCallback((heroData) => {
    setChurchData(prev => ({ ...prev, hero: { ...prev.hero, ...heroData } }))
  }, [])

  const updateAbout = useCallback((aboutData) => {
    setChurchData(prev => ({ ...prev, about: { ...prev.about, ...aboutData } }))
  }, [])

  const addSermon = useCallback((sermon) => {
    setChurchData(prev => ({
      ...prev,
      sermons: [...prev.sermons, { ...sermon, id: generateId(), createdAt: new Date().toISOString() }]
    }))
  }, [])

  const updateSermon = useCallback((id, sermonData) => {
    setChurchData(prev => ({
      ...prev,
      sermons: prev.sermons.map(s => s.id === id ? { ...s, ...sermonData, updatedAt: new Date().toISOString() } : s)
    }))
  }, [])

  const deleteSermon = useCallback((id) => {
    setChurchData(prev => ({ ...prev, sermons: prev.sermons.filter(s => s.id !== id) }))
  }, [])

  const addEvent = useCallback((event) => {
    setChurchData(prev => ({
      ...prev,
      events: [...prev.events, { ...event, id: generateId(), createdAt: new Date().toISOString() }]
    }))
  }, [])

  const updateEvent = useCallback((id, eventData) => {
    setChurchData(prev => ({
      ...prev,
      events: prev.events.map(e => e.id === id ? { ...e, ...eventData, updatedAt: new Date().toISOString() } : e)
    }))
  }, [])

  const deleteEvent = useCallback((id) => {
    setChurchData(prev => ({ ...prev, events: prev.events.filter(e => e.id !== id) }))
  }, [])

  const addMinistry = useCallback((ministry) => {
    setChurchData(prev => ({
      ...prev,
      ministries: [...prev.ministries, { ...ministry, id: generateId() }]
    }))
  }, [])

  const updateMinistry = useCallback((id, ministryData) => {
    setChurchData(prev => ({
      ...prev,
      ministries: prev.ministries.map(m => m.id === id ? { ...m, ...ministryData } : m)
    }))
  }, [])

  const deleteMinistry = useCallback((id) => {
    setChurchData(prev => ({ ...prev, ministries: prev.ministries.filter(m => m.id !== id) }))
  }, [])

  const addGalleryItem = useCallback((item) => {
    setChurchData(prev => ({
      ...prev,
      gallery: [...prev.gallery, { ...item, id: generateId() }]
    }))
  }, [])

  // FIX: Added missing updateGalleryItem function
  const updateGalleryItem = useCallback((id, itemData) => {
    setChurchData(prev => ({
      ...prev,
      gallery: prev.gallery.map(g => g.id === id ? { ...g, ...itemData } : g)
    }))
  }, [])

  const deleteGalleryItem = useCallback((id) => {
    setChurchData(prev => ({ ...prev, gallery: prev.gallery.filter(g => g.id !== id) }))
  }, [])

  const updateContact = useCallback((contactData) => {
    setChurchData(prev => ({ ...prev, contact: { ...prev.contact, ...contactData } }))
  }, [])

  const resetToDefault = useCallback(() => {
    setChurchData(defaultData)
  }, [])

  const exportData = useCallback(() => {
    const dataStr = JSON.stringify(churchData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', `church-data-backup-${new Date().toISOString().split('T')[0]}.json`)
    linkElement.click()
  }, [churchData])

  const importData = useCallback((jsonData) => {
    try {
      const parsed = JSON.parse(jsonData)
      if (parsed && typeof parsed === 'object') {
        setChurchData(deepMergeDefaults(parsed))
        return true
      }
      return false
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }, [])

  const value = {
    churchData,
    updateChurchInfo,
    updateHero,
    updateAbout,
    addSermon,
    updateSermon,
    deleteSermon,
    addEvent,
    updateEvent,
    deleteEvent,
    addMinistry,
    updateMinistry,
    deleteMinistry,
    addGalleryItem,
    updateGalleryItem,
    deleteGalleryItem,
    updateContact,
    resetToDefault,
    exportData,
    importData,
  }

  return (
    <ChurchDataContext.Provider value={value}>
      {children}
    </ChurchDataContext.Provider>
  )
}

export const useChurchData = () => {
  const context = useContext(ChurchDataContext)
  if (!context) {
    throw new Error('useChurchData must be used within a ChurchDataProvider')
  }
  return context
}
