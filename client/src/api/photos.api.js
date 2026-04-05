import api from './axiosInstance'

export const getPhoto = (id) => api.get(`/photos/${id}`)
export const ratePhoto = (id, rating) => api.post(`/photos/${id}/rate`, { rating })
export const getMyRating = (id) => api.get(`/photos/${id}/my-rating`)
export const getComments = (id) => api.get(`/photos/${id}/comments`)
export const addComment = (id, text) => api.post(`/photos/${id}/comments`, { text })