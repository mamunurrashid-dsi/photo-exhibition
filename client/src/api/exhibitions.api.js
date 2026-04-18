import api from './axiosInstance'

export const getExhibitions = (params) => api.get('/exhibitions', { params })
export const getExhibition = (id) => api.get(`/exhibitions/${id}`)
export const getPrivateExhibition = (token) => api.get(`/exhibitions/private/${token}`)
export const getMyExhibitions = () => api.get('/exhibitions/mine')
export const getExhibitionGallery = (id, params) =>
  api.get(`/exhibitions/${id}/gallery`, { params })
export const createExhibition = (data) =>
  api.post('/exhibitions', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const updateExhibition = (id, data) =>
  api.put(`/exhibitions/${id}`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const deleteExhibition = (id) => api.delete(`/exhibitions/${id}`)
export const toggleExhibitionStatus = (id) => api.patch(`/exhibitions/${id}/toggle-status`)
export const checkPrivateAccess = (token, email) =>
  api.post(`/exhibitions/private/${token}/verify`, { email })
