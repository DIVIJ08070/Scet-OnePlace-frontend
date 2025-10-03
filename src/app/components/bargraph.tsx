'use client';
import React from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Interface for the data points in the chart
interface BarGraphData {
  name: string;
  pv?: number; // 'pv' is the key for the bar value
}

// Interface for the component's props
interface BarGraphProps {
  data: BarGraphData[];
}

const BarGraph: React.FC<BarGraphProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <ComposedChart
        layout="vertical"
        data={data}
        margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
      >
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis type="number" />
        <YAxis dataKey="name" type="category" scale="band" />
        <Tooltip />
        <Legend />
        <Bar dataKey="pv" barSize={20} fill="#413ea0" />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default BarGraph;
