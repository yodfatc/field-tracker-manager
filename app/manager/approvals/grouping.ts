import { ActivityForApproval } from './types';

/**
 * Grouping mode for activities
 */
export type GroupMode = 'day' | 'worker';

/**
 * Represents a group of activities with aggregated counts
 */
export type ActivityGroup = {
  key: string;
  title: string;
  date?: string;      // ISO date for day grouping
  workerId?: string;  // for worker grouping
  counts: {
    total: number;
    pending: number;
    checked: number;
    approved: number;
    missingExit: number;
  };
  items: ActivityForApproval[];
};

/**
 * Converts an ISO date string to a local date key in YYYY-MM-DD format.
 * Uses the local timezone to determine the date.
 * 
 * @param isoString - ISO date string (e.g., "2024-01-15T14:30:00Z")
 * @returns Date string in YYYY-MM-DD format (e.g., "2024-01-15")
 * 
 * @example
 * getLocalDayKey("2024-01-15T14:30:00Z") // Returns "2024-01-15"
 * getLocalDayKey("2024-12-31T23:30:00Z") // Returns "2024-12-31" (or "2025-01-01" depending on timezone)
 */
export function getLocalDayKey(isoString: string | null): string {
  if (!isoString) {
    // Return a special key for activities without enterTime
    return 'no-date';
  }
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date key (YYYY-MM-DD) into a human-readable title.
 * Returns "Today", "Yesterday", or a formatted date like "Mon, 8 Jan 2026".
 * 
 * @param dateKey - Date string in YYYY-MM-DD format
 * @returns Formatted date string
 * 
 * @example
 * formatDayTitle("2024-01-15") // Returns "Today", "Yesterday", or "Mon, 15 Jan 2024"
 */
export function formatDayTitle(dateKey: string): string {
  if (dateKey === 'no-date') {
    return 'No Date';
  }

  // Parse YYYY-MM-DD in local timezone
  const [year, month, day] = dateKey.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  targetDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Check if it's today
  if (targetDate.getTime() === today.getTime()) {
    return 'Today';
  }

  // Check if it's yesterday
  if (targetDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  // Format as "Mon, 8 Jan 2026"
  return targetDate.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Groups activities by the specified mode.
 * 
 * @param activities - Array of activities to group
 * @param mode - Grouping mode: 'day' (by enterTime date) or 'worker' (by workerId)
 * @returns Array of ActivityGroup objects, sorted according to the grouping mode
 * 
 * Day grouping:
 * - Groups by the local date of enterTime
 * - Sorted newest→oldest (most recent dates first)
 * - Activities without enterTime are grouped under "no-date"
 * 
 * Worker grouping:
 * - Groups by workerId
 * - Sorted by workerName A→Z
 * 
 * @example
 * // Day grouping example:
 * const activities = [
 *   { id: '1', enterTime: '2024-01-15T10:00:00Z', status: 'PENDING', hasMissingExit: false, ... },
 *   { id: '2', enterTime: '2024-01-15T14:00:00Z', status: 'APPROVED', hasMissingExit: false, ... },
 *   { id: '3', enterTime: '2024-01-14T09:00:00Z', status: 'PENDING', hasMissingExit: true, ... },
 * ];
 * const groups = groupActivities(activities, 'day');
 * // Returns:
 * // [
 * //   {
 * //     key: '2024-01-15',
 * //     title: '2024-01-15',
 * //     date: '2024-01-15',
 * //     counts: { total: 2, pending: 1, checked: 0, approved: 1, missingExit: 0 },
 * //     items: [activity1, activity2]
 * //   },
 * //   {
 * //     key: '2024-01-14',
 * //     title: '2024-01-14',
 * //     date: '2024-01-14',
 * //     counts: { total: 1, pending: 1, checked: 0, approved: 0, missingExit: 1 },
 * //     items: [activity3]
 * //   }
 * // ]
 * 
 * @example
 * // Worker grouping example:
 * const activities = [
 *   { id: '1', workerId: 'worker-1', workerName: 'John Smith', status: 'PENDING', ... },
 *   { id: '2', workerId: 'worker-2', workerName: 'Ahmed Hassan', status: 'APPROVED', ... },
 *   { id: '3', workerId: 'worker-1', workerName: 'John Smith', status: 'CHECKED', ... },
 * ];
 * const groups = groupActivities(activities, 'worker');
 * // Returns:
 * // [
 * //   {
 * //     key: 'worker-2',
 * //     title: 'Ahmed Hassan',
 * //     workerId: 'worker-2',
 * //     counts: { total: 1, pending: 0, checked: 0, approved: 1, missingExit: 0 },
 * //     items: [activity2]
 * //   },
 * //   {
 * //     key: 'worker-1',
 * //     title: 'John Smith',
 * //     workerId: 'worker-1',
 * //     counts: { total: 2, pending: 1, checked: 1, approved: 0, missingExit: 0 },
 * //     items: [activity1, activity3]
 * //   }
 * // ]
 */
export function groupActivities(
  activities: ActivityForApproval[],
  mode: GroupMode = 'day'
): ActivityGroup[] {
  if (activities.length === 0) {
    return [];
  }

  // Create a map to group activities
  const groupsMap = new Map<string, ActivityForApproval[]>();

  // Group activities
  for (const activity of activities) {
    const key = mode === 'day' 
      ? getLocalDayKey(activity.enterTime)
      : activity.workerId;

    if (!groupsMap.has(key)) {
      groupsMap.set(key, []);
    }
    groupsMap.get(key)!.push(activity);
  }

  // Convert map to ActivityGroup array
  const groups: ActivityGroup[] = [];
  for (const [key, items] of groupsMap.entries()) {
    // Calculate counts
    const counts = {
      total: items.length,
      pending: items.filter((a) => a.status === 'PENDING').length,
      checked: items.filter((a) => a.status === 'CHECKED').length,
      approved: items.filter((a) => a.status === 'APPROVED').length,
      missingExit: items.filter((a) => a.hasMissingExit).length,
    };

    // Determine title and metadata based on mode
    let title: string;
    let date: string | undefined;
    let workerId: string | undefined;

    if (mode === 'day') {
      date = key === 'no-date' ? undefined : key;
      title = formatDayTitle(key);
    } else {
      // mode === 'worker'
      workerId = key;
      // Use the first item's workerName (all items in a group have the same workerId)
      title = items[0]?.workerName || key;
    }

    groups.push({
      key,
      title,
      date,
      workerId,
      counts,
      items,
    });
  }

  // Sort groups based on mode
  if (mode === 'day') {
    // Sort by date: newest→oldest
    groups.sort((a, b) => {
      // Handle 'no-date' group - put it at the end
      if (a.key === 'no-date') return 1;
      if (b.key === 'no-date') return -1;
      // Compare dates (newest first)
      return b.key.localeCompare(a.key);
    });
  } else {
    // mode === 'worker'
    // Sort by workerName A→Z
    groups.sort((a, b) => {
      return a.title.localeCompare(b.title);
    });
  }

  return groups;
}
