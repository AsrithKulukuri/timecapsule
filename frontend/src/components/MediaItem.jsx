import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { mediaService } from '../services/mediaService'
import { getFileIcon } from '../utils/fileUtils'
import toast from 'react-hot-toast'

function MediaItem({ media, isUnlocked, onDelete }) {
    const [mediaUrl, setMediaUrl] = useState(null)
    const [loading, setLoading] = useState(false)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    const loadMedia = async () => {
        if (!isUnlocked || mediaUrl) return

        setLoading(true)
        try {
            console.log(`Loading media: ${media.id}`)
            const data = await mediaService.getMediaUrl(media.id)
            console.log(`Media URL loaded: ${data.url}`)
            setMediaUrl(data.url)
        } catch (error) {
            console.error(`Failed to load media ${media.id}:`, error)
            toast.error('Failed to load media')
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async () => {
        if (!mediaUrl) return

        setIsDownloading(true)
        try {
            const response = await fetch(mediaUrl)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = media.filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
            toast.success('Media downloaded')
        } catch (error) {
            console.error('Download failed:', error)
            toast.error('Failed to download media')
        } finally {
            setIsDownloading(false)
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
        <>
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
                                <div className="mt-3 space-y-2">
                                    {media.file_type === 'image' && (
                                        <>
                                            <img
                                                src={mediaUrl}
                                                alt={media.filename}
                                                onClick={() => setIsModalOpen(true)}
                                                className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                            />
                                            <button
                                                onClick={handleDownload}
                                                disabled={isDownloading}
                                                className="btn-primary w-full text-sm py-2"
                                            >
                                                {isDownloading ? 'Downloading...' : '⬇ Download'}
                                            </button>
                                        </>
                                    )}
                                    {media.file_type === 'video' && (
                                        <>
                                            <video
                                                src={mediaUrl}
                                                controls
                                                className="w-full rounded-lg max-h-64"
                                            />
                                            <button
                                                onClick={handleDownload}
                                                disabled={isDownloading}
                                                className="btn-primary w-full text-sm py-2"
                                            >
                                                {isDownloading ? 'Downloading...' : '⬇ Download'}
                                            </button>
                                        </>
                                    )}
                                    {media.file_type === 'audio' && (
                                        <>
                                            <audio src={mediaUrl} controls className="w-full" />
                                            <button
                                                onClick={handleDownload}
                                                disabled={isDownloading}
                                                className="btn-primary w-full text-sm py-2"
                                            >
                                                {isDownloading ? 'Downloading...' : '⬇ Download'}
                                            </button>
                                        </>
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

            {/* Modal for enlarged media view */}
            <AnimatePresence>
                {isModalOpen && mediaUrl && media.file_type === 'image' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsModalOpen(false)}
                        className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="relative max-w-4xl max-h-screen"
                        >
                            <img
                                src={mediaUrl}
                                alt={media.filename}
                                className="max-w-full max-h-screen object-contain rounded-lg"
                            />

                            {/* Close button */}
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute -top-12 right-0 text-white/80 hover:text-white text-2xl font-bold"
                            >
                                ✕
                            </button>

                            {/* Download button */}
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="absolute bottom-4 right-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                {isDownloading ? 'Downloading...' : '⬇ Download'}
                            </button>

                            {/* Filename */}
                            <div className="absolute bottom-4 left-4 text-white/80 text-sm max-w-sm truncate bg-black/40 px-3 py-2 rounded">
                                {media.filename}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}

export default MediaItem
