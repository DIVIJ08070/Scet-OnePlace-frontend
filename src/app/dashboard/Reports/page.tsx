'use client';
import React, { useState, ChangeEvent, FormEvent } from 'react';
import * as XLSX from 'xlsx';

// Define interfaces for type safety
interface Filters {
  onAccount: string;
  placed: boolean;
  intrested: boolean;
  male: boolean;
  female: boolean;
  batch: string;
  dept: string;
  salaryOperator: string;
  salaryAmount: string;
  groupBy: 'company'; // GroupBy is now fixed to 'company'
}

interface Student {
  enrollment_no: string;
  name: string;
  gender: string;
  cast: string;
  sector: string;
  salary: number;
}

type ReportData = Record<string, Student[]>;


// This is your main component for the reports page.
const ReportsPage = () => {
  // State for managing filter inputs
  const [filters, setFilters] = useState<Filters>({
    onAccount: '',
    placed: false,
    intrested: false,
    male: false,
    female: false,
    batch: '',
    dept: '',
    salaryOperator: '>', // Default to greater than
    salaryAmount: '0',  // Default to 0
    groupBy: 'company', // Default grouping is fixed
  });

  // State for storing the fetched report data and UI status
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handles changes in form inputs
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Submits the filter data to the backend API
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setReportData(null);

    try {
      const response = await fetch('https://scettnp-backend.onrender.com/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const data: ReportData = await response.json();
      setReportData(data);
    } catch (err: unknown) {
        if(err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred");
        }
    } finally {
      setLoading(false);
    }
  };

  // Exports the current report data to an Excel file
  const exportToExcel = () => {
    if (!reportData) return;

    const studentsToExport: object[] = [];
    Object.entries(reportData).forEach(([groupName, groupStudents]) => {
      if (Array.isArray(groupStudents)) {
        groupStudents.forEach((student) => {
          studentsToExport.push({
            'Company': groupName,
            EnrollmentNo: student.enrollment_no,
            Name: student.name,
            Gender: student.gender,
            Cast: student.cast,
            Sector: student.sector,
            Salary: student.salary,
          });
        });
      }
    });

    const ws = XLSX.utils.json_to_sheet(studentsToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, 'PlacementReport.xlsx');
  };

  return (
      <div className="container mx-auto mt-19">
        <div className="headerandmain">
          <h1 className="text-3xl md:text-4xl font-extrabold text-blue-800 my-8  text-center">
            Generate Reports
          </h1>
          <div className="w-full max-w-6xl mx-auto bg-blue-50 my-4 rounded-2xl p-3 shadow-md">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 items-end gap-6">
                <label className="flex flex-col gap-2 font-medium text-gray-700">
                  On Account:
                  <select name="onAccount" value={filters.onAccount} onChange={handleChange} className="p-2.5 rounded-lg border border-gray-300 text-base">
                    <option value="">Select</option>
                    <option value="student">Student</option>
                    <option value="company">Company</option>
                  </select>
                </label>
                <label className="flex flex-row items-center gap-2 cursor-pointer font-medium text-gray-700">
                  <input type="checkbox" name="placed" checked={filters.placed} onChange={handleChange} className="h-4 w-4 accent-blue-600" />
                  Placed
                </label>
                <label className="flex flex-row items-center gap-2 cursor-pointer font-medium text-gray-700">
                  <input type="checkbox" name="intrested" checked={filters.intrested} onChange={handleChange} className="h-4 w-4 accent-blue-600" />
                  Interested
                </label>
                <label className="flex flex-row items-center gap-2 cursor-pointer font-medium text-gray-700">
                  <input type="checkbox" name="male" checked={filters.male} onChange={handleChange} className="h-4 w-4 accent-blue-600" />
                  Male
                </label>
                <label className="flex flex-row items-center gap-2 cursor-pointer font-medium text-gray-700">
                  <input type="checkbox" name="female" checked={filters.female} onChange={handleChange} className="h-4 w-4 accent-blue-600" />
                  Female
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 items-end gap-6">
                <label className="flex flex-col gap-2 font-medium text-gray-700">
                  Department:
                  <select name="dept" value={filters.dept} onChange={handleChange} className="p-2.5 rounded-lg border border-gray-300 text-base">
                    <option value="">All</option>
                    <option value="CO">Computer</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                    <option value="ME">Mechanical</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 font-medium text-gray-700">
                  Batch:
                  <select name="batch" value={filters.batch} onChange={handleChange} className="p-2.5 rounded-lg border border-gray-300 text-base">
                    <option value="">All</option>
                    <option value="2022">2022</option>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                  </select>
                </label>
                <label className="flex flex-col gap-2 font-medium text-gray-700">
                    Salary:
                    <div className="flex gap-2">
                        <select name="salaryOperator" value={filters.salaryOperator} onChange={handleChange} className="p-2.5 rounded-lg border border-gray-300 text-base">
                        <option value="">Op</option>
                        <option value="=">=</option>
                        <option value="<">{'<'}</option>
                        <option value=">">{'>'}</option>
                        </select>
                        <input type="number" name="salaryAmount" value={filters.salaryAmount} onChange={handleChange} placeholder="Amount" className="p-2.5 rounded-lg border border-gray-300 text-base w-full" />
                    </div>
                </label>
              </div>

              <div className="flex justify-end items-end gap-6 flex-wrap">
                <button type="submit" disabled={loading} className="py-3 px-6 border-none bg-blue-600 text-white rounded-lg cursor-pointer text-base font-bold transition-colors hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed">
                  {loading ? 'Generating...' : 'Generate Report'}
                </button>
              </div>
            </form>

            {loading && <p className="text-center p-4 mt-4 font-medium">Loading report...</p>}
            {error && <p className="text-center p-4 mt-4 font-medium text-red-700 bg-red-100 border border-red-200 rounded-lg">Error: {error}</p>}

            {reportData && (
              <div className="mt-8 overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">Report Results</h2>
                    {Object.keys(reportData).length > 0 && (
                        <button onClick={exportToExcel} className="py-2 px-4 border-none bg-green-600 text-white rounded-lg cursor-pointer font-bold transition-colors hover:bg-green-700">
                            Export to Excel
                        </button>
                    )}
                </div>
                <table className="w-full border-collapse mt-4">
                  <thead>
                    <tr>
                      <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-gray-600 capitalize">Company</th>
                      <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-gray-600 capitalize">Enrollment No</th>
                      <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-gray-600 capitalize">Name</th>
                      <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-gray-600 capitalize">Gender</th>
                      <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-gray-600 capitalize">Cast</th>
                      <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-gray-600 capitalize">Sector</th>
                      <th className="p-3 text-left border-b border-gray-200 bg-gray-100 font-semibold text-gray-600 capitalize">Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(reportData).length > 0 ? (
                      Object.entries(reportData).map(([groupName, students]) => {
                        if (!Array.isArray(students) || students.length === 0) {
                          return null;
                        }
                        return students.map((student, index) => (
                          <tr key={`${groupName}-${student.enrollment_no}`} className="even:bg-gray-50 hover:bg-gray-100">
                            {index === 0 && <td rowSpan={students.length} className="p-3 text-left border-b border-gray-200 align-top">{groupName}</td>}
                            <td className="p-3 text-left border-b border-gray-200">{student.enrollment_no}</td>
                            <td className="p-3 text-left border-b border-gray-200">{student.name}</td>
                            <td className="p-3 text-left border-b border-gray-200">{student.gender}</td>
                            <td className="p-3 text-left border-b border-gray-200">{student.cast}</td>
                            <td className="p-3 text-left border-b border-gray-200">{student.sector}</td>
                            <td className="p-3 text-left border-b border-gray-200">{student.salary}</td>
                          </tr>
                        ));
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="text-center p-4">No data found for the selected filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
  );
};

export default ReportsPage;

