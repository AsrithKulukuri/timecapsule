import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const { login } = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        console.log('=== Login form submitted ===')
        console.log('Email:', email)
        console.log('Password length:', password.length)
        setLoading(true)

        try {
            console.log('Calling login function...')
            const result = await login(email, password)
            console.log('Login result:', result)
            console.log('Navigating to dashboard...')
            toast.success('Welcome back!')
            navigate('/dashboard')
        } catch (error) {
            console.error('Login error:', error)
            const errorMsg = error.response?.data?.detail || error.message || 'Login failed'
            console.error('Error message:', errorMsg)
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-8 md:p-12 w-full max-w-md"
            >
                <div className="text-center mb-8">
                    <div className="text-6xl mb-4">⏳</div>
                    <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                    <p className="text-gray-300">Login to access your time capsules</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold mb-2">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input-field"
                            placeholder="your@email.com"
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold mb-2">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input-field"
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full vr-button"
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-300">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-purple-400 hover:text-purple-300 font-semibold">
                            Sign Up
                        </Link>
                    </p>
                </div>

                <div className="mt-6 text-center">
                    <Link to="/" className="text-gray-400 hover:text-gray-300 text-sm">
                        ← Back to Home
                    </Link>
                </div>
            </motion.div>
        </div>
    )
}

export default Login
