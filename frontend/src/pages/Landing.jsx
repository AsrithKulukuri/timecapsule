import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import { useAuthStore } from '../store/authStore'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Landing() {
    const { user } = useAuthStore()
    const navigate = useNavigate()

    useEffect(() => {
        if (user) {
            navigate('/dashboard')
        }
    }, [user, navigate])

    return (
        <div className="min-h-screen">
            <Navbar transparent />

            {/* Hero Section */}
            <section className="min-h-screen flex items-center justify-center px-4 pt-20">
                <div className="container mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                            className="text-9xl mb-8 inline-block"
                        >
                            ⏳
                        </motion.div>

                        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                            Preserve Your Memories
                        </h1>

                        <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto">
                            Create digital time capsules with photos, videos, and messages.
                            <br />
                            Lock them until the perfect moment in the future.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <Link to="/signup">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn-primary vr-button min-w-[200px]"
                                >
                                    Get Started Free
                                </motion.button>
                            </Link>

                            <Link to="/login">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="btn-secondary vr-button min-w-[200px]"
                                >
                                    Login
                                </motion.button>
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <motion.h2
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-4xl md:text-5xl font-bold text-center mb-16"
                    >
                        Why Time Capsule?
                    </motion.h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: '🔒',
                                title: 'Secure & Private',
                                description: 'Your memories are encrypted and stored securely until unlock date',
                            },
                            {
                                icon: '🎥',
                                title: 'Rich Media Support',
                                description: 'Store photos, videos, audio recordings, and text messages',
                            },
                            {
                                icon: '👥',
                                title: 'Share with Loved Ones',
                                description: 'Create group capsules to share memories with family and friends',
                            },
                            {
                                icon: '⏰',
                                title: 'Future Unlocking',
                                description: 'Set any future date - days, months, or years ahead',
                            },
                            {
                                icon: '🌐',
                                title: 'Access Anywhere',
                                description: 'Works on desktop, mobile, and even VR browsers',
                            },
                            {
                                icon: '✨',
                                title: 'Beautiful Experience',
                                description: 'Stunning glassmorphism UI with smooth animations',
                            },
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card vr-card p-8 text-center"
                            >
                                <div className="text-6xl mb-4">{feature.icon}</div>
                                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-gray-300">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4">
                <div className="container mx-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="glass-card p-12 text-center max-w-3xl mx-auto"
                    >
                        <h2 className="text-4xl font-bold mb-6">
                            Start Creating Your Time Capsule Today
                        </h2>
                        <p className="text-xl text-gray-300 mb-8">
                            Join thousands preserving their precious moments
                        </p>
                        <Link to="/signup">
                            <button className="btn-primary text-xl px-12 py-4">
                                Create Free Account
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 px-4 border-t border-white/10">
                <div className="container mx-auto text-center text-gray-400">
                    <p>&copy; 2026 TimeCapsule. Made with ❤️ for preserving memories.</p>
                </div>
            </footer>
        </div>
    )
}

export default Landing
