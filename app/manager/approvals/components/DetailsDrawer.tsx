'use client';

import { useState, useEffect } from 'react';
import { ActivityForApproval } from '../types';
import { formatTime, formatDate, formatDuration } from '../utils';

interface DetailsDrawerProps {
  activity: ActivityForApproval | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string, activityType: string, managerNote: string) => void;
}

const ACTIVITY_TYPES = [
  'Harvest',
  'Spraying',
  'Irrigation',
  'Planting',
  'Weeding',
  'Fertilizing',
  'Pruning',
  'Monitoring',
];

const MAX_NOTE_LENGTH = 300;

export function DetailsDrawer({ activity, isOpen, onClose, onApprove }: DetailsDrawerProps) {
  const [selectedActivityType, setSelectedActivityType] = useState<string>('');
  const [managerNote, setManagerNote] = useState<string>('');
  const [approvePartial, setApprovePartial] = useState<boolean>(false);

  useEffect(() => {
    if (activity) {
      // Initialize with existing activity type if available
      setSelectedActivityType(activity.activityType || '');
      setManagerNote('');
      setApprovePartial(false);
    }
  }, [activity]);

  if (!activity || !isOpen) return null;

  const hasMissingExit = activity.exitTime === null;
  const canApprove = selectedActivityType !== '' && (!hasMissingExit || approvePartial);

  const handleApprove = () => {
    if (canApprove) {
      onApprove(activity.id, selectedActivityType, managerNote);
      onClose();
    }
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_NOTE_LENGTH) {
      setManagerNote(value);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black transition-opacity ${
          isOpen ? 'opacity-50' : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-lg transform bg-white shadow-xl transition-transform duration-300 ease-in-out dark:bg-gray-800 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Activity Details
            </h2>
            <button
              onClick={onClose}
              className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-700 dark:hover:text-gray-300"
              aria-label="Close drawer"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* Missing Exit Warning */}
            {hasMissingExit && (
              <div className="mb-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
                <div className="flex items-start gap-3">
                  <svg
                    className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                      Missing exit time
                    </h3>
                    <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-400">
                      This activity is missing an exit time. You can approve it as a partial
                      activity by checking the option below.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Information */}
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Worker Name
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {activity.workerName}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Plot Name
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {activity.plotName}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Current Activity Type
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {activity.activityType}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Enter Time
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {formatTime(activity.enterTime)}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(activity.enterTime)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Exit Time
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                    {formatTime(activity.exitTime)}
                  </p>
                  {activity.exitTime && (
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(activity.exitTime)}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Duration
                </label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {formatDuration(activity.duration)}
                </p>
              </div>

              {activity.note && (
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Worker Note
                  </label>
                  <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{activity.note}</p>
                </div>
              )}

              {/* Activity Type Dropdown */}
              <div>
                <label
                  htmlFor="activity-type"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Activity Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="activity-type"
                  value={selectedActivityType}
                  onChange={(e) => setSelectedActivityType(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                >
                  <option value="">Select activity type</option>
                  {ACTIVITY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Manager Note */}
              <div>
                <label
                  htmlFor="manager-note"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Manager Note
                </label>
                <textarea
                  id="manager-note"
                  rows={4}
                  value={managerNote}
                  onChange={handleNoteChange}
                  placeholder="Add a note (optional)"
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-400"
                />
                <div className="mt-1 flex justify-end">
                  <span
                    className={`text-xs ${
                      managerNote.length === MAX_NOTE_LENGTH
                        ? 'text-red-500'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {managerNote.length}/{MAX_NOTE_LENGTH}
                  </span>
                </div>
              </div>

              {/* Approve Partial Checkbox */}
              {hasMissingExit && (
                <div className="flex items-start gap-2">
                  <input
                    id="approve-partial"
                    type="checkbox"
                    checked={approvePartial}
                    onChange={(e) => setApprovePartial(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <label
                    htmlFor="approve-partial"
                    className="text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    Approve partial activity
                  </label>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 dark:border-gray-700">
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Close
              </button>
              <button
                onClick={handleApprove}
                disabled={!canApprove}
                className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}