import api from './axiosInstance'

export const getPublicProfile = (id) => api.get(`/users/${id}`)
