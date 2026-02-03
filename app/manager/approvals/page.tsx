'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ActivityForApproval } from './types';
import { generateMockActivities } from './mock-data';
import { ApprovalsTable } from './components/ApprovalsTable';
import { ApprovalsCard } from './components/ApprovalsCard';
import { DetailsDrawer } from './components/DetailsDrawer';
import { Toast } from './components/Toast';
import { GroupedApprovals } from './components/GroupedApprovals';
import { GroupMode, groupActivities, getLocalDayKey } from './grouping';
import { ACTIVITY_TYPES } from './constants';

export default function ApprovalsPage() {
  const [activities, setActivities] = useState<ActivityForApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  // Bulk selection state (managed in page, passed down)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkActivityType, setBulkActivityType] = useState<string>('');

  // Grouping mode state
  const [groupMode, setGroupMode] = useState<GroupMode>('plot');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'NEW' | 'PENDING' | 'APPROVED'>('ALL');
  const [dayFilter, setDayFilter] = useState<string>(() => {
    // Default to today's date in YYYY-MM-DD format
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  });

  useEffect(() => {
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => {
      try {
        const mockActivities = generateMockActivities();
        setActivities(mockActivities);
        setError(null);
      } catch (err) {
        setError('Failed to load activities');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 500);
  }, []);

  useEffect(() => {
    // Check if mobile on mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDetails = (id: string) => {
    setSelectedActivityId(id);
  };

  const handleCloseDrawer = () => {
    setSelectedActivityId(null);
  };

  const handleApprove = (id: string, activityType: string, managerNote: string) => {
    setActivities((prevActivities) =>
      prevActivities.map((activity) =>
        activity.id === id
          ? { ...activity, status: 'APPROVED', activityType }
          : activity
      )
    );
    setShowToast(true);
  };

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAllInGroup = useCallback((ids: string[], checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) ids.forEach((id) => next.add(id));
      else ids.forEach((id) => next.delete(id));
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
    setBulkActivityType('');
  }, []);

  const handleBulkApprove = useCallback(() => {
    if (!bulkActivityType.trim()) return;
    const ids = Array.from(selectedIds);
    setActivities((prevActivities) =>
      prevActivities.map((activity) =>
        ids.includes(activity.id)
          ? { ...activity, status: 'APPROVED', activityType: bulkActivityType }
          : activity
      )
    );
    setSelectedIds(new Set());
    setBulkActivityType('');
    setShowToast(true);
  }, [selectedIds, bulkActivityType]);

  // Apply filters first
  const filteredActivities = useMemo(() => {
    let filtered = [...activities];

    // Search filter (worker name, plot name, activity type)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (activity) =>
          activity.workerName.toLowerCase().includes(query) ||
          activity.plotName.toLowerCase().includes(query) ||
          activity.activityType.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((activity) => activity.status === statusFilter);
    }

    // Day filter
    if (dayFilter) {
      filtered = filtered.filter((activity) => {
        if (!activity.enterTime) return false;
        return getLocalDayKey(activity.enterTime) === dayFilter;
      });
    }

    return filtered;
  }, [activities, searchQuery, statusFilter, dayFilter]);

  // Group filtered activities
  const groups = useMemo(() => {
    return groupActivities(filteredActivities, groupMode);
  }, [filteredActivities, groupMode]);

  const selectedActivity = activities.find((a) => a.id === selectedActivityId) || null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div
        className={`mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 ${selectedIds.size > 0 ? 'pb-24' : ''}`}
      >
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Manager Approvals
            </h1>
            <Link
              href="/manager/real-data"
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              נתונים אמיתיים
            </Link>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review and approve worker activities
          </p>
        </div>

        {/* Controls: Filters and Group By */}
        <div className="mb-6 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            {/* Search Filter */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search by worker, plot, or activity..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="ALL">All Status</option>
              <option value="NEW">New</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
            </select>

            {/* Day Filter */}
            <input
              type="date"
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            />
            {dayFilter && (
              <button
                onClick={() => setDayFilter('')}
                className="rounded-md bg-gray-200 px-3 py-2 text-sm text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              >
                Clear Date
              </button>
            )}
          </div>

          {/* Group By Control */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Group by:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setGroupMode('date')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  groupMode === 'date'
                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Date
              </button>
              <button
                onClick={() => setGroupMode('plot')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  groupMode === 'plot'
                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Plot
              </button>
              <button
                onClick={() => setGroupMode('worker')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  groupMode === 'worker'
                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Worker
              </button>
              <button
                onClick={() => setGroupMode('none')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  groupMode === 'none'
                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Ungroup
              </button>
            </div>
          </div>
        </div>

        {/* Render Groups */}
        {isLoading ? (
          isMobile ? (
            <ApprovalsCard
              activities={[]}
              isLoading={true}
              error={null}
              onDetails={handleDetails}
            />
          ) : (
            <ApprovalsTable
              activities={[]}
              isLoading={true}
              error={null}
              onDetails={handleDetails}
            />
          )
        ) : error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        ) : (
          <GroupedApprovals
            groups={groups}
            isMobile={isMobile}
            onDetails={handleDetails}
            selectedIds={selectedIds}
            onSelectionChange={toggleSelection}
            onSelectAllInGroup={selectAllInGroup}
          />
        )}
      </div>

      {/* Floating Action Bar when one or more activities are selected */}
      {selectedIds.size > 0 && (
        <div
          className="fixed bottom-0 left-0 right-0 z-20 flex flex-wrap items-center justify-center gap-4 border-t border-gray-200 bg-green-50 px-4 py-3 shadow-xl dark:border-gray-700 dark:bg-green-900/20 sm:justify-center sm:px-6"
          role="region"
          aria-label="Bulk actions"
        >
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedIds.size} {selectedIds.size === 1 ? 'activity' : 'activities'} selected
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={bulkActivityType}
              onChange={(e) => setBulkActivityType(e.target.value)}
              className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              aria-label="Activity type for bulk approve"
            >
              <option value="">Select activity type</option>
              {ACTIVITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleBulkApprove}
              disabled={!bulkActivityType.trim()}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Bulk Approve
            </button>
            <button
              type="button"
              onClick={clearSelection}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <DetailsDrawer
        activity={selectedActivity}
        isOpen={selectedActivityId !== null}
        onClose={handleCloseDrawer}
        onApprove={handleApprove}
      />

      <Toast
        message="Approved (mock)"
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}
