import { ActivityForApproval } from './types';

export type GroupMode = 'day' | 'worker' | 'plot';

export type ActivityGroup = {
  key: string;
  title: string;
  date?: string;
  workerId?: string;
  plotId?: string;
  counts: {
    total: number;
    pending: number;
    checked: number;
    approved: number;
    missingExit: number;
  };
  items: ActivityForApproval[];
};

export function getLocalDayKey(isoString: string | null): string {
  if (!isoString) return 'no-date';
  const date = new Date(isoString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function formatDayTitle(dateKey: string): string {
  if (dateKey === 'no-date') return 'No Date';
  const [year, month, day] = dateKey.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  return targetDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

export function groupActivities(
  activities: ActivityForApproval[],
  mode: GroupMode = 'day'
): ActivityGroup[] {
  if (activities.length === 0) return [];

  const groupsMap = new Map<string, ActivityForApproval[]>();

  for (const activity of activities) {
    let key = '';
    if (mode === 'day') key = getLocalDayKey(activity.enterTime);
    else if (mode === 'worker') key = activity.workerId;
    else if (mode === 'plot') key = activity.plotId;

    if (!groupsMap.has(key)) groupsMap.set(key, []);
    groupsMap.get(key)!.push(activity);
  }

  const groups: ActivityGroup[] = [];
  for (const [key, items] of groupsMap.entries()) {
    // מיון פנימי בתוך הקבוצה לפי הבקשה שלך
    if (mode === 'day') {
      // Group by DAY: sort by Plot Name (A–Z)
      items.sort((a, b) => a.plotName.localeCompare(b.plotName));
    } else if (mode === 'worker') {
      // Group by WORKER: sort by Date/Time (newest to oldest)
      items.sort((a, b) => new Date(b.enterTime || 0).getTime() - new Date(a.enterTime || 0).getTime());
    } else if (mode === 'plot') {
      // Group by PLOT: sort by Date/Time (newest to oldest)
      items.sort((a, b) => new Date(b.enterTime || 0).getTime() - new Date(a.enterTime || 0).getTime());
    }

    groups.push({
      key,
      title: mode === 'day' ? formatDayTitle(key) : (mode === 'worker' ? items[0].workerName : items[0].plotName),
      date: mode === 'day' && key !== 'no-date' ? key : undefined,
      counts: {
        total: items.length,
        pending: items.filter(a => a.status === 'PENDING').length,
        checked: items.filter(a => a.status === 'CHECKED').length,
        approved: items.filter(a => a.status === 'APPROVED').length,
        missingExit: items.filter(a => a.hasMissingExit).length,
      },
      items,
    });
  }

  // מיון הקבוצות עצמן
  if (mode === 'day') groups.sort((a, b) => b.key.localeCompare(a.key));
  else groups.sort((a, b) => a.title.localeCompare(b.title));

  return groups;
}