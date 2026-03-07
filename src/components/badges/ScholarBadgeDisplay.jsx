import '../../styles/ScholarBadgeDisplay.css';

const TIME_PERIODS = [
  { key: 'morning', label: 'Morning', time: '4:00 AM - 11:59 AM', icon: '🌅', color: '#f59e0b' },
  { key: 'afternoon', label: 'Afternoon', time: '12:00 PM - 7:59 PM', icon: '☀️', color: '#3b82f6' },
  { key: 'night', label: 'Night', time: '8:00 PM - 3:59 AM', icon: '🌙', color: '#8b5cf6' }
];

export default function ScholarBadgeDisplay({ scholarStats = {}, userBadges = [] }) {
  const totalSaves = scholarStats?.total_saves_30d || 0;
  const morningCount = scholarStats?.morning_saves_30d || 0;
  const afternoonCount = scholarStats?.afternoon_saves_30d || 0;
  const nightCount = scholarStats?.night_saves_30d || 0;

  // Check which scholar badges are earned
  const scholarBadgeIds = ['morning_scholar', 'afternoon_scholar', 'night_scholar'];
  const earnedScholarBadges = new Set(
    userBadges
      ?.filter(ub => scholarBadgeIds.includes(ub.badge_id))
      .map(ub => ub.badge_id) || []
  );

  const stats = [
    { 
      ...TIME_PERIODS[0], 
      count: morningCount, 
      percentage: totalSaves > 0 ? (morningCount / totalSaves) * 100 : 0,
      isEarned: earnedScholarBadges.has('morning_scholar')
    },
    { 
      ...TIME_PERIODS[1], 
      count: afternoonCount, 
      percentage: totalSaves > 0 ? (afternoonCount / totalSaves) * 100 : 0,
      isEarned: earnedScholarBadges.has('afternoon_scholar')
    },
    { 
      ...TIME_PERIODS[2], 
      count: nightCount, 
      percentage: totalSaves > 0 ? (nightCount / totalSaves) * 100 : 0,
      isEarned: earnedScholarBadges.has('night_scholar')
    }
  ];

  const maxCount = Math.max(morningCount, afternoonCount, nightCount, 1);

  return (
    <div className="scholar-badge-display">
      <div className="scholar-summary">
        <div className="summary-stat">
          <div className="summary-value">{totalSaves}</div>
          <div className="summary-label">Total Saves</div>
        </div>
      </div>

      <div className="scholar-chart">
        {stats.map((stat) => (
          <div key={stat.key} className="chart-column">
            <div className="chart-bar-container">
              <div 
                className={`chart-bar ${stat.isEarned ? 'earned' : ''}`}
                style={{ 
                  height: `${(stat.count / maxCount) * 100}%`,
                  backgroundColor: stat.color
                }}
              >
                <div className="bar-value">{stat.count}</div>
              </div>
            </div>
            <div className="chart-label">
              <div className="label-icon">{stat.icon}</div>
              <div className="label-text">
                <div className="label-name">{stat.label}</div>
                <div className="label-time">{stat.time}</div>
                <div className="label-percentage">{stat.percentage.toFixed(0)}%</div>
              </div>
              {stat.isEarned && <div className="badge-earned-indicator">✓ Badge Earned</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="scholar-info">
        <h4>How Scholar Badges Work</h4>
        <p>
          Earn scholar badges by saving items during different times of the day. 
          You need at least <strong>10 saves</strong> in a time period, 
          with at least <strong>40% of your activity</strong> in that period.
        </p>
      </div>
    </div>
  );
}
