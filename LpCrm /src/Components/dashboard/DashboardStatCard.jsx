import React, { memo } from 'react';
import { StatCard } from '../ui';

const DashboardStatCard = memo(({ title, value, change, trend, icon, color }) => {
  const iconBgColor = color; 
  
  return (
    <StatCard
      title={title}
      value={value}
      icon={icon}
      iconBgColor={iconBgColor}
      iconColor="text-white"
      trend={trend}
      trendValue={change}
      trendLabel="vs last month"
    />
  );
});

DashboardStatCard.displayName = 'DashboardStatCard';
export default DashboardStatCard;
