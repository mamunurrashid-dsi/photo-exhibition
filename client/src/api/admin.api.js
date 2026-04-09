import api from './axiosInstance'

export const getAdminStats = () => api.get('/admin/stats')
export const getAdminUsers = (params) => api.get('/admin/users', { params })
export const getAdminUser = (id) => api.get(`/admin/users/${id}`)
export const updateAdminUser = (id, data) => api.patch(`/admin/users/${id}`, data)
export const deleteAdminUser = (id) => api.delete(`/admin/users/${id}`)
export const getAdminExhibitions = (params) => api.get('/admin/exhibitions', { params })
export const deleteAdminExhibition = (id) => api.delete(`/admin/exhibitions/${id}`)
export const getAdminSubmissions = (params) => api.get('/admin/submissions', { params })
export const deleteAdminSubmission = (id) => api.delete(`/admin/submissions/${id}`)
export const moderateExhibition = (id, action, reason) => api.patch(`/admin/exhibitions/${id}/moderate`, { action, reason })
export const moderatePhoto = (id, status) => api.patch(`/admin/photos/${id}/moderate`, { status })
