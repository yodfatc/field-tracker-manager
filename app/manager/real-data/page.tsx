'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSupabase } from '@/app/lib/supabase';
import { RealDataRow } from '../approvals/types';

export default function RealDataPage() {
  const [data, setData] = useState<RealDataRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [configMissing, setConfigMissing] = useState(false);
  const [envCheck, setEnvCheck] = useState<{ supabaseUrlSet: boolean; supabaseKeySet: boolean } | null>(null);

  useEffect(() => {
    const supabase = getSupabase();

    if (!supabase) {
      setConfigMissing(true);
      setIsLoading(false);
      return;
    }

    supabase
      .rpc('get_worker_plot_segments')
      .then(({ data, error }) => {
        if (error) {
          setError(error.message);
          setData([]);
        } else {
          setData((data ?? []) as RealDataRow[]);
        }
      })
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!configMissing) return;

    fetch('/api/check-env')
      .then((res) => res.json())
      .then(setEnvCheck)
      .catch(() => setEnvCheck(null));
  }, [configMissing]);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/manager/approvals">Back</Link>
        <h1 className="text-xl font-bold">Real Data</h1>
      </div>

      {configMissing && envCheck && (
        <p className="text-sm text-gray-500">
          Server env check: URL set: {envCheck.supabaseUrlSet ? 'yes' : 'no'}, Key set:{' '}
          {envCheck.supabaseKeySet ? 'yes' : 'no'}
        </p>
      )}

      {error && <p className="text-red-600">{error}</p>}
      {isLoading && <p>Loading…</p>}
      {!isLoading && !error && data.length === 0 && <p>No data</p>}
    </div>
  );
}
