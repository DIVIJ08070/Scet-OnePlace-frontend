'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Assuming these components are correctly located and accept a 'data' prop
import BarGraph from '../components/bargraph';
import VbarGraph from '../components/VbarGraph';

// Dynamically import GaugeChart and disable Server-Side Rendering (SSR) for it
const GaugeChart = dynamic(() => import('../components/GaugeChart'), { ssr: false });

// --- TypeScript Interfaces for Type Safety ---

// Describes the structure of the data returned from the API
interface DashboardData {
  total: number;
  intrested: number;
  placed: number;
  highestPackge: { [year: string]: { salary: number; company: string } };
  averagePackge: { [year: string]: number };
  sector: {
    CORE: { [year: string]: number };
    IT: { [year: string]: number };
    MANAGEMENT: { [year: string]: number };
    OTHER: { [year: string]: number };
  };
}

// Describes the data format required by the chart components
interface ChartData {
  name: string;
  [key: string]: any;
}

// Describes the data format for the GaugeChart
interface GaugeSegment {
    name: string;
    value: number;
    color: string;
}

const DashBoard = () => {
  // --- State Management with Types ---
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('');

  // State for formatted chart data
  const [highestPackageData, setHighestPackageData] = useState<ChartData[]>([]);
  const [averagePackageData, setAveragePackageData] = useState<ChartData[]>([]);
  const [coreOthersData, setCoreOthersData] = useState<ChartData[]>([]);
  const [placementGaugeData, setPlacementGaugeData] = useState<GaugeSegment[]>([]);
  const [interestedGaugeData, setInterestedGaugeData] = useState<GaugeSegment[]>([]);


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (selectedYear) params.append('year', selectedYear);
        if (selectedDept) params.append('dept', selectedDept);
        
        const response = await fetch(`https://scettnp-backend.onrender.com/home?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const jsonData: DashboardData = await response.json();
        setData(jsonData);

        // --- Data Transformation ---
        
        const formattedHighest = Object.entries(jsonData.highestPackge).map(([year, details]) => ({
          name: year,
          pv: details.salary,
        }));
        setHighestPackageData(formattedHighest);
        
        const formattedAverage = Object.entries(jsonData.averagePackge).map(([year, value]) => ({
          name: year,
          pv: value,
        }));
        setAveragePackageData(formattedAverage);

        const formattedSector = Object.keys(jsonData.sector.CORE).map(year => ({
            name: year,
            core: jsonData.sector.CORE[year],
            it: jsonData.sector.IT[year],
            management: jsonData.sector.MANAGEMENT[year],
            others: jsonData.sector.OTHER[year],
        }));
        setCoreOthersData(formattedSector);

        // Format data for the "Placed" GaugeChart
        if (jsonData.intrested > 0) {
            const placedData = [
                { name: 'Placed', value: jsonData.placed, color: '#34d399' }, // Green
                { name: 'Not Placed', value: jsonData.intrested - jsonData.placed, color: '#f87171' }, // Red
            ];
            setPlacementGaugeData(placedData);
        }

        // Format data for the "Interested" GaugeChart
        if (jsonData.total > 0) {
            const interestedData = [
                { name: 'Interested', value: jsonData.intrested, color: '#60a5fa' }, // Blue
                { name: 'Not Interested', value: jsonData.total - jsonData.intrested, color: '#9ca3af' }, // Gray
            ];
            setInterestedGaugeData(interestedData);
        }


      } catch (e: unknown) {
        if (e instanceof Error) {
            setError(e.message);
        } else {
            setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear, selectedDept]);

  // --- Render Logic ---

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen text-red-500">Error: {error}</div>;
  }
  
  return (
    <div className="min-h-screen w-full bg-white bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.1)_0,rgba(0,163,255,0.05)_50%,rgba(0,163,255,0)_100%)] mt-10 px-4 py-10 md:px-12 font-inter">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-800 mb-8 text-center">
          Placement Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Student Placed & Interested */}
          <div className="bg-blue-100 p-6 rounded-3xl shadow-2xl border-b-4 border-blue-600 overflow-hidden min-h-[400px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Placement Overview</h2>
              <div className="flex gap-2">
                <select 
                  className="text-sm px-3 py-1 rounded-full bg-white font-semibold shadow-sm border border-gray-300"
                  onChange={(e) => setSelectedDept(e.target.value)}
                  value={selectedDept}
                >
                  <option value="">All Depts</option>
                  <option value="CO">Computer</option>
                  <option value="IT">Information Technology</option>
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
            <div className="h-[320px] flex items-center justify-around text-gray-700">
             {data && (
                <>
                    <div className="flex flex-col items-center w-1/2 h-full">
                        <GaugeChart data={placementGaugeData} value={data.placed} />
                        <p className="text-lg font-bold -mt-20 text-center">{data.placed} / {data.intrested} <br/>Student Placed</p>
                    </div>
                    <div className="flex flex-col items-center w-1/2 h-full">
                        <GaugeChart data={interestedGaugeData} value={data.intrested} />
                        <p className="text-lg font-bold -mt-20 text-center">{data.intrested} / {data.total} <br/>Student Interested</p>
                    </div>
                </>
             )}
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
            <div className="h-[320px] flex items-center justify-center">
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

