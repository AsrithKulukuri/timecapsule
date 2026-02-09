import api from './api'

export const authService = {
    async signup(email, password, username) {
        try {
            console.log('AuthService: Calling /api/auth/signup...')
            const response = await api.post('/api/auth/signup', {
                email,
                password,
                username,
            })
            console.log('AuthService: Signup response:', response.data)
            return response.data
        } catch (error) {
            console.error('AuthService: Signup error:', error.response?.data || error.message)
            throw error
        }
    },

    async login(email, password) {
        try {
            console.log('AuthService: Calling /api/auth/login...')
            const response = await api.post('/api/auth/login', {
                email,
                password,
            })
            console.log('AuthService: Login response:', response.data)
            return response.data
        } catch (error) {
            console.error('AuthService: Login error:', error.response?.data || error.message)
            throw error
        }
    },

    async logout() {
        try {
            console.log('AuthService: Calling /api/auth/logout...')
            const response = await api.post('/api/auth/logout')
            console.log('AuthService: Logout response:', response.data)
            return response.data
        } catch (error) {
            console.error('AuthService: Logout error:', error.response?.data || error.message)
            throw error
        }
    },

    async getCurrentUser() {
        try {
            console.log('AuthService: Calling /api/auth/me...')
            const response = await api.get('/api/auth/me')
            console.log('AuthService: GetCurrentUser response:', response.data)
            return response.data
        } catch (error) {
            console.error('AuthService: GetCurrentUser error:', error.response?.data || error.message)
            throw error
        }
    },
}

