'use client';

import { RealDataRow } from '../../approvals/types';
import { formatDate, formatTime, formatDuration } from '../../approvals/utils';

interface RealDataTableProps {
  data: RealDataRow[];
  isLoading?: boolean;
  error?: string | null;
}

/* ---------- helpers ---------- */
function formatDateDMY(value: string | null | undefined): string {
  if (!value) return '-';

  // If it's ISO (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS...), format safely
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const d = new Date(value);
    if (isNaN(d.getTime())) return '-';
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // If it's already D/M/YYYY or DD/MM/YYYY, parse manually (DD/MM/YYYY)
  // Accept separators / or -
  const m = value.trim().match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (m) {
    const dd = m[1].padStart(2, '0');
    const mm = m[2].padStart(2, '0');
    const yyyy = m[3];
    return `${dd}/${mm}/${yyyy}`;
  }

  // Fallback: try Date, but this is last resort
  const d = new Date(value);
  if (isNaN(d.getTime())) return value; // show raw if unknown
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function parseDateTime(value: string | null | undefined): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function durationFromEnterExitMinutes(
  enter: string | null,
  exit: string | null
): number | null {
  const start = parseDateTime(enter);
  const end = parseDateTime(exit);
  if (!start || !end) return null;

  const diffMs = end.getTime() - start.getTime();
  if (diffMs <= 0) return 0;

  return Math.round(diffMs / 60000); // minutes
}

/**
 * Fallback parsing for row.duration if timestamps are missing
 * Supports:
 *  - "6h 53m"
 *  - "00:32:00"
 *  - "32:10"
 *  - "45"
 */
function parseDurationToMinutes(duration: string | null): number | null {
  if (!duration) return null;
  const s = duration.trim();

  // "6h 53m"
  const h = s.match(/(\d+)\s*h/i);
  const m = s.match(/(\d+)\s*m/i);
  if (h || m) {
    const hours = h ? parseInt(h[1], 10) : 0;
    const mins = m ? parseInt(m[1], 10) : 0;
    return hours * 60 + mins;
  }

  // "HH:MM:SS" or "MM:SS"
  if (s.includes(':')) {
    const parts = s.split(':').map((p) => parseInt(p, 10));
    if (parts.some((n) => isNaN(n))) return null;

    if (parts.length === 3) {
      const [hh, mm, ss] = parts;
      return hh * 60 + mm + Math.round(ss / 60);
    }
    if (parts.length === 2) {
      const [mm, ss] = parts;
      return mm + Math.round(ss / 60);
    }
  }

  // numeric minutes
  if (/^\d+(\.\d+)?$/.test(s)) {
    return Math.round(parseFloat(s));
  }

  return null;
}

function getDurationMinutes(row: RealDataRow): number | null {
  // Prefer real timestamps
  const fromTimes = durationFromEnterExitMinutes(
    row.enter_plot,
    row.exit_plot
  );
  if (fromTimes !== null) return fromTimes;

  // Fallback to duration field
  return parseDurationToMinutes(row.duration);
}

function getRowKey(row: RealDataRow, index: number): string {
  return `${row.date}-${row.plot}-${row.worker}-${row.enter_plot ?? index}`;
}

/* ---------- component ---------- */

export function RealDataTable({
  data,
  isLoading,
  error,
}: RealDataTableProps) {
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">Loading…</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <p className="text-sm text-gray-500">No activities found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white">
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-3">
        <h2 className="text-lg font-semibold">All Activities</h2>
        <span className="text-sm text-gray-500">Total: {data.length}</span>
      </div>

      {/* Table */}
      <div className="border-t border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Plot
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Worker
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Duration
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Enter Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">
                Exit Time
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {data.map((row, index) => {
              const minutes = getDurationMinutes(row);

              return (
                <tr
                  key={getRowKey(row, index)}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm">
                  {formatDateDMY(row.date)}
                  </td>
                  <td className="px-4 py-3 text-sm">{row.plot}</td>
                  <td className="px-4 py-3 text-sm font-medium">
                    {row.worker}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {minutes === null ? '-' : formatDuration(minutes)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatTime(row.enter_plot)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {formatTime(row.exit_plot)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
