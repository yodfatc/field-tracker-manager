'use client';

import { useState, useEffect, useMemo } from 'react';
import { ActivityForApproval } from './types';
import { generateMockActivities } from './mock-data';
import { ApprovalsTable } from './components/ApprovalsTable';
import { ApprovalsCard } from './components/ApprovalsCard';
import { DetailsDrawer } from './components/DetailsDrawer';
import { Toast } from './components/Toast';
import { GroupedApprovals } from './components/GroupedApprovals';
import { GroupMode, groupActivities, getLocalDayKey } from './grouping';

export default function ApprovalsPage() {
  const [activities, setActivities] = useState<ActivityForApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  
  // Grouping mode state
  const [groupMode, setGroupMode] = useState<GroupMode>('day');
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'CHECKED' | 'APPROVED'>('ALL');
  const [dayFilter, setDayFilter] = useState<string>(''); // YYYY-MM-DD format or empty string

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
    // Update the activity status to APPROVED in local state
    setActivities((prevActivities) =>
      prevActivities.map((activity) =>
        activity.id === id
          ? { ...activity, status: 'APPROVED', activityType }
          : activity
      )
    );

    // Show toast notification
    setShowToast(true);
  };

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
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Manager Approvals
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review and approve worker activities
          </p>
        </div>

        {/* Controls: Filters and Group By */}
        <div className="mb-6 space-y-4">
          {/* Group By Control */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Group by:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setGroupMode('day')}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  groupMode === 'day'
                    ? 'bg-blue-600 text-white dark:bg-blue-500'
                    : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                Day
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
            </div>
          </div>

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
              <option value="PENDING">Pending</option>
              <option value="CHECKED">Checked</option>
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
          />
        )}
      </div>

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
