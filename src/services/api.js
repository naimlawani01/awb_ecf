import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authApi = {
  login: async (username, password) => {
    const response = await api.post('/auth/login/json', { username, password })
    return response.data
  },
  
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
  
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    })
    return response.data
  },
}

// Documents API
export const documentsApi = {
  list: async (params = {}) => {
    const response = await api.get('/documents', { params })
    return response.data
  },
  
  getById: async (id) => {
    const response = await api.get(`/documents/${id}`)
    return response.data
  },
  
  getByAwb: async (awbNumber) => {
    const response = await api.get(`/documents/by-awb/${awbNumber}`)
    return response.data
  },
  
  search: async (query, limit = 50) => {
    const response = await api.get('/documents/search', { params: { q: query, limit } })
    return response.data
  },
  
  getRecent: async (days = 7, limit = 50) => {
    const response = await api.get('/documents/recent', { params: { days, limit } })
    return response.data
  },
  
  getByClient: async (clientName, clientType = 'shipper', limit = 100) => {
    const response = await api.get(`/documents/client/${encodeURIComponent(clientName)}`, {
      params: { client_type: clientType, limit }
    })
    return response.data
  },
  
  getLogs: async (documentId) => {
    const response = await api.get(`/documents/${documentId}/logs`)
    return response.data
  },
  
  getDetails: async (documentId) => {
    const response = await api.get(`/documents/${documentId}/details`)
    return response.data
  },
}

// Shipments API
export const shipmentsApi = {
  list: async (params = {}) => {
    const response = await api.get('/shipments', { params })
    return response.data
  },
  
  getById: async (id) => {
    const response = await api.get(`/shipments/${id}`)
    return response.data
  },
  
  getByNumber: async (number) => {
    const response = await api.get(`/shipments/by-number/${number}`)
    return response.data
  },
  
  getRecent: async (days = 7, limit = 50) => {
    const response = await api.get('/shipments/recent', { params: { days, limit } })
    return response.data
  },
  
  getPending: async () => {
    const response = await api.get('/shipments/pending')
    return response.data
  },
  
  getFiles: async (shipmentId) => {
    const response = await api.get(`/shipments/${shipmentId}/files`)
    return response.data
  },
}

// Contacts API
export const contactsApi = {
  list: async (params = {}) => {
    const response = await api.get('/contacts', { params })
    return response.data
  },
  
  getById: async (id) => {
    const response = await api.get(`/contacts/${id}`)
    return response.data
  },
  
  search: async (query, limit = 50) => {
    const response = await api.get('/contacts/search', { params: { q: query, limit } })
    return response.data
  },
  
  getStats: async () => {
    const response = await api.get('/contacts/stats')
    return response.data
  },
  
  getTopShippers: async (limit = 10) => {
    const response = await api.get('/contacts/top-shippers', { params: { limit } })
    return response.data
  },
  
  getTopConsignees: async (limit = 10) => {
    const response = await api.get('/contacts/top-consignees', { params: { limit } })
    return response.data
  },
  
  getDocuments: async (contactId, limit = 50) => {
    const response = await api.get(`/contacts/${contactId}/documents`, { params: { limit } })
    return response.data
  },
  
  getShipments: async (contactId, limit = 50) => {
    const response = await api.get(`/contacts/${contactId}/shipments`, { params: { limit } })
    return response.data
  },
}

// Statistics API
export const statisticsApi = {
  getDashboard: async () => {
    const response = await api.get('/statistics/dashboard')
    return response.data
  },
  
  getMonthlyVolume: async (startDate, endDate) => {
    const response = await api.get('/statistics/monthly-volume', {
      params: { start_date: startDate, end_date: endDate }
    })
    return response.data
  },
  
  getTopClients: async (limit = 10) => {
    const response = await api.get('/statistics/top-clients', { params: { limit } })
    return response.data
  },
  
  getDestinations: async (limit = 10) => {
    const response = await api.get('/statistics/destinations', { params: { limit } })
    return response.data
  },
  
  getSummary: async () => {
    const response = await api.get('/statistics/summary')
    return response.data
  },
  
  getTrends: async (days = 30) => {
    const response = await api.get('/statistics/trends', { params: { days } })
    return response.data
  },
  
  getRoutes: async (limit = 20) => {
    const response = await api.get('/statistics/routes', { params: { limit } })
    return response.data
  },
  
  getAirlines: async (limit = 10) => {
    const response = await api.get('/statistics/airlines', { params: { limit } })
    return response.data
  },
}

// Reference API
export const referenceApi = {
  getAirlines: async (params = {}) => {
    const response = await api.get('/reference/airlines', { params })
    return response.data
  },
  
  getAirports: async (params = {}) => {
    const response = await api.get('/reference/airports', { params })
    return response.data
  },
  
  getAirlineByPrefix: async (prefix) => {
    const response = await api.get(`/reference/airlines/by-prefix/${prefix}`)
    return response.data
  },
  
  getAirportByCode: async (code) => {
    const response = await api.get(`/reference/airports/by-code/${code}`)
    return response.data
  },
}

// Export API
export const exportApi = {
  downloadDocumentsExcel: async (params = {}) => {
    const response = await api.get('/exports/documents/excel', {
      params,
      responseType: 'blob',
    })
    return response.data
  },
  
  downloadDocumentsPdf: async (params = {}) => {
    const response = await api.get('/exports/documents/pdf', {
      params,
      responseType: 'blob',
    })
    return response.data
  },
  
  downloadShipmentsExcel: async (params = {}) => {
    const response = await api.get('/exports/shipments/excel', {
      params,
      responseType: 'blob',
    })
    return response.data
  },
  
  downloadContactsExcel: async (params = {}) => {
    const response = await api.get('/exports/contacts/excel', {
      params,
      responseType: 'blob',
    })
    return response.data
  },
  
  downloadStatisticsPdf: async () => {
    const response = await api.get('/exports/statistics/pdf', {
      responseType: 'blob',
    })
    return response.data
  },
  
  // Detailed reports with AWB data (pieces, weights, charges, routing)
  downloadDetailedReportExcel: async (params = {}) => {
    const response = await api.get('/exports/report/detailed/excel', {
      params,
      responseType: 'blob',
    })
    return response.data
  },
  
  downloadDetailedReportPdf: async (params = {}) => {
    const response = await api.get('/exports/report/detailed/pdf', {
      params,
      responseType: 'blob',
    })
    return response.data
  },
}

export default api

