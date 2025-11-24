
import React from 'react';
import type { Summary } from '@/app/page';

type SummaryStatsProps = {
  totalCount: number;
  filteredCount: number;
  summary: Summary;
};

const SummaryStats: React.FC<SummaryStatsProps> = ({ totalCount, filteredCount, summary }) => {
  const fmt = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  
  return (
    <div className="flex flex-col gap-4 w-full mt-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="stat bg-base-200/50 rounded-lg p-3 border border-base-content/5">
          <div className="stat-title text-xs uppercase font-bold opacity-60">Total Rows</div>
          <div className="stat-value text-primary text-xl">{totalCount}</div>
        </div>
        <div className="stat bg-base-200/50 rounded-lg p-3 border border-base-content/5">
          <div className="stat-title text-xs uppercase font-bold opacity-60">Filtered Rows</div>
          <div className="stat-value text-secondary text-xl">{filteredCount}</div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="stat bg-base-200/50 rounded-lg p-3 border border-base-content/5">
          <div className="stat-title text-xs uppercase font-bold opacity-60 text-success">Total In (Cash In)</div>
          <div className="stat-value text-success text-xl">{fmt(summary.totalIn)}</div>
        </div>
        <div className="stat bg-base-200/50 rounded-lg p-3 border border-base-content/5">
          <div className="stat-title text-xs uppercase font-bold opacity-60 text-base-content">Total Out (Cash Out)</div>
          <div className="stat-value text-base-content text-xl">{fmt(summary.totalOut)}</div>
        </div>
        <div className="stat bg-base-200/50 rounded-lg p-3 border border-base-content/5">
          <div className="stat-title text-xs uppercase font-bold opacity-60 text-error">Total Charge</div>
          <div className="stat-value text-error text-xl">{fmt(summary.totalCharge)}</div>
        </div>
      </div>
    </div>
  );
};

export default SummaryStats;
