import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

function Navbar({ transparent = false }) {
    const { user, logout } = useAuthStore()

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className={`fixed top-0 left-0 right-0 z-50 ${transparent ? 'bg-transparent' : 'glass-card'
                } backdrop-blur-md`}
        >
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2">
                    <span className="text-3xl">⏳</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                        TimeCapsule
                    </span>
                </Link>

                <div className="flex items-center space-x-4">
                    {user ? (
                        <>
                            <Link to="/dashboard">
                                <button className="btn-secondary text-sm md:text-base px-4 md:px-6 py-2 md:py-3">
                                    Dashboard
                                </button>
                            </Link>
                            <button
                                onClick={logout}
                                className="text-gray-300 hover:text-white transition-colors"
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <button className="btn-secondary text-sm md:text-base px-4 md:px-6 py-2 md:py-3">
                                    Login
                                </button>
                            </Link>
                            <Link to="/signup">
                                <button className="btn-primary text-sm md:text-base px-4 md:px-6 py-2 md:py-3">
                                    Sign Up
                                </button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </motion.nav>
    )
}

export default Navbar
