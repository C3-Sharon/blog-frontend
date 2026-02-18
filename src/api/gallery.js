import request from './request'

// 获取作品列表
export const getArtworks = (params) => {
  return request.get('/gallery', { params })
}

// 获取单个作品
export const getArtwork = (id) => {
  return request.get(`/gallery/${id}`)
}

// 上传作品
export const uploadArtwork = (formData) => {
  return request.post('/gallery', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

// 更新作品
export const updateArtwork = (id, data) => {
  return request.put(`/gallery/${id}`, data)
}

// 删除作品
export const deleteArtwork = (id) => {
  return request.delete(`/gallery/${id}`)
}