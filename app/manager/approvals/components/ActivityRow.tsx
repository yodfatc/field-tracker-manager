import { ActivityForApproval } from '../types';
import { formatTime, formatDuration, formatDate } from '../utils';
import { StatusBadge } from './StatusBadge';
import { ActionButtons } from './ActionButtons';

interface ActivityRowProps {
  activity: ActivityForApproval;
  onDetails?: (id: string) => void;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export function ActivityRow({ activity, onDetails, isSelected, onToggleSelect }: ActivityRowProps) {
  const handleRowClick = () => {
    if (onDetails) {
      onDetails(activity.id);
    }
  };

  return (
    <tr
      onClick={handleRowClick}
      className="cursor-pointer border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
    >
      <td className="w-12 px-4 py-3" onClick={(e) => e.stopPropagation()}>
        {onToggleSelect ? (
          <input
            type="checkbox"
            checked={!!isSelected}
            onChange={onToggleSelect}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
            aria-label={`Select ${activity.workerName}`}
          />
        ) : null}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
        {formatDate(activity.enterTime)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
        {activity.plotName}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
        {activity.activityType}
      </td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
        {activity.workerName}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
        {formatDuration(activity.duration)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
        {formatTime(activity.enterTime)}
      </td>
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2">
          {formatTime(activity.exitTime)}
          {activity.hasMissingExit && (
            <span
              className="text-yellow-600 dark:text-yellow-400"
              title="Missing exit time"
            >
              ⚠️
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={activity.status} />
      </td>
      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
        <ActionButtons
          onDetails={onDetails ? () => onDetails(activity.id) : undefined}
        />
      </td>
    </tr>
  );
}
