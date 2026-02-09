import api from './api'

export const capsuleService = {
    async createCapsule(capsuleData) {
        const response = await api.post('/api/capsules/', capsuleData)
        return response.data
    },

    async getCapsules() {
        const response = await api.get('/api/capsules/')
        return response.data
    },

    async getCapsule(id) {
        const response = await api.get(`/api/capsules/${id}`)
        return response.data
    },

    async updateCapsule(id, updateData) {
        const response = await api.put(`/api/capsules/${id}`, updateData)
        return response.data
    },

    async deleteCapsule(id) {
        const response = await api.delete(`/api/capsules/${id}`)
        return response.data
    },
}
