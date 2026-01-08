'use client';

import { ActivityForApproval } from '../types';
import { ActivityCard } from './ActivityCard';
import { EmptyState } from './EmptyState';

interface ApprovalsCardProps {
  activities: ActivityForApproval[];
  isLoading?: boolean;
  error?: string | null;
  onDetails?: (id: string) => void;
}

export function ApprovalsCard({
  activities,
  isLoading,
  error,
  onDetails,
}: ApprovalsCardProps) {
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
        <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
          >
            <div className="space-y-3">
              <div className="h-6 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id}
          activity={activity}
          onDetails={onDetails}
        />
      ))}
    </div>
  );
}
