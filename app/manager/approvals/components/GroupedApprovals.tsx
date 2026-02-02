'use client';

import { useState, useMemo, useEffect } from 'react';
import { ActivityGroup } from '../grouping';
import { ApprovalsTable } from './ApprovalsTable';
import { ApprovalsCard } from './ApprovalsCard';
import { formatDate } from '../utils';

interface GroupedApprovalsProps {
  groups: ActivityGroup[];
  isMobile: boolean;
  onDetails?: (id: string) => void;
  selectedIds?: Set<string>;
  onSelectionChange?: (id: string) => void;
  onSelectAllInGroup?: (ids: string[], checked: boolean) => void;
}

export function GroupedApprovals({
  groups,
  isMobile,
  onDetails,
  selectedIds = new Set(),
  onSelectionChange,
  onSelectAllInGroup,
}: GroupedApprovalsProps) {
  // Track which groups are expanded (default: all expanded)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    return new Set(groups.map((g) => g.key));
  });

  // Update expanded groups when groups change (e.g., after filtering)
  // Only add new groups to expanded set, and remove keys that no longer exist
  // This preserves collapse state for groups that remain after filtering
  useEffect(() => {
    const groupKeys = new Set(groups.map((g) => g.key));
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      // Add new groups (they start expanded by default)
      groupKeys.forEach((key) => {
        if (!next.has(key)) {
          next.add(key);
        }
      });
      // Remove keys that no longer exist in groups
      prev.forEach((key) => {
        if (!groupKeys.has(key)) {
          next.delete(key);
        }
      });
      return next;
    });
  }, [groups]);

  // Toggle a single group
  const toggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

  // Expand all groups
  const expandAll = () => {
    setExpandedGroups(new Set(groups.map((g) => g.key)));
  };

  // Collapse all groups
  const collapseAll = () => {
    setExpandedGroups(new Set());
  };

  // Check if all groups are expanded
  const allExpanded = useMemo(() => {
    return groups.length > 0 && expandedGroups.size === groups.length;
  }, [groups.length, expandedGroups.size]);

  // Check if all groups are collapsed
  const allCollapsed = useMemo(() => {
    return expandedGroups.size === 0;
  }, [expandedGroups.size]);

  if (groups.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">No activities found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Expand/Collapse All Controls */}
      <div className="flex justify-end gap-2">
        <button
          onClick={expandAll}
          disabled={allExpanded}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Expand all
        </button>
        <button
          onClick={collapseAll}
          disabled={allCollapsed}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Collapse all
        </button>
      </div>

      {/* Groups */}
      <div className="space-y-4">
        {groups.map((group) => {
          const isExpanded = expandedGroups.has(group.key);

          return (
            <div
              key={group.key}
              className="rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              {/* Group Header */}
              <button
                onClick={() => toggleGroup(group.key)}
                aria-expanded={isExpanded}
                aria-controls={`group-content-${group.key}`}
                className="w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {/* Caret Icon */}
                    <svg
                      className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <div className="flex flex-col">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {group.title}
                      </h2>
                      {/* Date Sublabel for day groups */}
                      {group.date && (
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(`${group.date}T00:00:00`)}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* Counts */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>Total: {group.counts.total}</span>
                    {group.counts.pending > 0 && (
                      <span className="text-yellow-600 dark:text-yellow-400">
                        Pending: {group.counts.pending}
                      </span>
                    )}
                    {group.counts.approved > 0 && (
                      <span className="text-green-600 dark:text-green-400">
                        Approved: {group.counts.approved}
                      </span>
                    )}
                  </div>
                </div>
              </button>

              {/* Group Content */}
              {isExpanded && (
                <div
                  id={`group-content-${group.key}`}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-4">
                    {isMobile ? (
                      <ApprovalsCard
                        activities={group.items}
                        isLoading={false}
                        error={null}
                        onDetails={onDetails}
                        selectedIds={selectedIds}
                        onSelectionChange={onSelectionChange}
                        onSelectAll={
                          onSelectAllInGroup
                            ? (checked) => onSelectAllInGroup(group.items.map((a) => a.id), checked)
                            : undefined
                        }
                      />
                    ) : (
                      <ApprovalsTable
                        activities={group.items}
                        isLoading={false}
                        error={null}
                        onDetails={onDetails}
                        selectedIds={selectedIds}
                        onSelectionChange={onSelectionChange}
                        onSelectAll={
                          onSelectAllInGroup
                            ? (checked) => onSelectAllInGroup(group.items.map((a) => a.id), checked)
                            : undefined
                        }
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
