import { motion, AnimatePresence } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import '../../styles/BadgeNotification.css';

const BADGE_ICONS = {
  streak: '🔥',
  milestone: '🎯',
  scholar: '📚',
  morning_scholar: '🌅',
  afternoon_scholar: '☀️',
  night_scholar: '🌙'
};

export default function BadgeNotification({ badge, onClose }) {
  if (!badge) return null;

  const icon = BADGE_ICONS[badge.badge_type] || '🏆';

  return (
    <AnimatePresence>
      <motion.div
        className="badge-notification-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="badge-notification"
          initial={{ scale: 0.5, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.5, opacity: 0, y: 50 }}
          transition={{ type: 'spring', duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="notification-close" onClick={onClose}>
            <FiX size={20} />
          </button>

          <motion.div
            className="notification-icon"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <span className="icon-emoji">{icon}</span>
          </motion.div>

          <h2 className="notification-title">Badge Unlocked!</h2>
          <h3 className="notification-badge-name">{badge.name}</h3>
          <p className="notification-description">{badge.description}</p>

          <motion.div
            className="notification-confetti"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {[...Array(20)].map((_, i) => (
              <motion.span
                key={i}
                className="confetti-piece"
                initial={{ 
                  x: 0, 
                  y: 0, 
                  opacity: 1,
                  scale: 1
                }}
                animate={{ 
                  x: Math.random() * 400 - 200,
                  y: Math.random() * 400 - 200,
                  opacity: 0,
                  scale: 0,
                  rotate: Math.random() * 360
                }}
                transition={{ 
                  duration: 1.5,
                  delay: 0.3 + Math.random() * 0.2
                }}
                style={{
                  backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][i % 5]
                }}
              />
            ))}
          </motion.div>

          <button className="notification-action" onClick={onClose}>
            Awesome!
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
