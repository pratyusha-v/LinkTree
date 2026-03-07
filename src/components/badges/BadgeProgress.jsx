import '../../styles/BadgeProgress.css';

export default function BadgeProgress({ 
  streakStats = {}, 
  milestoneStats = {}, 
  scholarStats = {},
  allBadges = [],
  userBadges = []
}) {
  const earnedBadgeIds = new Set(userBadges?.map(ub => ub.badge_id) || []);

  // Calculate next streak badge
  const streakBadges = allBadges?.filter(b => b.category === 'streak') || [];
  const nextStreakBadge = streakBadges.find(b => !earnedBadgeIds.has(b.id));
  
  // Calculate next milestone badge
  const milestoneBadges = allBadges?.filter(b => b.category === 'milestone') || [];
  const nextMilestoneBadge = milestoneBadges.find(b => !earnedBadgeIds.has(b.id));
  
  // Calculate scholar badge progress
  const scholarBadges = allBadges?.filter(b => b.category === 'scholar') || [];
  const earnedScholarBadges = scholarBadges.filter(b => earnedBadgeIds.has(b.id));
  
  // Helper to format milestone criteria
  const formatMilestoneCriteria = (badge) => {
    if (!badge) return null;
    const criteria = badge.criteria;
    if (criteria && criteria.count) {
      return `Next: ${criteria.count} items`;
    }
    return badge.description;
  };
  
  const progressCards = [
    {
      title: 'Current Streak',
      value: streakStats?.current_daily_streak || 0,
      unit: 'days',
      description: nextStreakBadge 
        ? `Next badge: ${nextStreakBadge.name}` 
        : 'All streak badges earned!',
      color: '#ef4444',
      icon: '🔥'
    },
    {
      title: 'Total Items',
      value: milestoneStats?.total_links_saved || 0,
      unit: 'saved',
      description: nextMilestoneBadge 
        ? formatMilestoneCriteria(nextMilestoneBadge)
        : 'All milestone badges earned!',
      color: '#3b82f6',
      icon: '🎯'
    },
    {
      title: 'Scholar Badges',
      value: earnedScholarBadges.length,
      unit: `of ${scholarBadges.length}`,
      description: 'Save at different times of day',
      color: '#8b5cf6',
      icon: '📚'
    }
  ];

  return (
    <div className="badge-progress">
      <div className="progress-grid">
        {progressCards.map((card) => (
          <div 
            key={card.title} 
            className="progress-card"
            style={{ '--card-color': card.color }}
          >
            <div className="progress-header">
              <span className="progress-icon">{card.icon}</span>
              <h3 className="progress-title">{card.title}</h3>
            </div>
            <div className="progress-value">
              <span className="value-number">{card.value}</span>
              <span className="value-unit">{card.unit}</span>
            </div>
            <p className="progress-description">{card.description}</p>
          </div>
        ))}
      </div>

      {/* Detailed Progress Bars */}
      <div className="detailed-progress">
        {nextStreakBadge && (
          <div className="progress-bar-container">
            <div className="progress-bar-header">
              <span className="progress-bar-label">Next Streak Badge: {nextStreakBadge.name}</span>
              <span className="progress-bar-value">
                {streakStats?.current_streak || 0} / {parseInt(nextStreakBadge.criteria) || 0}
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-bar-fill streak"
                style={{ 
                  width: `${Math.min(100, ((streakStats?.current_streak || 0) / (parseInt(nextStreakBadge.criteria) || 1)) * 100)}%` 
                }}
              />
            </div>
          </div>
        )}

        {nextMilestoneBadge && (
          <div className="progress-bar-container">
            <div className="progress-bar-header">
              <span className="progress-bar-label">Next Milestone: {nextMilestoneBadge.name}</span>
              <span className="progress-bar-value">
                {milestoneStats?.total_items_saved || 0} / {parseInt(nextMilestoneBadge.criteria) || 0}
              </span>
            </div>
            <div className="progress-bar">
              <div 
                className="progress-bar-fill milestone"
                style={{ 
                  width: `${Math.min(100, ((milestoneStats?.total_items_saved || 0) / (parseInt(nextMilestoneBadge.criteria) || 1)) * 100)}%` 
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
