import { motion } from 'framer-motion'

function LoadingSpinner({ fullScreen = false }) {
    if (fullScreen) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full"
                />
            </div>
        )
    }

    return (
        <div className="flex justify-center items-center p-8">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
            />
        </div>
    )
}

export default LoadingSpinner
