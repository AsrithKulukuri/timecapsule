import { format, formatDistance, isPast, isFuture } from 'date-fns'

export const formatUnlockDate = (dateString) => {
    const date = new Date(dateString)
    return format(date, 'PPP p')
}

export const getTimeRemaining = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()

    if (isPast(date)) {
        return 'Unlocked'
    }

    return `Unlocks ${formatDistance(date, now, { addSuffix: true })}`
}

export const isUnlocked = (dateString) => {
    return isPast(new Date(dateString))
}

export const getMinDateTime = () => {
    const now = new Date()
    now.setMinutes(now.getMinutes() + 5) // Minimum 5 minutes in the future
    return now.toISOString().slice(0, 16)
}
