import React, { memo } from 'react';
import StatCard from './StatCard';

const StatsGrid = memo(({ stats }) => (
  <div className="grid grid-cols-1 min-[480px]:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
    {stats.map((stat, index) => (
      <StatCard key={index} {...stat} />
    ))}
  </div>
));

export default StatsGrid;
