
import React from 'react';
import type { Transaction } from '@/app/page';

type ResultsTableProps = {
  data: Transaction[];
  showToast: (message: string) => void;
};

const ResultsTable: React.FC<ResultsTableProps> = ({ data, showToast }) => {
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('TRX ID copied to clipboard!');
  };

  return (
    <div className="border border-base-content/10 rounded-xl overflow-hidden mt-4 bg-base-100 shadow-inner">
      <div className="overflow-x-auto h-[500px]">
        <table className="table table-sm table-zebra table-pin-rows w-full">
          <thead>
            <tr className="bg-base-200 text-base-content font-bold">
              <th className="w-24">Date</th>
              <th className="w-32">Type</th>
              <th>Details</th>
              <th className="w-32">TRX ID</th>
              <th className="text-right w-24">Out</th>
              <th className="text-right w-24">In</th>
              <th className="text-right w-24">Charge</th>
              <th className="text-right w-28">Balance</th>
            </tr>
          </thead>
          <tbody className="text-xs md:text-sm font-mono">
            {data.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8 text-base-content/50">
                  No matching records.
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={`${row.trxId}-${index}`} className="hover group">
                  <td className="whitespace-nowrap opacity-80">{row.date}</td>
                  <td className="text-primary font-medium">{row.type}</td>
                  <td className="min-w-[200px] opacity-90">{row.details}</td>
                  <td>
                    {row.trxId && (
                      <span 
                        className="cursor-pointer hover:text-primary font-bold tooltip tooltip-right"
                        data-tip="Click to copy"
                        onClick={() => handleCopy(row.trxId)}
                      >
                        {row.trxId}
                      </span>
                    )}
                  </td>
                  <td className="text-right text-base-content">{row.out}</td>
                  <td className="text-right text-success">{row.in}</td>
                  <td className="text-right text-error">{row.charge}</td>
                  <td className="text-right font-bold">{row.balance}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultsTable;
