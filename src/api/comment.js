import request from './request'

// 获取博客的留言列表
export const getComments = (blogId) => {
  return request.get(`/blogs/${blogId}/comments`)
}

// 发表留言
export const addComment = (blogId, data) => {
  // data: { nickname, content }
  return request.post(`/blogs/${blogId}/comments`, data)
}

// 删除留言（管理员）
export const deleteComment = (id) => {
  return request.delete(`/admin/comments/${id}`)
}