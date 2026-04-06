import { api } from '../lib/api'

const API_BASE = 'http://localhost:3001/api'

export const supabase = {
  from: (table) => {
    return {
      select: (columns) => {
        return {
          eq: (column, value) => {
            return {
              ...buildQuery(table, { eq: { [column]: value } }),
              order: (column, opts) => buildQuery(table, { eq: { [column]: value }, order: { column, ...opts } }),
              maybeSingle: () => fetchOne(table, { [column]: value }),
              single: () => fetchOne(table, { [column]: value }),
            }
          },
          order: (column, opts) => buildQuery(table, { order: { column, ...opts } }),
          limit: (n) => buildQuery(table, { limit: n }),
          toArray: () => fetchAll(table),
        }
      },
      insert: (data) => {
        return {
          select: () => ({ single: () => createRecord(table, data) }),
        }
      },
      update: (data) => {
        return {
          eq: (column, value) => ({
            select: () => ({ single: () => updateRecord(table, column, value, data) }),
          }),
        }
      },
      delete: () => {
        return {
          eq: (column, value) => deleteRecord(table, column, value),
        }
      },
    }
  },
  rpc: (fn, params) => {
    if (fn === 'increment_view_count') {
      return api.incrementViewCount(params.profile_id)
    }
    return Promise.resolve({ error: null })
  },
  storage: {
    from: (bucket) => {
      return {
        upload: (path, file) => Promise.resolve({ data: { path }, error: null }),
        getPublicUrl: (path) => ({ data: { publicUrl: `${API_BASE}/storage/${bucket}/${path}` } }),
        remove: (paths) => Promise.resolve({ error: null }),
      }
    },
  },
}

function buildQuery(table, filters) {
  return {
    eq: (column, value) => buildQuery(table, { ...filters, eq: { [column]: value } }),
    order: (column, opts) => buildQuery(table, { ...filters, order: { column, ...opts } }),
    limit: (n) => buildQuery(table, { ...filters, limit: n }),
    toArray: () => fetchAll(table, filters),
  }
}

async function fetchAll(table, filters = {}) {
  try {
    const data = await api.getProfiles()
    let result = data || []
    
    if (filters.eq) {
      const entries = Object.entries(filters.eq)
      result = result.filter(item => entries.every(([k, v]) => item[k] === v))
    }
    
    if (filters.order) {
      const { column, ascending = true } = filters.order
      result.sort((a, b) => {
        if (ascending) return a[column] > b[column] ? 1 : -1
        return a[column] < b[column] ? 1 : -1
      })
    }
    
    if (filters.limit) {
      result = result.slice(0, filters.limit)
    }
    
    return { data: result, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

async function fetchOne(table, filters) {
  try {
    const [key, value] = Object.entries(filters)[0]
    const data = await api.getProfileByUsername(value)
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

async function createRecord(table, data) {
  try {
    if (table === 'profiles') {
      const result = await api.createProfile(data)
      return { data: result, error: null }
    }
    return { data: null, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

async function updateRecord(table, column, value, data) {
  try {
    if (table === 'profiles') {
      const result = await api.updateProfile(value, data)
      return { data: result, error: null }
    }
    return { data: null, error: null }
  } catch (error) {
    return { data: null, error: null }
  }
}

async function deleteRecord(table, column, value) {
  try {
    return { error: null }
  } catch (error) {
    return { error }
  }
}
