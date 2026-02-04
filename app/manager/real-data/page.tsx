'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/app/lib/supabase';
import { RealDataRow } from '../approvals/types';

export default function RealDataPage() {
  const [data, setData] = useState<RealDataRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configMissing, setConfigMissing] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError(null);
    setConfigMissing(false);
    if (!supabase) {
      setConfigMissing(true);
      setIsLoading(false);
      return;
    }
    void Promise.resolve(supabase.rpc('get_worker_plot_segments'))
      .then(({ data: rows, error: rpcError }) => {
        if (cancelled) return;
        if (rpcError) {
          setError(rpcError.message);
          setData([]);
          return;
        }
        setData((rows ?? []) as RealDataRow[]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Link
            href="/manager/approvals"
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Back to Approvals
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Real Data
          </h1>
          {!configMissing && (
            <span className="text-xs text-gray-400 dark:text-gray-500">Supabase: configured</span>
          )}
        </div>

        {error && (
          <div className="mb-6">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/20">
              <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Check that your Supabase project has a function named <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">get_worker_plot_segments</code> and that <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> match that project.
            </p>
          </div>
        )}

        {configMissing && (
          <div className="mb-6 rounded-lg border border-gray-200 bg-white py-12 px-6 dark:border-gray-700 dark:bg-gray-900">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">To load real data, set the env vars. If you already did and still see this, check:</p>
            <ul className="text-sm text-gray-500 dark:text-gray-400 list-disc list-inside space-y-2 max-w-xl mx-auto text-left">
              <li><strong>Restart the dev server</strong> – Next.js reads .env only at start. Stop with Ctrl+C, then run <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">npm run dev</code> again.</li>
              <li><strong>File and location</strong> – Use a file named exactly <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">.env</code> or <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">.env.local</code> in the <strong>project root</strong> (same folder as <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">package.json</code>).</li>
              <li><strong>Variable names</strong> – Exactly <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>, with no spaces around <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">=</code>.</li>
            </ul>
          </div>
        )}

        {!error && !configMissing && isLoading && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  {[...Array(6)].map((_, i) => (
                    <th
                      key={i}
                      className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
                    >
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-600" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {[...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!error && !configMissing && !isLoading && data.length === 0 && (
          <div className="rounded-lg border border-gray-200 bg-white py-12 text-center dark:border-gray-700 dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No data available
            </p>
          </div>
        )}

        {!error && !configMissing && !isLoading && data.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Plot
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Worker
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Enter
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Exit
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                {data.map((row, i) => (
                  <tr
                    key={i}
                    className="border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {row.date}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {row.plot}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-100">
                      {row.worker}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {row.duration ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {row.enter_plot}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {row.exit_plot ?? '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
