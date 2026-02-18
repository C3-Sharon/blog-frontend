import request from './request'

// 获取博客列表（支持分页和搜索）
export const getBlogs = (params) => {
   return request.get('/blogs', { params })
}

// 获取博客详情
export const getBlogById = (id) => {
  return request.get(`/blogs/${id}`)
}

// 发布博客
export const createBlog = (data) => {
  return request.post('/admin/blogs', data)
}

// 更新博客
export const updateBlog = (id, data) => {
  return request.post(`/admin/blogs/${id}`, data)
}

// 删除博客
export const deleteBlog = (id) => {
  return request.post(`/admin/delete/${id}`)
}