'use client';
import React, { useState, useEffect } from 'react';
import BarGraph from '../components/bargraph';
import VbarGraph from '../components/VbarGraph';

const DashBoard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedDept, setSelectedDept] = useState('');

  // State for formatted chart data
  const [highestPackageData, setHighestPackageData] = useState([]);
  const [averagePackageData, setAveragePackageData] = useState([]);
  const [coreOthersData, setCoreOthersData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true); // Set loading to true when fetching new data
      try {
        const params = new URLSearchParams();
        if (selectedYear) {
          params.append('year', selectedYear);
        }
        if (selectedDept) {
          params.append('dept', selectedDept);
        }
        
        const response = await fetch(`https://scettnp-backend.onrender.com/home?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const jsonData = await response.json();
        setData(jsonData);

        // Format data for Highest Package chart
        const formattedHighest = Object.entries(jsonData.highestPackge).map(([year, details]) => ({
          name: year,
          pv: details.salary,
        }));
        setHighestPackageData(formattedHighest);
        
        // Format data for Average Package chart
        const formattedAverage = Object.entries(jsonData.averagePackge).map(([year, value]) => ({
          name: year,
          pv: value,
        }));
        setAveragePackageData(formattedAverage);

        // Format data for Core/Others chart
        const formattedSector = Object.keys(jsonData.sector.CORE).map(year => ({
            name: year,
            core: jsonData.sector.CORE[year],
            it: jsonData.sector.IT[year],
            management: jsonData.sector.MANAGEMENT[year],
            others: jsonData.sector.OTHER[year],
        }));
        setCoreOthersData(formattedSector);

      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedDept]); // Re-run the effect when year or dept changes

  if (loading) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  if (error) {
    return <div className="text-center mt-20 text-red-500">Error: {error}</div>;
  }

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
                <select 
                  className="text-sm px-3 py-1 rounded-full bg-white font-semibold shadow-sm border border-gray-300"
                  onChange={(e) => setSelectedDept(e.target.value)}
                  value={selectedDept}
                >
                  <option value="">All Depts</option>
                  <option value="Computer Engineering">Computer Engineering</option>
                  <option value="Information Technology">Information Technology</option>
                </select>
                <select 
                  className="text-sm px-3 py-1 rounded-full bg-white font-semibold shadow-sm border border-gray-300 overflow-hidden"
                  onChange={(e) => setSelectedYear(e.target.value)}
                  value={selectedYear}
                >
                  <option value="">All Years</option>
                  {Array.from({ length: new Date().getFullYear() - 2020 }, (_, i) => {
                    const year = 2021 + i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            </div>
            <div className="h-[320px] flex items-center justify-center text-gray-500">
              <p className="text-4xl font-bold">{data.placed} / {data.total}</p>
            </div>
          </div>

          {/* Highest Package */}
          <div className="bg-blue-100 p-6 rounded-3xl shadow-2xl border-b-4 border-blue-600 min-h-[400px]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Highest Package</h2>
            <div className="h-[320px] flex items-center justify-center">
              <BarGraph data={highestPackageData} />
            </div>
          </div>

          {/* Core/Others */}
          <div className="bg-blue-100 p-6 rounded-3xl shadow-2xl border-b-4 border-blue-600 min-h-[400px]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Sector-wise Placements</h2>
            <div className="h-[320px] flex items-center justify-center text-gray-500">
              <VbarGraph data={coreOthersData} />
            </div>
          </div>

          {/* Average Package */}
          <div className="bg-blue-100 p-6 rounded-3xl shadow-2xl border-b-4 border-blue-600 min-h-[400px]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Average Package</h2>
            <div className="h-[320px] flex items-center justify-center">
              <BarGraph data={averagePackageData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashBoard;