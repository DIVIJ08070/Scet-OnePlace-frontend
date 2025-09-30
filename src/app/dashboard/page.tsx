'use client';
import React from 'react';
import BarGraph from '../components/bargraph';
import VbarGraph from '../components/VbarGraph';

const DashBoard = () => {
  return (
    <div className="min-h-screen w-full bg-white bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.60)_0,rgba(0,163,255,0.1)_50%,rgba(0,163,255,0)_100%)] mt-10 px-4 py-10 md:px-12 font-inter">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-800 mb-8 text-center">
          Welcome XYZ
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Student Placed */}
          <div className="bg-blue-100 p-6 rounded-3xl shadow-2xl border-b-4 border-blue-600 overflow-hidden min-h-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Student Placed</h2>
              <div className="flex gap-2">
                <select className="text-sm px-3 py-1 rounded-full bg-white font-semibold shadow-sm border border-gray-300">
                  <option>Dept</option>
                  <option>Computer Engineering</option>
                  <option>Information Technology</option>
                  <option>Electronics Engineering</option>
                  <option>Electrical Engineering</option>
                  <option>Mechanical Engineering</option>
                  <option>Civil Engineering</option>
                </select>
                <select className="text-sm px-3 py-1 rounded-full bg-white font-semibold shadow-sm border border-gray-300 overflow-hidden">
                  <option>Year</option>
                  {Array.from({ length: new Date().getFullYear() - 1994 }, (_, i) => {
                    const year = 1995 + i;
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>
            <div className="h-[320px] flex items-center justify-center text-gray-500">
              Data here
            </div>
          </div>

          {/* Highest Package */}
          <div className="bg-blue-100 p-6 rounded-3xl shadow-2xl border-b-4 border-blue-600 min-h-[400px]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Highest Package</h2>
            <div className="h-[320px] flex items-center justify-center">
              <BarGraph />
            </div>
          </div>

          {/* Core/Others */}
          <div className="bg-blue-100 p-6 rounded-3xl shadow-2xl border-b-4 border-blue-600 min-h-[400px]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Core, Others</h2>
            <div className="h-[320px] flex items-center justify-center text-gray-500">
              <VbarGraph/>
            </div>
          </div>

          {/* Average Package */}
          <div className="bg-blue-100 p-6 rounded-3xl shadow-2xl border-b-4 border-blue-600 min-h-[400px]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Average Package</h2>
            <div className="h-[320px] flex items-center justify-center">
                <BarGraph />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;