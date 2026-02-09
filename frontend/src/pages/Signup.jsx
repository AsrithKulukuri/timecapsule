import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

function Signup() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const { signup } = useAuthStore()
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        if (username.length < 3) {
            toast.error('Username must be at least 3 characters')
            return
        }

        setLoading(true)

        try {
            await signup(email, password, username)
            toast.success('Account created successfully!')
            navigate('/dashboard')
        } catch (error) {
            console.error('Signup error:', error)
            const errorMsg = error.response?.data?.detail || error.message || 'Signup failed'
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
                    <h1 className="text-3xl font-bold mb-2">Create Account</h1>
                    <p className="text-gray-300">Start preserving your memories</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-semibold mb-2">Username</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="input-field"
                            placeholder="johndoe"
                            required
                            minLength={3}
                        />
                    </div>

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
                            minLength={6}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Minimum 6 characters
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary w-full vr-button"
                    >
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-gray-300">
                        Already have an account?{' '}
                        <Link to="/login" className="text-purple-400 hover:text-purple-300 font-semibold">
                            Login
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

export default Signup
