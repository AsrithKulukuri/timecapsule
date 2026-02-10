import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

function Signup() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState('signup') // 'signup' or 'verify'
    const [verificationCode, setVerificationCode] = useState('')
    const [verifyLoading, setVerifyLoading] = useState(false)
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
            toast.success('Account created! Please verify your email.')
            setStep('verify')
        } catch (error) {
            console.error('Signup error:', error)
            const errorMsg = error.response?.data?.detail || error.message || 'Signup failed'
            toast.error(errorMsg)
        } finally {
            setLoading(false)
        }
    }

    const handleVerifyEmail = async (e) => {
        e.preventDefault()

        if (verificationCode.length !== 6) {
            toast.error('Enter a 6-digit code')
            return
        }

        setVerifyLoading(true)

        try {
            await authService.verifyEmail(email, verificationCode)
            toast.success('Email verified! You can now login.')
            navigate('/login')
        } catch (error) {
            console.error('Verification error:', error)
            const errorMsg = error.response?.data?.detail || error.message || 'Verification failed'
            toast.error(errorMsg)
        } finally {
            setVerifyLoading(false)
        }
    }

    const handleResendCode = async () => {
        setLoading(true)
        try {
            await authService.requestEmailVerification(email)
            toast.success('Verification code resent!')
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to resend code')
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
                {step === 'signup' ? (
                    <>
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
                    </>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4">📬</div>
                            <h1 className="text-3xl font-bold mb-2">Verify Email</h1>
                            <p className="text-gray-300">Enter the code sent to {email}</p>
                        </div>

                        <form onSubmit={handleVerifyEmail} className="space-y-6">
                            <div>
                                <label htmlFor="code" className="block text-sm font-semibold mb-2">Verification Code</label>
                                <input
                                    id="code"
                                    type="text"
                                    value={verificationCode}
                                    onChange={(e) => setVerificationCode(e.target.value.slice(0, 6))}
                                    className="input-field text-center text-2xl tracking-widest"
                                    placeholder="000000"
                                    maxLength={6}
                                    required
                                />
                                <p className="text-xs text-gray-400 mt-1">
                                    6-digit code (expires in 15 minutes)
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={verifyLoading || verificationCode.length !== 6}
                                className="btn-primary w-full vr-button"
                            >
                                {verifyLoading ? 'Verifying...' : 'Verify Email'}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                onClick={handleResendCode}
                                disabled={loading}
                                className="text-purple-400 hover:text-purple-300 text-sm font-semibold disabled:opacity-50"
                            >
                                {loading ? 'Resending...' : 'Resend Code'}
                            </button>
                        </div>

                        <div className="mt-6 text-center">
                            <button
                                onClick={() => {
                                    setStep('signup')
                                    setVerificationCode('')
                                }}
                                className="text-gray-400 hover:text-gray-300 text-sm"
                            >
                                ← Back
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    )
}

export default Signup
