
'use client';

import React from 'react';
import { PaymentTypeSummaryData } from '@/app/page';

type PaymentTypeSummaryProps = {
  data: PaymentTypeSummaryData[];
};

const PaymentTypeSummary: React.FC<PaymentTypeSummaryProps> = ({ data }) => {
    if (data.length === 0) {
        return null;
    }
    const fmt = (num: number) => num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    return (
        <div className="card bg-base-200/50 shadow-inner border border-base-content/5">
            <div className="card-body">
                 <h3 className="card-title text-base-content/80">Payment Type Summary</h3>
                <div className="overflow-x-auto h-[300px]">
                    <table className="table table-sm">
                        <thead>
                            <tr className="text-base-content/80">
                                <th>Type</th>
                                <th className="text-right">Total Spent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(item => (
                                <tr key={item.name} className="hover">
                                    <td className="font-medium text-primary">{item.name}</td>
                                    <td className="text-right font-mono">{fmt(item.value)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PaymentTypeSummary;
