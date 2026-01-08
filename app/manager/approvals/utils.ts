import { ActivityForApproval } from './types';

/**
 * Format a date string to a readable time format (HH:MM)
 */
export function formatTime(dateString: string | null): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/**
 * Format a date string to a readable date format (dd/mm/yyyy)
 */
export function formatDate(dateString: string | null): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format duration in minutes to a readable string (e.g., "2h 30m")
 */
export function formatDuration(minutes: number | null): string {
  if (minutes === null) return '—';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/**
 * Calculate duration in minutes from enterTime and exitTime
 */
export function calculateDuration(
  enterTime: string | null,
  exitTime: string | null
): number | null {
  if (!enterTime || !exitTime) return null;
  const enter = new Date(enterTime);
  const exit = new Date(exitTime);
  const diffMs = exit.getTime() - enter.getTime();
  return Math.round(diffMs / (1000 * 60)); // Convert to minutes
}
