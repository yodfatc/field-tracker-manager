import { ActivityForApproval } from './types';

export type GroupMode = 'date' | 'worker' | 'plot' | 'none';

export type ActivityGroup = {
  key: string;
  title: string;
  counts: {
    total: number;
    new: number;      // במקום pending
    pending: number;  // במקום checked
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

export function groupActivities(
  activities: ActivityForApproval[],
  mode: GroupMode = 'plot'
): ActivityGroup[] {
  if (activities.length === 0) return [];

  if (mode === 'none') {
    return [{
      key: 'all',
      title: 'All Activities',
      counts: calculateCounts(activities),
      items: activities.sort((a, b) => new Date(b.enterTime || 0).getTime() - new Date(a.enterTime || 0).getTime())
    }];
  }

  const groupsMap = new Map<string, ActivityForApproval[]>();

  for (const activity of activities) {
    let key = '';
    if (mode === 'date') key = getLocalDayKey(activity.enterTime);
    else if (mode === 'worker') key = activity.workerId;
    else if (mode === 'plot') key = activity.plotId;

    if (!groupsMap.has(key)) groupsMap.set(key, []);
    groupsMap.get(key)!.push(activity);
  }

  return Array.from(groupsMap.entries()).map(([key, items]) => {
    // מיון פנימי
    if (mode === 'date') {
      items.sort((a, b) => a.plotName.localeCompare(b.plotName));
    } else {
      items.sort((a, b) => new Date(b.enterTime || 0).getTime() - new Date(a.enterTime || 0).getTime());
    }

    return {
      key,
      title: mode === 'date' ? (items[0].enterTime ? new Date(items[0].enterTime).toLocaleDateString('he-IL') : 'ללא תאריך') 
             : (mode === 'worker' ? items[0].workerName : items[0].plotName),
      counts: calculateCounts(items),
      items,
    };
  }).sort((a, b) => a.title.localeCompare(b.title));
}

function calculateCounts(items: ActivityForApproval[]) {
  return {
    total: items.length,
    new: items.filter((a) => a.status === 'NEW').length,
    pending: items.filter((a) => a.status === 'PENDING').length,
    approved: items.filter((a) => a.status === 'APPROVED').length,
    missingExit: items.filter((a) => a.hasMissingExit).length,
  };
}