'use client';

interface ActionButtonsProps {
  onApprove?: () => void;
  onDetails?: () => void;
}

export function ActionButtons({ onApprove, onDetails }: ActionButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      {onDetails && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDetails();
          }}
          className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          Details
        </button>
      )}
      {onApprove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onApprove();
          }}
          className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:bg-green-700 dark:hover:bg-green-600"
        >
          Approve
        </button>
      )}
    </div>
  );
}
