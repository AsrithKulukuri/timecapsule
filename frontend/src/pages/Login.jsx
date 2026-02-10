import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [authMode, setAuthMode] = useState('password')
    const [otpEmail, setOtpEmail] = useState('')
    const [otpCode, setOtpCode] = useState('')
    const [otpSending, setOtpSending] = useState(false)
    const [otpVerifying, setOtpVerifying] = useState(false)
    const [recoveryEmail, setRecoveryEmail] = useState('')
    const [recoveryCode, setRecoveryCode] = useState('')
    const [recoveryPassword, setRecoveryPassword] = useState('')
    const [recoverySending, setRecoverySending] = useState(false)
    const [recoveryVerifying, setRecoveryVerifying] = useState(false)
    const { login, loginWithOtp } = useAuthStore()
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

    const handleOtpSend = async () => {
        if (!otpEmail) {
            toast.error('Enter your email')
            return
        }
        setOtpSending(true)
        try {
            await authService.requestOtp(otpEmail, 'login')
            toast.success('OTP sent to your email')
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to send OTP')
        } finally {
            setOtpSending(false)
        }
    }

    const handleOtpVerify = async (e) => {
        e.preventDefault()
        if (!otpEmail || !otpCode) {
            toast.error('Enter email and OTP')
            return
        }
        setOtpVerifying(true)
        try {
            await loginWithOtp(otpEmail, otpCode)
            toast.success('Logged in successfully')
            navigate('/dashboard')
        } catch (error) {
            toast.error(error.response?.data?.detail || 'OTP login failed')
        } finally {
            setOtpVerifying(false)
        }
    }

    const handleRecoverySend = async () => {
        if (!recoveryEmail) {
            toast.error('Enter your email')
            return
        }
        setRecoverySending(true)
        try {
            await authService.requestOtp(recoveryEmail, 'recovery')
            toast.success('Recovery OTP sent')
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to send recovery OTP')
        } finally {
            setRecoverySending(false)
        }
    }

    const handleRecoveryVerify = async (e) => {
        e.preventDefault()
        if (!recoveryEmail || !recoveryCode || recoveryPassword.length < 6) {
            toast.error('Enter email, OTP, and new password')
            return
        }
        setRecoveryVerifying(true)
        try {
            await authService.verifyOtp(recoveryEmail, recoveryCode, 'recovery', recoveryPassword)
            toast.success('Password updated. Please login.')
            setAuthMode('password')
            setRecoveryEmail('')
            setRecoveryCode('')
            setRecoveryPassword('')
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Password reset failed')
        } finally {
            setRecoveryVerifying(false)
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

                <div className="flex gap-2 mb-6">
                    <button
                        type="button"
                        onClick={() => setAuthMode('password')}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold ${authMode === 'password' ? 'bg-purple-600' : 'bg-white/10'}`}
                    >
                        Password
                    </button>
                    <button
                        type="button"
                        onClick={() => setAuthMode('otp')}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold ${authMode === 'otp' ? 'bg-purple-600' : 'bg-white/10'}`}
                    >
                        Email OTP
                    </button>
                </div>

                {authMode === 'password' && (
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

                        <button
                            type="button"
                            onClick={() => setAuthMode('recovery')}
                            className="w-full text-sm text-gray-300 hover:text-white"
                        >
                            Forgot password? Reset with OTP
                        </button>
                    </form>
                )}

                {authMode === 'otp' && (
                    <form onSubmit={handleOtpVerify} className="space-y-6">
                        <div>
                            <label htmlFor="otp-email" className="block text-sm font-semibold mb-2">Email</label>
                            <input
                                id="otp-email"
                                name="otp-email"
                                type="email"
                                value={otpEmail}
                                onChange={(e) => setOtpEmail(e.target.value)}
                                className="input-field"
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="otp-code" className="block text-sm font-semibold mb-2">OTP Code</label>
                            <input
                                id="otp-code"
                                name="otp-code"
                                type="text"
                                value={otpCode}
                                onChange={(e) => setOtpCode(e.target.value)}
                                className="input-field"
                                placeholder="Enter OTP"
                                required
                            />
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleOtpSend}
                                disabled={otpSending}
                                className="btn-secondary w-full text-sm py-2"
                            >
                                {otpSending ? 'Sending...' : 'Send OTP'}
                            </button>
                            <button
                                type="submit"
                                disabled={otpVerifying}
                                className="btn-primary w-full text-sm py-2"
                            >
                                {otpVerifying ? 'Verifying...' : 'Verify & Login'}
                            </button>
                        </div>
                    </form>
                )}

                {authMode === 'recovery' && (
                    <form onSubmit={handleRecoveryVerify} className="space-y-6">
                        <div>
                            <label htmlFor="recovery-email" className="block text-sm font-semibold mb-2">Email</label>
                            <input
                                id="recovery-email"
                                name="recovery-email"
                                type="email"
                                value={recoveryEmail}
                                onChange={(e) => setRecoveryEmail(e.target.value)}
                                className="input-field"
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="recovery-code" className="block text-sm font-semibold mb-2">OTP Code</label>
                            <input
                                id="recovery-code"
                                name="recovery-code"
                                type="text"
                                value={recoveryCode}
                                onChange={(e) => setRecoveryCode(e.target.value)}
                                className="input-field"
                                placeholder="Enter OTP"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="recovery-password" className="block text-sm font-semibold mb-2">New Password</label>
                            <input
                                id="recovery-password"
                                name="recovery-password"
                                type="password"
                                value={recoveryPassword}
                                onChange={(e) => setRecoveryPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                required
                                minLength={6}
                            />
                            <p className="text-xs text-gray-400 mt-1">Minimum 6 characters</p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleRecoverySend}
                                disabled={recoverySending}
                                className="btn-secondary w-full text-sm py-2"
                            >
                                {recoverySending ? 'Sending...' : 'Send OTP'}
                            </button>
                            <button
                                type="submit"
                                disabled={recoveryVerifying}
                                className="btn-primary w-full text-sm py-2"
                            >
                                {recoveryVerifying ? 'Updating...' : 'Update Password'}
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={() => setAuthMode('password')}
                            className="w-full text-sm text-gray-300 hover:text-white"
                        >
                            Back to password login
                        </button>
                    </form>
                )}

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
