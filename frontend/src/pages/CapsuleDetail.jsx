import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { capsuleService } from '../services/capsuleService'
import { mediaService } from '../services/mediaService'
import { formatUnlockDate, getTimeRemaining } from '../utils/dateUtils'
import { validateFile, formatFileSize } from '../utils/fileUtils'
import { useAuthStore } from '../store/authStore'
import Navbar from '../components/Navbar'
import MediaItem from '../components/MediaItem'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

function CapsuleDetail() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const fileInputRef = useRef(null)

    const [capsule, setCapsule] = useState(null)
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        loadCapsule()
    }, [id])

    const loadCapsule = async () => {
        try {
            const data = await capsuleService.getCapsule(id)
            setCapsule(data)
        } catch (error) {
            toast.error('Capsule not found')
            navigate('/dashboard')
        } finally {
            setLoading(false)
        }
    }

    const handleFileSelect = async (e) => {
        const files = Array.from(e.target.files)

        if (files.length === 0) return

        for (const file of files) {
            try {
                validateFile(file)
                await uploadFile(file)
            } catch (error) {
                toast.error(`${file.name}: ${error.message}`)
            }
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const uploadFile = async (file) => {
        setUploading(true)
        try {
            await mediaService.uploadMedia(id, file)
            toast.success(`${file.name} uploaded!`)
            await loadCapsule() // Reload to show new media
        } catch (error) {
            throw new Error(error.response?.data?.detail || 'Upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteCapsule = async () => {
        if (!window.confirm('Are you sure you want to delete this capsule? This action cannot be undone.')) {
            return
        }

        setDeleting(true)
        try {
            await capsuleService.deleteCapsule(id)
            toast.success('Capsule deleted')
            navigate('/dashboard')
        } catch (error) {
            toast.error(error.response?.data?.detail || 'Failed to delete capsule')
            setDeleting(false)
        }
    }

    const handleMediaDelete = (mediaId) => {
        setCapsule((prev) => ({
            ...prev,
            media: prev.media.filter((m) => m.id !== mediaId),
        }))
    }

    if (loading) {
        return <LoadingSpinner fullScreen />
    }

    if (!capsule) {
        return null
    }

    const isOwner = user?.id === capsule.owner_id
    const isUnlocked = capsule.is_unlocked

    return (
        <div className="min-h-screen pb-20">
            <Navbar />

            <div className="container mx-auto px-4 pt-24 max-w-5xl">
                {/* Back Button */}
                <Link to="/dashboard" className="text-gray-400 hover:text-white mb-6 inline-block">
                    ← Back to Dashboard
                </Link>

                {/* Capsule Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 md:p-12 mb-8 relative overflow-hidden"
                >
                    {/* Unlock Status Badge */}
                    <div className="absolute top-4 right-4">
                        {isUnlocked ? (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="px-4 py-2 bg-green-500/30 rounded-full text-green-400 font-semibold flex items-center"
                            >
                                <span className="mr-2">✓</span> Unlocked
                            </motion.div>
                        ) : (
                            <div className="px-4 py-2 bg-purple-500/30 rounded-full text-purple-400 font-semibold flex items-center">
                                <span className="mr-2">🔒</span> Locked
                            </div>
                        )}
                    </div>

                    <div className={!isUnlocked ? 'blur-sm' : ''}>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4 pr-32">
                            {capsule.title}
                        </h1>

                        {capsule.description && (
                            <p className="text-gray-300 text-lg mb-6 whitespace-pre-wrap">
                                {capsule.description}
                            </p>
                        )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mt-6">
                        <div className="glass-card p-4">
                            <p className="text-sm text-gray-400 mb-1">Unlock Date</p>
                            <p className="font-semibold">{formatUnlockDate(capsule.unlock_date)}</p>
                        </div>

                        <div className="glass-card p-4">
                            <p className="text-sm text-gray-400 mb-1">Status</p>
                            <p className="font-semibold">
                                {isUnlocked ? '✨ Unlocked' : getTimeRemaining(capsule.unlock_date)}
                            </p>
                        </div>
                    </div>

                    {capsule.is_group && (
                        <div className="mt-4 glass-card p-4">
                            <p className="text-sm text-gray-400 mb-1">👥 Group Capsule</p>
                            <p className="text-sm">Shared with others</p>
                        </div>
                    )}
                </motion.div>

                {/* Unlock Animation */}
                {isUnlocked && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-8 mb-8 text-center bg-gradient-to-r from-green-500/20 to-blue-500/20"
                    >
                        <motion.div
                            animate={{ rotate: [0, 360] }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="text-6xl mb-4 inline-block"
                        >
                            🎉
                        </motion.div>
                        <h2 className="text-2xl font-bold mb-2">This Capsule is Unlocked!</h2>
                        <p className="text-gray-300">Your memories are now accessible</p>
                    </motion.div>
                )}

                {/* Upload Section (only for owners and if not unlocked) */}
                {isOwner && !isUnlocked && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-8 mb-8"
                    >
                        <h2 className="text-2xl font-bold mb-4">Add Media</h2>
                        <p className="text-gray-300 mb-6">
                            Upload photos, videos, audio, or text files to your capsule
                        </p>

                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileSelect}
                            multiple
                            accept="image/*,video/*,audio/*,text/plain"
                            className="hidden"
                        />

                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="btn-primary vr-button w-full md:w-auto"
                        >
                            {uploading ? 'Uploading...' : '📎 Choose Files to Upload'}
                        </button>

                        <div className="mt-4 text-sm text-gray-400">
                            <p>Supported: Images, Videos (MP4/WebM), Audio (MP3/WAV), Text files</p>
                            <p>Max file size: 50MB</p>
                        </div>
                    </motion.div>
                )}

                {/* Media Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-2xl font-bold mb-6">
                        Media ({capsule.media?.length || 0})
                    </h2>

                    {!capsule.media || capsule.media.length === 0 ? (
                        <div className="glass-card p-12 text-center">
                            <div className="text-6xl mb-4">📦</div>
                            <p className="text-gray-300">
                                {isOwner && !isUnlocked
                                    ? 'No media yet. Upload some memories!'
                                    : 'This capsule has no media'}
                            </p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <AnimatePresence>
                                {capsule.media.map((media) => (
                                    <MediaItem
                                        key={media.id}
                                        media={media}
                                        isUnlocked={isUnlocked}
                                        onDelete={isOwner && !isUnlocked ? handleMediaDelete : null}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </motion.div>

                {/* Delete Capsule (only for owners) */}
                {isOwner && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="mt-12 glass-card p-6 border-red-500/30"
                    >
                        <h3 className="text-xl font-bold mb-2 text-red-400">Danger Zone</h3>
                        <p className="text-gray-300 mb-4">
                            Permanently delete this capsule and all its media
                        </p>
                        <button
                            onClick={handleDeleteCapsule}
                            disabled={deleting}
                            className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-8 rounded-xl transition-all"
                        >
                            {deleting ? 'Deleting...' : 'Delete Capsule'}
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    )
}

export default CapsuleDetail
