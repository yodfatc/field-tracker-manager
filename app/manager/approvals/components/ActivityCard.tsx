import { ActivityForApproval } from '../types';
import { formatTime, formatDuration, formatDate } from '../utils';
import { StatusBadge } from './StatusBadge';
import { ActionButtons } from './ActionButtons';

interface ActivityCardProps {
  activity: ActivityForApproval;
  onDetails?: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function ActivityCard({ activity, onDetails, isSelected, onToggleSelect }: ActivityCardProps) {
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
      {/* Header: checkbox (when selection enabled), Date, Status */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {onToggleSelect && (
            <div onClick={(e) => e.stopPropagation()} className="flex-shrink-0 pt-0.5">
              <input
                type="checkbox"
                checked={!!isSelected}
                onChange={onToggleSelect}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                aria-label={`Select ${activity.workerName}`}
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {formatDate(activity.enterTime)}
            </p>
            <p className="mt-1 text-sm font-medium text-gray-700 dark:text-gray-300">
              Plot: <span className="font-medium">{activity.plotName}</span>
            </p>
          </div>
        </div>
        <StatusBadge status={activity.status} />
      </div>

      {/* Activity Type */}
      <div className="mb-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Activity Type: <span className="font-medium">{activity.activityType}</span>
        </span>
      </div>

      {/* Worker Name */}
      <div className="mb-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Worker: <span className="font-medium">{activity.workerName}</span>
        </span>
      </div>

      {/* Duration */}
      <div className="mb-3">
        <span className="text-sm text-gray-500 dark:text-gray-400">Duration: </span>
        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {formatDuration(activity.duration)}
        </span>
      </div>

      {/* Enter Time / Exit Time */}
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

      {/* Note indicator (optional) */}
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
