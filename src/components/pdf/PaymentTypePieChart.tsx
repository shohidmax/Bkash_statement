
'use client';

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PaymentTypeSummaryData } from '@/app/page';

type PaymentTypePieChartProps = {
  data: PaymentTypeSummaryData[];
};

const COLORS = [
    '#e2136e', '#37cdbe', '#fbbd23', '#3abff8', '#36d399', 
    '#f87272', '#a991f7', '#f000b8', '#6be5d3', '#f4c56a'
];

const PaymentTypePieChart: React.FC<PaymentTypePieChartProps> = ({ data }) => {
  if (data.length === 0) {
    return null;
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      const percent = payload[0].payload.percent;
      return (
        <div className="bg-base-100 p-3 border border-base-content/20 rounded-lg shadow-lg text-sm">
          <p className="font-bold">{`${name}`}</p>
          <p className="text-primary">{`Amount: ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</p>
          <p className="text-base-content/70">{`Percentage: ${(percent * 100).toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="card bg-base-200/50 shadow-inner border border-base-content/5">
        <div className="card-body">
            <h3 className="card-title text-base-content/80">Spending by Type</h3>
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                    >
                        {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend iconSize={10} wrapperStyle={{fontSize: '12px'}}/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
      </div>
    </div>
  );
};

export default PaymentTypePieChart;
