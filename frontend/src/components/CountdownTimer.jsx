import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

function CountdownTimer({ unlockDate, onUnlock }) {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isUnlocked: false,
    })

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date().getTime()
            const target = new Date(unlockDate).getTime()
            const difference = target - now

            if (difference <= 0) {
                setTimeLeft({
                    days: 0,
                    hours: 0,
                    minutes: 0,
                    seconds: 0,
                    isUnlocked: true,
                })
                if (onUnlock) {
                    onUnlock()
                }
                return
            }

            setTimeLeft({
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor(
                    (difference / (1000 * 60 * 60)) % 24
                ),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
                isUnlocked: false,
            })
        }

        calculateTimeLeft()
        const timer = setInterval(calculateTimeLeft, 1000)

        return () => clearInterval(timer)
    }, [unlockDate, onUnlock])

    if (timeLeft.isUnlocked) {
        return null
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30"
        >
            <p className="text-sm text-gray-400 mb-4 text-center">⏳ Time Until Unlock</p>
            
            <div className="grid grid-cols-4 gap-3">
                <motion.div
                    key={timeLeft.days}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center glass-card p-4"
                >
                    <div className="text-2xl md:text-3xl font-bold text-blue-400">
                        {String(timeLeft.days).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">Days</div>
                </motion.div>

                <motion.div
                    key={`hours-${timeLeft.hours}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center glass-card p-4"
                >
                    <div className="text-2xl md:text-3xl font-bold text-purple-400">
                        {String(timeLeft.hours).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">Hours</div>
                </motion.div>

                <motion.div
                    key={`minutes-${timeLeft.minutes}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center glass-card p-4"
                >
                    <div className="text-2xl md:text-3xl font-bold text-pink-400">
                        {String(timeLeft.minutes).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">Minutes</div>
                </motion.div>

                <motion.div
                    key={`seconds-${timeLeft.seconds}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="text-center glass-card p-4"
                >
                    <div className="text-2xl md:text-3xl font-bold text-green-400">
                        {String(timeLeft.seconds).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-400 mt-2">Seconds</div>
                </motion.div>
            </div>
        </motion.div>
    )
}

export default CountdownTimer
