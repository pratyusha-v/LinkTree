import { motion } from 'framer-motion';
import { FiLock } from 'react-icons/fi';
import '../../styles/BadgeCollection.css';

const BADGE_ICONS = {
  streak: '🔥',
  milestone: '🎯',
  scholar: '📚'
};

export default function BadgeCollection({ userBadges = [], allBadges = [] }) {
  const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);

  const groupedBadges = allBadges?.reduce((acc, badge) => {
    if (!acc[badge.badge_type]) {
      acc[badge.badge_type] = [];
    }
    acc[badge.badge_type].push(badge);
    return acc;
  }, {}) || {};

  const getBadgeIcon = (type) => BADGE_ICONS[type] || '🏆';

  const getBadgeStatus = (badgeId) => {
    return earnedBadgeIds.has(badgeId);
  };

  return (
    <div className="badge-collection">
      {Object.entries(groupedBadges).map(([type, badges]) => (
        <div key={type} className="badge-category">
          <h3 className="category-title">
            <span className="category-icon">{getBadgeIcon(type)}</span>
            {type.charAt(0).toUpperCase() + type.slice(1)} Badges
          </h3>
          
          <div className="badges-grid">
            {badges.map((badge) => {
              const isEarned = getBadgeStatus(badge.id);
              const userBadge = userBadges?.find(ub => ub.badge_id === badge.id);
              
              return (
                <motion.div
                  key={badge.id}
                  className={`badge-card ${isEarned ? 'earned' : 'locked'}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ scale: isEarned ? 1.05 : 1 }}
                >
                  <div className="badge-visual">
                    {isEarned ? (
                      <span className="badge-emoji">{getBadgeIcon(badge.badge_type)}</span>
                    ) : (
                      <div className="badge-locked">
                        <FiLock size={32} />
                      </div>
                    )}
                  </div>
                  
                  <div className="badge-info">
                    <h4 className="badge-name">{badge.name}</h4>
                    <p className="badge-description">{badge.description}</p>
                    
                    {isEarned && userBadge && (
                      <div className="badge-earned-date">
                        Earned {new Date(userBadge.awarded_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                    )}
                    
                    {!isEarned && (
                      <div className="badge-requirement">
                        {badge.criteria}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
