import { ActivityForApproval } from '../types';
import { formatTime, formatDuration } from '../utils';
import { StatusBadge } from './StatusBadge';
import { ActionButtons } from './ActionButtons';

interface ActivityCardProps {
  activity: ActivityForApproval;
  onDetails?: (id: string) => void;
}

export function ActivityCard({ activity, onDetails }: ActivityCardProps) {
  const handleCardClick = () => {
    if (onDetails) {
      onDetails(activity.id);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
    >
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            {activity.workerName}
          </h3>
          <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
            {activity.plotName}
          </p>
        </div>
        <StatusBadge status={activity.status} />
      </div>

      {/* Activity Type */}
      <div className="mb-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Activity: <span className="font-medium">{activity.activityType}</span>
        </span>
      </div>

      {/* Times */}
      <div className="mb-3 grid grid-cols-2 gap-3 text-sm">
        <div>
          <span className="text-gray-500 dark:text-gray-400">Enter:</span>
          <p className="font-medium text-gray-900 dark:text-gray-100">
            {formatTime(activity.enterTime)}
          </p>
        </div>
        <div>
          <span className="text-gray-500 dark:text-gray-400">Exit:</span>
          <div className="flex items-center gap-1">
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {formatTime(activity.exitTime)}
            </p>
            {activity.hasMissingExit && (
              <span
                className="text-yellow-600 dark:text-yellow-400"
                title="Missing exit time"
              >
                ⚠️
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Duration */}
      <div className="mb-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">Duration: </span>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {formatDuration(activity.duration)}
        </span>
      </div>

      {/* Note indicator */}
      {activity.note && (
        <div className="mb-3 flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
            />
          </svg>
          <span>Has note</span>
        </div>
      )}

      {/* Actions */}
      <div
        className="mt-4 border-t border-gray-200 pt-3 dark:border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <ActionButtons
          onDetails={onDetails ? () => onDetails(activity.id) : undefined}
        />
      </div>
    </div>
  );
}
