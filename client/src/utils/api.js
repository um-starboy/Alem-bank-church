// Base URL — reads from .env in client
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// ── Token storage ─────────────────────────────────────────────────────────────
export const getAccessToken  = () => localStorage.getItem('accessToken')
export const getRefreshToken = () => localStorage.getItem('refreshToken')
export const setTokens = (access, refresh) => {
  localStorage.setItem('accessToken', access)
  if (refresh) localStorage.setItem('refreshToken', refresh)
}
export const clearTokens = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('authUser')
}

// ── Core fetch with auto token refresh ───────────────────────────────────────
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach(p => error ? p.reject(error) : p.resolve(token))
  failedQueue = []
}

export const apiFetch = async (path, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  const token = getAccessToken()
  if (token) headers['Authorization'] = `Bearer ${token}`

  let res = await fetch(`${BASE}${path}`, { ...options, headers })

  // Auto-refresh on 401 TOKEN_EXPIRED
  if (res.status === 401) {
    const body = await res.clone().json().catch(() => ({}))
    if (body.code === 'TOKEN_EXPIRED') {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(newToken => {
          headers['Authorization'] = `Bearer ${newToken}`
          return fetch(`${BASE}${path}`, { ...options, headers })
        })
      }

      isRefreshing = true
      const refreshToken = getRefreshToken()

      try {
        const refreshRes = await fetch(`${BASE}/auth/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })

        if (!refreshRes.ok) throw new Error('Refresh failed')
        const { accessToken } = await refreshRes.json()
        setTokens(accessToken, null)
        processQueue(null, accessToken)

        headers['Authorization'] = `Bearer ${accessToken}`
        res = await fetch(`${BASE}${path}`, { ...options, headers })
      } catch (err) {
        processQueue(err)
        clearTokens()
        window.location.href = '/login'
        throw err
      } finally {
        isRefreshing = false
      }
    }
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(errBody.error || 'Request failed')
  }

  return res.json()
}

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (username, password) =>
    apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  logout: (refreshToken) =>
    apiFetch('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken }) }),

  me: () => apiFetch('/auth/me'),

  changePassword: (currentPassword, newPassword) =>
    apiFetch('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
}

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersAPI = {
  getAll: () => apiFetch('/users'),
  create: (data) => apiFetch('/users', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => apiFetch(`/users/${id}`, { method: 'DELETE' }),
  toggleActive: (id) => apiFetch(`/users/${id}/toggle-active`, { method: 'PATCH' }),
  resetPassword: (id, newPassword) =>
    apiFetch(`/users/${id}/reset-password`, { method: 'POST', body: JSON.stringify({ newPassword }) }),
}

// ── Content ───────────────────────────────────────────────────────────────────
export const churchAPI = {
  getInfo:    () => apiFetch('/church-info'),
  updateInfo: (data) => apiFetch('/church-info', { method: 'PUT', body: JSON.stringify(data) }),
  getHero:    () => apiFetch('/hero'),
  updateHero: (data) => apiFetch('/hero', { method: 'PUT', body: JSON.stringify(data) }),
  getAbout:   () => apiFetch('/about'),
  updateAbout: (key, data) => apiFetch(`/about/${key}`, { method: 'PUT', body: JSON.stringify(data) }),
}

export const sermonsAPI = {
  getAll:  () => apiFetch('/sermons'),
  create:  (data) => apiFetch('/sermons', { method: 'POST', body: JSON.stringify(data) }),
  update:  (id, data) => apiFetch(`/sermons/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete:  (id) => apiFetch(`/sermons/${id}`, { method: 'DELETE' }),
}

export const eventsAPI = {
  getAll:  () => apiFetch('/events'),
  create:  (data) => apiFetch('/events', { method: 'POST', body: JSON.stringify(data) }),
  update:  (id, data) => apiFetch(`/events/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete:  (id) => apiFetch(`/events/${id}`, { method: 'DELETE' }),
}

export const ministriesAPI = {
  getAll:  () => apiFetch('/ministries'),
  create:  (data) => apiFetch('/ministries', { method: 'POST', body: JSON.stringify(data) }),
  update:  (id, data) => apiFetch(`/ministries/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete:  (id) => apiFetch(`/ministries/${id}`, { method: 'DELETE' }),
}

export const galleryAPI = {
  getAll:  () => apiFetch('/gallery'),
  create:  (data) => apiFetch('/gallery', { method: 'POST', body: JSON.stringify(data) }),
  delete:  (id) => apiFetch(`/gallery/${id}`, { method: 'DELETE' }),
}

export const prayerAPI = {
  submit:  (data) => apiFetch('/prayer', { method: 'POST', body: JSON.stringify(data) }),
  getAll:  () => apiFetch('/prayer'),
  markRead: (id) => apiFetch(`/prayer/${id}/read`, { method: 'PATCH' }),
}

// ── Upload ────────────────────────────────────────────────────────────────────
export const uploadAPI = {
  gallery: async (file, alt, category) => {
    const form = new FormData()
    form.append('file', file)
    if (alt) form.append('alt', alt)
    if (category) form.append('category', category)
    const token = getAccessToken()
    const res = await fetch(`${BASE}/upload/gallery`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
    return res.json()
  },

  hero: async (file) => {
    const form = new FormData()
    form.append('file', file)
    const token = getAccessToken()
    const res = await fetch(`${BASE}/upload/hero`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
    return res.json()
  },

  sermonThumbnail: async (file, sermonId) => {
    const form = new FormData()
    form.append('file', file)
    if (sermonId) form.append('sermonId', sermonId)
    const token = getAccessToken()
    const res = await fetch(`${BASE}/upload/sermon-thumbnail`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    })
    if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
    return res.json()
  },

  getMedia: (folder, type) => {
    const params = new URLSearchParams()
    if (folder) params.set('folder', folder)
    if (type) params.set('type', type)
    return apiFetch(`/upload/media?${params}`)
  },

  deleteMedia: (id) => apiFetch(`/upload/media/${id}`, { method: 'DELETE' }),
}

export const pastorsAPI = {
  getList: () => apiFetch('/pastors-list'),
}
