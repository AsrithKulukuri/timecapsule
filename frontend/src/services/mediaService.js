import api from './api'

export const mediaService = {
    async uploadMedia(capsuleId, file) {
        const formData = new FormData()
        formData.append('file', file)

        const response = await api.post(`/api/media/upload/${capsuleId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data
    },

    async getMediaUrl(mediaId) {
        const response = await api.get(`/api/media/${mediaId}/url`)
        return response.data
    },

    async deleteMedia(mediaId) {
        const response = await api.delete(`/api/media/${mediaId}`)
        return response.data
    },
}
