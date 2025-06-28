import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  change?: string;
  icon?: React.ReactNode;
  color?: string; // e.g. 'from-green-500 to-green-700'
  gradient?: string; // e.g. 'bg-gradient-to-br from-green-500 to-green-700'
  children?: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  color = 'from-green-500 to-green-700',
  gradient = 'bg-gradient-to-br from-green-500 to-green-700',
  children,
}) => {
  return (
    <div className={`rounded-2xl shadow-xl p-6 text-white relative overflow-hidden ${gradient} transition-all duration-300 hover:scale-105`}> 
      <div className="absolute inset-0 bg-white/10"></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium opacity-90">{title}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
          </div>
          {icon && (
            <div className="p-3 rounded-full bg-white bg-opacity-20 backdrop-blur-sm flex items-center justify-center">
              {icon}
            </div>
          )}
        </div>
        {change && (
          <div className="mt-4">
            <span className="text-sm font-medium text-white">{change}</span>
            <span className="text-sm text-white/80 ml-1">from last month</span>
          </div>
        )}
        {children}
      </div>
    </div>
  );
};

export default StatCard; 