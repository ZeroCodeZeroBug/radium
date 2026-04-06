const API_BASE = 'http://localhost:3001/api'

async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }))
    throw new Error(error.error || 'Request failed')
  }
  return response.json()
}

export const api = {
  async getProfiles() {
    return fetchAPI('/profiles')
  },

  async getProfileByUsername(username) {
    return fetchAPI(`/profiles/${username}`)
  },

  async getProfileByAuth0Id(auth0Id) {
    return fetchAPI(`/profiles/auth0/${auth0Id}`)
  },

  async createProfile(profile) {
    return fetchAPI('/profiles', {
      method: 'POST',
      body: JSON.stringify(profile),
    })
  },

  async updateProfile(id, updates) {
    return fetchAPI(`/profiles/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  },

  async incrementViewCount(id) {
    return fetchAPI(`/profiles/increment-view/${id}`, {
      method: 'POST',
    })
  },

  async getTemplates(filters = {}) {
    const params = new URLSearchParams(filters).toString()
    return fetchAPI(`/templates${params ? '?' + params : ''}`)
  },

  async getTemplateByShareId(shareId) {
    return fetchAPI(`/templates/${shareId}`)
  },

  async createTemplate(template) {
    return fetchAPI('/templates', {
      method: 'POST',
      body: JSON.stringify(template),
    })
  },

  async updateTemplate(id, updates) {
    return fetchAPI(`/templates/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    })
  },

  async deleteTemplate(id) {
    return fetchAPI(`/templates/${id}`, {
      method: 'DELETE',
    })
  },

  async incrementTemplateViews(id) {
    return fetchAPI(`/templates/increment-views/${id}`, {
      method: 'POST',
    })
  },

  async toggleTemplateLike(templateId, userId) {
    return fetchAPI('/templates/like', {
      method: 'POST',
      body: JSON.stringify({ template_id: templateId, user_id: userId }),
    })
  },

  async getAdmins() {
    return fetchAPI('/admins')
  },

  async createAdmin(admin) {
    return fetchAPI('/admins', {
      method: 'POST',
      body: JSON.stringify(admin),
    })
  },

  async deleteAdmin(id) {
    return fetchAPI(`/admins/${id}`, {
      method: 'DELETE',
    })
  },
}
