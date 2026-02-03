import { ActivityForApproval } from './types';
import { calculateDuration } from './utils';

const activityTypes = ['Harvest', 'Spraying', 'Irrigation', 'Planting', 'Weeding', 'Fertilizing'];
const workerNames = [
  'John Smith',
  'Maria Garcia',
  'Ahmed Hassan',
  'Li Wei',
  'Emma Johnson',
  'Carlos Rodriguez',
  'Priya Patel',
  'David Kim',
];
const plotNames = [
  'North Field A',
  'South Field B',
  'East Plot C',
  'West Plot D',
  'Central Field E',
  'Greenhouse 1',
  'Greenhouse 2',
  'Orchard North',
];

/**
 * Generate a random date within the last 7 days
 */
function randomRecentDate(): string {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 7);
  const hoursAgo = Math.floor(Math.random() * 24);
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
}

/**
 * Generate a random time on a specific date during working hours
 * @param targetDate - The date to generate time for
 * @param earlier - If true, generates morning time (6 AM - 2 PM), otherwise afternoon (2 PM - 10 PM)
 */
function randomTimeOnDate(targetDate: Date, earlier: boolean = false): string {
  const hours = earlier
    ? Math.floor(Math.random() * 8) + 6 // 6 AM - 2 PM
    : Math.floor(Math.random() * 8) + 14; // 2 PM - 10 PM
  const minutes = Math.floor(Math.random() * 60);
  const date = new Date(targetDate);
  date.setHours(hours, minutes, 0, 0);
  return date.toISOString();
}

/**
 * Generate a random date within the last 7 days (including today)
 * Returns a Date object set to midnight for consistent day grouping
 */
function randomDayInLastWeek(): Date {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 7); // 0-6 days ago (0 = today)
  const date = new Date(now);
  date.setDate(date.getDate() - daysAgo);
  date.setHours(0, 0, 0, 0); // Set to midnight for consistent day
  return date;
}

/**
 * Generate mock activities for approval
 * Creates 30-50 activities spread across the last 7 days
 */
export function generateMockActivities(): ActivityForApproval[] {
  const activities: ActivityForApproval[] = [];
  
  // Status distribution: mostly NEW, some PENDING, some APPROVED
  const statuses: Array<'NEW' | 'PENDING' | 'APPROVED'> = [
    'NEW',
    'NEW',
    'NEW',
    'NEW',
    'NEW',
    'NEW',
    'NEW',
    'PENDING',
    'PENDING',
    'APPROVED',
  ];

  // Generate 40 activities (within the 30-50 range)
  const activityCount = 40;

  for (let i = 0; i < activityCount; i++) {
    // Generate a random day within the last 7 days (including today)
    const activityDate = randomDayInLastWeek();
    
    // Generate enter time (morning: 6 AM - 2 PM)
    const enterTime = randomTimeOnDate(activityDate, true);
    
    // 70% chance of having an exit time
    const hasExit = Math.random() > 0.3;
    const exitTime = hasExit ? randomTimeOnDate(activityDate, false) : null;
    const duration = calculateDuration(enterTime, exitTime);
    const hasMissingExit = !hasExit;

    const createdAt = randomRecentDate();
    const updatedAt = randomRecentDate();

    // Select a worker index to ensure workerId and workerName are consistent
    const workerIndex = Math.floor(Math.random() * workerNames.length);
    const workerId = `worker-${workerIndex + 1}`;
    const workerName = workerNames[workerIndex];

    // Select a plot index to ensure plotId and plotName are consistent
    const plotIndex = Math.floor(Math.random() * plotNames.length);
    const plotId = `plot-${plotIndex + 1}`;
    const plotName = plotNames[plotIndex];

    activities.push({
      id: `activity-${i + 1}`,
      workerId,
      workerName,
      plotId,
      plotName,
      activityType: activityTypes[Math.floor(Math.random() * activityTypes.length)],
      enterTime,
      exitTime,
      duration,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      note: Math.random() > 0.6 ? `Note for activity ${i + 1}` : undefined,
      hasMissingExit,
      createdAt,
      updatedAt,
    });
  }

  return activities;
}
