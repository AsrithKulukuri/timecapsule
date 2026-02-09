import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { capsuleService } from '../services/capsuleService'
import { getMinDateTime } from '../utils/dateUtils'
import Navbar from '../components/Navbar'
import toast from 'react-hot-toast'

function CreateCapsule() {
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [unlockDate, setUnlockDate] = useState('')
    const [isGroup, setIsGroup] = useState(false)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!unlockDate) {
            toast.error('Please select an unlock date')
            return
        }

        const selectedDate = new Date(unlockDate)
        const now = new Date()

        if (selectedDate <= now) {
            toast.error('Unlock date must be in the future')
            return
        }

        setLoading(true)

        try {
            const capsule = await capsuleService.createCapsule({
                title,
                description,
                unlock_date: selectedDate.toISOString(),
                is_group: isGroup,
                group_members: [],
            })

            toast.success('Time capsule created!')
            navigate(`/capsule/${capsule.id}`)
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to create capsule')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen pb-20">
            <Navbar />

            <div className="container mx-auto px-4 pt-24 max-w-3xl">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link to="/dashboard" className="text-gray-400 hover:text-white mb-4 inline-block">
                        ← Back to Dashboard
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Create Time Capsule ⏳
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Preserve your memories for the future
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass-card p-8 md:p-12"
                >
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Capsule Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="input-field"
                                placeholder="My 2026 Memories"
                                required
                                maxLength={200}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="input-field min-h-[120px] resize-none"
                                placeholder="Write a message to your future self..."
                                rows={4}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Unlock Date & Time *
                            </label>
                            <input
                                type="datetime-local"
                                value={unlockDate}
                                onChange={(e) => setUnlockDate(e.target.value)}
                                min={getMinDateTime()}
                                className="input-field"
                                required
                            />
                            <p className="text-xs text-gray-400 mt-2">
                                Choose when this capsule will unlock and become accessible
                            </p>
                        </div>

                        <div className="flex items-center space-x-3 glass-card p-4">
                            <input
                                type="checkbox"
                                id="isGroup"
                                checked={isGroup}
                                onChange={(e) => setIsGroup(e.target.checked)}
                                className="w-5 h-5 rounded"
                            />
                            <label htmlFor="isGroup" className="text-sm">
                                Make this a group capsule (share with others)
                            </label>
                        </div>

                        <div className="pt-4 space-y-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full vr-button"
                            >
                                {loading ? 'Creating...' : 'Create Capsule'}
                            </button>

                            <Link to="/dashboard" className="block">
                                <button type="button" className="btn-secondary w-full">
                                    Cancel
                                </button>
                            </Link>
                        </div>
                    </form>
                </motion.div>

                {/* Info Box */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-8 glass-card p-6"
                >
                    <h3 className="font-semibold mb-3 flex items-center">
                        <span className="mr-2">💡</span>
                        What happens next?
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li>✓ After creating, you can upload photos, videos, and more</li>
                        <li>✓ Your capsule will be locked until the unlock date</li>
                        <li>✓ Media will be hidden and blurred while locked</li>
                        <li>✓ You can edit capsule details before it unlocks</li>
                    </ul>
                </motion.div>
            </div>
        </div>
    )
}

export default CreateCapsule
