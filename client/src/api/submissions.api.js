import api from './axiosInstance'

export const checkDuplicate = (exhibitionId, email) =>
  api.get('/submissions/check', { params: { exhibitionId, email } })
export const submitPhotos = (data) =>
  api.post('/submissions', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
export const getSubmissions = (exhibitionId, params) =>
  api.get(`/submissions/exhibition/${exhibitionId}`, { params })
export const getSubmission = (id) => api.get(`/submissions/${id}`)
export const approveSubmission = (id) => api.patch(`/submissions/${id}/approve`)
export const unapproveSubmission = (id, reason) =>
  api.patch(`/submissions/${id}/unapprove`, { reason })
export const rejectSubmission = (id, reason) =>
  api.patch(`/submissions/${id}/reject`, { reason })
export const deleteSubmission = (id) => api.delete(`/submissions/${id}`)
