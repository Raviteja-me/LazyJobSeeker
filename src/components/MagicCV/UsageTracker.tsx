import React from 'react';
import { Clock } from 'lucide-react';

interface UsageTrackerProps {
  dailyUsageCount: number;
  maxUsage: number;
}

const UsageTracker: React.FC<UsageTrackerProps> = ({
  dailyUsageCount,
  maxUsage
}) => {
  return (
    <div className="bg-gradient-to-r from-white to-indigo-50 rounded-lg shadow-enhanced p-6 border border-indigo-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Clock className="h-5 w-5 text-indigo-600 mr-2" />
          <h3 className="font-semibold text-indigo-900">
            Daily Resume Processing Limit
          </h3>
        </div>
        <span className="text-sm bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full font-medium">
          {dailyUsageCount}/{maxUsage} resumes today
        </span>
      </div>
      <div className="h-3 rounded-full bg-gray-100 overflow-hidden shadow-inner">
        <div
          className="h-full transition-all duration-500 ease-in-out rounded-full"
          style={{
            width: `${(dailyUsageCount / maxUsage) * 100}%`,
            background: dailyUsageCount === 0 
              ? 'linear-gradient(to right, #4ade80, #22c55e)' 
              : dailyUsageCount === 1 
              ? 'linear-gradient(to right, #4ade80, #22c55e)' 
              : dailyUsageCount === 2 
              ? 'linear-gradient(to right, #fbbf24, #f59e0b)' 
              : 'linear-gradient(to right, #f87171, #ef4444)'
          }}
        />
      </div>
      <p className="text-xs text-indigo-500 mt-2">
        {dailyUsageCount >= maxUsage 
          ? 'You\'ve reached your daily limit. Check back tomorrow!' 
          : `You have ${maxUsage - dailyUsageCount} resume enhancements remaining today.`}
      </p>
    </div>
  );
};

export default UsageTracker;