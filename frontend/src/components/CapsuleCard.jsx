import { motion } from 'framer-motion'
import { getTimeRemaining, isUnlocked } from '../utils/dateUtils'
import { Link } from 'react-router-dom'

function CapsuleCard({ capsule }) {
    const unlocked = isUnlocked(capsule.unlock_date)

    return (
        <Link to={`/capsule/${capsule.id}`}>
            <motion.div
                whileHover={{ scale: 1.02, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className={`glass-card-hover p-6 vr-card cursor-pointer relative overflow-hidden ${!unlocked ? 'locked-capsule' : ''
                    }`}
            >
                {/* Lock overlay for locked capsules */}
                {!unlocked && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className="text-center">
                            <div className="text-6xl mb-4 animate-pulse">🔒</div>
                            <p className="text-sm text-gray-300">{getTimeRemaining(capsule.unlock_date)}</p>
                        </div>
                    </div>
                )}

                <div className={unlocked ? 'relative z-10' : 'relative z-0 blur-sm'}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white truncate flex-1">
                            {capsule.title}
                        </h3>
                        {capsule.is_group && (
                            <span className="ml-2 px-3 py-1 bg-purple-500/30 rounded-full text-xs">
                                Group
                            </span>
                        )}
                    </div>

                    {capsule.description && (
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                            {capsule.description}
                        </p>
                    )}

                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-400">
                                📁 {capsule.media?.length || 0} files
                            </span>
                            {unlocked && (
                                <span className="text-green-400 font-semibold flex items-center">
                                    <span className="mr-1">✓</span> Unlocked
                                </span>
                            )}
                        </div>
                    </div>

                    {!unlocked && (
                        <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-xs text-gray-400">
                                {getTimeRemaining(capsule.unlock_date)}
                            </p>
                        </div>
                    )}
                </div>
            </motion.div>
        </Link>
    )
}

export default CapsuleCard
