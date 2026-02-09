export const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'

    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export const getFileIcon = (fileType) => {
    const icons = {
        image: '🖼️',
        video: '🎥',
        audio: '🎵',
        text: '📄',
    }
    return icons[fileType] || '📎'
}

export const isImageFile = (file) => {
    return file.type.startsWith('image/')
}

export const isVideoFile = (file) => {
    return file.type.startsWith('video/')
}

export const isAudioFile = (file) => {
    return file.type.startsWith('audio/')
}

export const validateFile = (file, maxSize = 50 * 1024 * 1024) => {
    const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'video/webm',
        'video/quicktime',
        'audio/mpeg',
        'audio/wav',
        'audio/ogg',
        'text/plain',
    ]

    if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not supported`)
    }

    if (file.size > maxSize) {
        throw new Error(`File size exceeds ${formatFileSize(maxSize)} limit`)
    }

    return true
}
