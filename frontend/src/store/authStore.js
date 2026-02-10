import { create } from 'zustand'
import { authService } from '../services/authService'

export const useAuthStore = create((set, get) => ({
    user: null,
    loading: true,

    setSession: (data) => {
        if (!data || !data.access_token) {
            throw new Error('No access token in response')
        }
        localStorage.setItem('access_token', data.access_token)
        set({ user: data.user })
    },

    setUser: (user) => set({ user }),

    login: async (email, password) => {
        try {
            console.log('Attempting login...')
            const data = await authService.login(email, password)
            console.log('Login response:', data)
            get().setSession(data)
            console.log('User set, login complete')
            return data
        } catch (error) {
            console.error('Login error in store:', error)
            throw error
        }
    },

    loginWithOtp: async (email, token) => {
        try {
            console.log('Attempting OTP login...')
            const data = await authService.verifyOtp(email, token, 'login')
            console.log('OTP login response:', data)
            get().setSession(data)
            return data
        } catch (error) {
            console.error('OTP login error in store:', error)
            throw error
        }
    },

    signup: async (email, password, username) => {
        try {
            console.log('Attempting signup...')
            const data = await authService.signup(email, password, username)
            console.log('Signup response:', data)
            // Don't set session yet - user needs to verify email first
            return data
        } catch (error) {
            console.error('Signup error in store:', error)
            throw error
        }
    },

    logout: async () => {
        try {
            await authService.logout()
        } catch (error) {
            console.error('Logout error:', error)
        } finally {
            localStorage.removeItem('access_token')
            set({ user: null })
        }
    },

    checkAuth: async () => {
        const token = localStorage.getItem('access_token')
        if (!token) {
            console.log('No token found, user not authenticated')
            set({ loading: false })
            return
        }

        try {
            console.log('Checking authentication with token...')
            const user = await authService.getCurrentUser()
            console.log('Auth check successful, user:', user)
            set({ user, loading: false })
        } catch (error) {
            console.error('Auth check failed:', error)
            localStorage.removeItem('access_token')
            set({ user: null, loading: false })
        }
    },
}))
