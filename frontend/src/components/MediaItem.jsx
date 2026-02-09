import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { mediaService } from '../services/mediaService'
import { getFileIcon } from '../utils/fileUtils'
import toast from 'react-hot-toast'

function MediaItem({ media, isUnlocked, onDelete }) {
    const [mediaUrl, setMediaUrl] = useState(null)
    const [loading, setLoading] = useState(false)

    const loadMedia = async () => {
        if (!isUnlocked || mediaUrl) return

        setLoading(true)
        try {
            const data = await mediaService.getMediaUrl(media.id)
            setMediaUrl(data.url)
        } catch (error) {
            toast.error('Failed to load media')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this media?')) {
            try {
                await mediaService.deleteMedia(media.id)
                toast.success('Media deleted')
                onDelete(media.id)
            } catch (error) {
                toast.error(error.response?.data?.detail || 'Failed to delete media')
            }
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="glass-card p-4 relative group"
        >
            {!isUnlocked && (
                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-md bg-black/50 rounded-2xl z-10">
                    <div className="text-center">
                        <div className="text-4xl mb-2">🔒</div>
                        <p className="text-xs text-gray-300">Locked</p>
                    </div>
                </div>
            )}

            <div className={!isUnlocked ? 'blur-lg' : ''}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getFileIcon(media.file_type)}</span>
                        <div>
                            <p className="text-sm font-semibold truncate max-w-[150px]">
                                {media.filename}
                            </p>
                            <p className="text-xs text-gray-400">{media.file_type}</p>
                        </div>
                    </div>

                    {!isUnlocked && onDelete && (
                        <button
                            onClick={handleDelete}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300 text-xs"
                        >
                            Delete
                        </button>
                    )}
                </div>

                {isUnlocked && (
                    <>
                        {!mediaUrl && (
                            <button
                                onClick={loadMedia}
                                disabled={loading}
                                className="btn-secondary w-full text-sm py-2"
                            >
                                {loading ? 'Loading...' : 'View Media'}
                            </button>
                        )}

                        {mediaUrl && (
                            <div className="mt-3">
                                {media.file_type === 'image' && (
                                    <img
                                        src={mediaUrl}
                                        alt={media.filename}
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                )}
                                {media.file_type === 'video' && (
                                    <video
                                        src={mediaUrl}
                                        controls
                                        className="w-full rounded-lg max-h-64"
                                    />
                                )}
                                {media.file_type === 'audio' && (
                                    <audio src={mediaUrl} controls className="w-full" />
                                )}
                                {media.file_type === 'text' && (
                                    <a
                                        href={mediaUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="btn-primary w-full text-sm py-2 block text-center"
                                    >
                                        Open Text File
                                    </a>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </motion.div>
    )
}

export default MediaItem
