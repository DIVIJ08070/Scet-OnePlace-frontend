'use client';
import React, { JSX } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

// --- TypeScript Interfaces for Type Safety ---

// Describes a single colored segment of the gauge
interface ChartSegment {
  name: string;
  value: number;
  color: string;
  // Adding an index signature to satisfy Recharts' generic data prop type
  [key: string]: any;
}

// Props for the custom needle element
interface NeedleProps {
  value: number;
  data: ChartSegment[];
  cx: number;
  cy: number;
  iR: number;
  oR: number;
  color: string;
}

// Props for the main GaugeChart component
interface GaugeChartProps {
  data: ChartSegment[];
  value: number;
}

const RADIAN = Math.PI / 180;

// Helper function to render the needle on the chart
const needle = ({ value, data, cx, cy, iR, oR, color }: NeedleProps): JSX.Element[] => {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);
  
  if (total === 0) {
    return []; 
  }

  const clampedValue = Math.max(0, Math.min(value, total));
  const ang = 180.0 * (1 - clampedValue / total);
  const length = (iR + 2 * oR) / 3;
  const sin = Math.sin(-RADIAN * ang);
  const cos = Math.cos(-RADIAN * ang);
  const r = 5;
  const x0 = cx;
  const y0 = cy;
  const xba = x0 + r * sin;
  const yba = y0 - r * cos;
  const xbb = x0 - r * sin;
  const ybb = y0 + r * cos;
  const xp = x0 + length * cos;
  const yp = y0 + length * sin;

  return [
    <circle key="needle-circle" cx={x0} cy={y0} r={r} fill={color} stroke="none" />,
    <path
      key="needle-path"
      d={`M${xba} ${yba}L${xbb} ${ybb} L${xp} ${yp} L${xba} ${yba}`}
      stroke="none"
      fill={color}
    />,
  ];
};

const GaugeChart: React.FC<GaugeChartProps> = ({ data, value }) => {
  const cx = 150;
  const cy = 150;
  const iR = 70;
  const oR = 110;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          dataKey="value"
          startAngle={180}
          endAngle={0}
          data={data}
          cx={cx}
          cy={cy}
          innerRadius={iR}
          outerRadius={oR}
          fill="#8884d8"
          stroke="none"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        {needle({ value, data, cx, cy, iR, oR, color: '#4a5568' })}
        <text
            x={cx}
            y={cy + 50}
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-5xl font-bold fill-current text-gray-700"
        >
            {value}
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default GaugeChart;

