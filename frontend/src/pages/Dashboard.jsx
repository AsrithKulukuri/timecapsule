import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { capsuleService } from '../services/capsuleService'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/Navbar'
import CapsuleCard from '../components/CapsuleCard'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

function Dashboard() {
    const [capsules, setCapsules] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all') // all, unlocked, locked
    const { user } = useAuthStore()

    useEffect(() => {
        loadCapsules()
    }, [])

    const loadCapsules = async () => {
        try {
            const data = await capsuleService.getCapsules()
            setCapsules(data)
        } catch (error) {
            toast.error('Failed to load capsules')
        } finally {
            setLoading(false)
        }
    }

    const filteredCapsules = capsules.filter((capsule) => {
        if (filter === 'all') return true
        if (filter === 'unlocked') return capsule.is_unlocked
        if (filter === 'locked') return !capsule.is_unlocked
        return true
    })

    if (loading) {
        return <LoadingSpinner fullScreen />
    }

    return (
        <div className="min-h-screen pb-20">
            <Navbar />

            <div className="container mx-auto px-4 pt-24">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Welcome back, {user?.username || 'User'}! 👋
                    </h1>
                    <p className="text-gray-300 text-lg">
                        You have {capsules.length} time capsule{capsules.length !== 1 ? 's' : ''}
                    </p>
                </motion.div>

                {/* Create New Button */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <Link to="/create">
                        <button className="btn-primary vr-button">
                            + Create New Time Capsule
                        </button>
                    </Link>
                </motion.div>

                {/* Filter Tabs */}
                {capsules.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex gap-4 mb-8 flex-wrap"
                    >
                        {[
                            { key: 'all', label: 'All Capsules' },
                            { key: 'locked', label: 'Locked' },
                            { key: 'unlocked', label: 'Unlocked' },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key)}
                                className={`px-6 py-3 rounded-xl font-semibold transition-all ${filter === tab.key
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                        : 'glass-card hover:bg-white/20'
                                    }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </motion.div>
                )}

                {/* Capsules Grid */}
                {filteredCapsules.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="glass-card p-12 text-center"
                    >
                        <div className="text-6xl mb-4">📦</div>
                        <h3 className="text-2xl font-bold mb-2">
                            {filter === 'all' ? 'No capsules yet' : `No ${filter} capsules`}
                        </h3>
                        <p className="text-gray-300 mb-6">
                            {filter === 'all'
                                ? 'Create your first time capsule to preserve memories'
                                : `You don't have any ${filter} capsules`}
                        </p>
                        {filter === 'all' && (
                            <Link to="/create">
                                <button className="btn-primary">Create Your First Capsule</button>
                            </Link>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredCapsules.map((capsule, index) => (
                            <motion.div
                                key={capsule.id}
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                            >
                                <CapsuleCard capsule={capsule} />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default Dashboard
