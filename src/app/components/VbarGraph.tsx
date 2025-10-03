import React from 'react';
import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const VbarGraph = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        width={500}
        height={300}
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="core" fill="#8884d8" activeBar={<Rectangle fill="pink" stroke="blue" />} />
        <Bar dataKey="it" fill="#82ca9d" activeBar={<Rectangle fill="gold" stroke="purple" />} />
        <Bar dataKey="management" fill="#ffc658" activeBar={<Rectangle fill="lightblue" stroke="black" />} />
        <Bar dataKey="others" fill="#d0ed57" activeBar={<Rectangle fill="lightgreen" stroke="red" />} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default VbarGraph;