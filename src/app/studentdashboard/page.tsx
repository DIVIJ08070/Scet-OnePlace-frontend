'use client';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar'; // ✅ import calendar
import 'react-calendar/dist/Calendar.css'; // ✅ calendar styles
import API, { setAxiosToken } from '../components/libs/axios';

interface Offer {
  _id: string;
  company: { name: string; logo: string; link: string; description: string; contact: string };
  role: string;
  location: { city: string; state: string; country: string };
  total_opening: number;
  drive: string;
  type: string;
  sector: string;
  salary: { min: number; max: number };
  criteria: { min_result: number; max_backlog: number; passout_year: number[]; branch: string[] };
}

interface StudentProfile {
  _id: string;
  name: string;
  enrollment_no: string;
  applied: string[];
}

const DashboardPage: React.FC = () => {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [date, setDate] = useState<Date>(new Date()); // ✅ state for calendar

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) setAxiosToken(token);

    const fetchStudent = async () => {
      try {
        const res = await API.get('/api/v1/me');
        const user: StudentProfile = res.data.data.user;
        setStudent(user);

        if (user.applied?.length) {
          const fetchedOffers: Offer[] = [];
          for (const id of user.applied) {
            const offerRes = await API.get(`/api/v1/offer/${id}`);
            fetchedOffers.push(offerRes.data.data.offer);
          }
          setOffers(fetchedOffers);
        }
      } catch (err) {
        console.error('Error fetching dashboard:', err);
      }
    };

    fetchStudent();
  }, []);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen p-6 mt-10 md:p-10 text-white flex flex-col gap-8 ">
      {/* Full Width Header */}
      <section className="rounded-xl bg-blue-700 bg-opacity-80 p-7 md:p-8 shadow-lg">
        <h1 className="text-4xl font-bold">👋 Welcome, {student?.name || 'Student'}!</h1>
        <p className="mt-3 text-base sm:text-lg">Final Year | Computer Science | SCET</p>
        <p className="text-sm sm:text-base text-black">
          Enrollment: {student?.enrollment_no}
        </p>
      </section>

      {/* Main Content Full Height */}
      <div className="flex flex-1 flex-col md:flex-row gap-8 h-[calc(100vh-200px)]">
        {/* Left Column: Applied Offers */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 bg-blue-700/30 backdrop-blur-sm p-6 rounded-xl shadow flex flex-col">
            <h2 className="text-2xl font-semibold mb-4">🎯 Applied Offers</h2>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {offers.length > 0 ? (
                offers.map((offer) => (
                  <div
                    key={offer._id}
                    onClick={() => toggleExpand(offer._id)}
                    className="cursor-pointer border border-blue-500/40 rounded-xl p-4 bg-blue-700/20"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold">{offer.company.name}</h3>
                      <p className="text-sm">{offer.role}</p>
                      <p className="text-sm text-gray-200">
                        {offer.location.city}, {offer.location.state}
                      </p>
                    </div>

                    <AnimatePresence>
                      {expanded === offer._id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 text-sm space-y-2"
                        >
                          <p>
                            <strong>Drive:</strong> {offer.drive} | <strong>Type:</strong> {offer.type} |{' '}
                            <strong>Sector:</strong> {offer.sector}
                          </p>
                          <p>
                            <strong>Total Openings:</strong> {offer.total_opening}
                          </p>
                          <p>
                            <strong>Salary:</strong> ₹{offer.salary.min} - ₹{offer.salary.max}
                          </p>
                          <p>
                            <strong>Criteria:</strong> Min CGPA {offer.criteria.min_result}, Max Backlogs{' '}
                            {offer.criteria.max_backlog}
                          </p>
                          <p>
                            <strong>Branches:</strong> {offer.criteria.branch.join(', ')}
                          </p>
                          <p>
                            <strong>Passout Year:</strong> {offer.criteria.passout_year.join(', ')}
                          </p>
                          <p>
                            <strong>Description:</strong> {offer.company.description}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))
              ) : (
                <p>No applied offers yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Notifications + Schedule */}
        <div className="w-full md:w-80 flex flex-col gap-6 overflow-y-auto">
          {/* Notifications */}
          <div className="bg-blue-700/30 backdrop-blur-sm p-6 rounded-xl shadow flex flex-col gap-3">
            <h2 className="text-2xl font-semibold">🔔 Notifications</h2>
            <p>No new notifications</p>
          </div>

          {/* Schedule with Calendar */}
          <div className="bg-blue-700/30 backdrop-blur-sm p-6 rounded-xl shadow flex flex-col gap-3">
            <h2 className="text-2xl font-semibold">📅 Schedule</h2>
            <Calendar
              onChange={setDate}
              value={date}
              className="rounded-xl text-black bg-white p-2"
            />
            <p className="text-sm mt-2">
              Selected Date: <span className="font-semibold">{date.toDateString()}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;