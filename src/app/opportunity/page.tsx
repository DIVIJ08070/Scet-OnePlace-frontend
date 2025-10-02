'use client';

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "../components/hooks/use-outside-click";
import API, { setAxiosToken } from '../components/libs/axios';
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";

// Interfaces
interface Company {
  _id: string;
  name: string;
  logo: string;
  link: string;
  description: string;
  contact: string;
  address: string;
  offers: string[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface Job {
  _id: string;
  company: Company | null;
  role: string;
  location?: {
    address_line: string;
    area: string;
    city: string;
    state: string;
    country: string;
    pincode: number;
  };
  total_opening: number;
  drive: string;
  type: string;
  sector: string;
  salary: {
    min: number;
    max: number;
  };
  criteria?: {
    min_result: number;
    max_backlog: number;
    passout_year: number[];
    branch: string;
  };
  skills: string[];
}

interface Card {
  title: string;
  role: string;
  description: string;
  src: string;
  ctaText: string;
  ctaLink: string;
  job: Job;
}
interface ExpandableCardProps {
  mode?: "apply" | "reports"; // optional, defaults to apply
}

export default function ExpandableCard({ mode = "apply" }: ExpandableCardProps) {
  const [active, setActive] = useState<Card | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);


  const ref = useRef<HTMLDivElement>(null);

  

const handleApply = async (offerId: string) => {
  try {
    const token = localStorage.getItem('accessToken');
    if (token) setAxiosToken(token); // attach token to your axios instance
    console.log('Access Token:', token);

    console.log(`Applying for offer ${offerId}...`);
    const res = await API.post(`/api/v1/student/apply/${offerId}`);

    if (res.status !== 200) throw new Error(res.data.message || 'Failed to apply');

    alert('Applied successfully! 🎉');
    setActive(null); // close modal after success
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Apply error:', message);
    alert(`Error: ${message}`);
  }
};



const handleGenerateReport = async (offerId: string) => {
  try {
    // Attach token
    const token = localStorage.getItem("accessToken");
    if (token) setAxiosToken(token);

    // Fetch report
    const res = await API.get(`/api/v1/report/offer/${offerId}`);
    if (res.status !== 200) throw new Error("Failed to fetch report");

    const applicants = res.data.data.applicants || [];

    // Map students safely
const excelData = applicants
  .map((app: any) => app?.data?.student)
  .filter((student: any) => student)
      .map((student: any) => ({
        Name: student.name,
        Enrollment: student.enrollment_no,
        DOB: student.dob ? new Date(student.dob).toLocaleDateString() : "N/A",
        Email: student.email,
        Contact: student.contact || "N/A",
        Gender: student.gender || "N/A",
        Caste: student.caste || "N/A",
        SSC_Percentage: student.academic_details?.result?.ssc?.percentage || "N/A",
        SSC_Year: student.academic_details?.result?.ssc?.completion_year || "N/A",
        HSC_Percentage: student.academic_details?.result?.hsc?.percentage || "N/A",
        HSC_Year: student.academic_details?.result?.hsc?.completion_year || "N/A",
        Degree_CGPA: student.academic_details?.result?.degree?.cgpa || "N/A",
        Degree_Backlogs: student.academic_details?.result?.degree?.backlogs || "N/A",
        Degree_Completion_Year: student.academic_details?.result?.degree?.completion_year || "N/A",
        Address: student.address
          ? `${student.address.address_line}, ${student.address.area}, ${student.address.city}, ${student.address.state}, ${student.address.country} - ${student.address.pincode}`
          : "N/A",
        Applied_Offers: student.applied?.join(", ") || "N/A",
      }));

    if (excelData.length === 0) {
      alert("No student data available for this offer.");
      return;
    }

    // Create workbook and worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applicants");

    // Convert to blob and download
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, `Offer_${offerId}_Report.xlsx`);

    alert("Report downloaded successfully! 🎉");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Report error:", message);
    alert(`Error: ${message}`);
  }
};


  // Fetch data
  useEffect(() => {
    async function fetchJobs() {
      try {
        setLoading(true);
        const res = await fetch("http://127.0.0.1:5000/api/v1/offer");
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        const data: { success: boolean; data: { offer: Job[] } } = await res.json();
        setJobs(data.success && Array.isArray(data.data.offer) ? data.data.offer : []);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error("Fetch error:", message);
        setError("Failed to load job listings. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  // Escape key & body scroll
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && setActive(null);
    document.body.style.overflow = active ? "hidden" : "auto";
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

const cards: Card[] = [...jobs] // create a copy so original state is not mutated
  .reverse()                     // reverse the order
  .map((job) => ({
    title: job.company?.name || "Unknown Company",
    role: job.role,
    description: `Location: ${job.location?.city || "Unknown"}, Criteria: CGPA > ${
      job.criteria?.min_result || "N/A"
    }`,
    src: job.company?.logo?.startsWith("http")
      ? job.company.logo
      : `https://${job.company?.logo || ""}`,
    ctaText: "View Details",
    ctaLink: job.company?.link?.startsWith("http")
      ? job.company.link
      : `https://${job.company?.link || "#"}`,
    job,
  }));

  

  return (
    <div className="bg-blue-50 min-h-screen p-6 mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-blue-800">Opportunities</h1>
          <p className="text-gray-600 mt-2">Browse current job openings from top companies</p>
        </div>

        {loading && <p className="text-center text-gray-600">Loading...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && cards.length === 0 && (
          <p className="text-center text-gray-600">No job listings available.</p>
        )}

        {/* Overlay */}
        <AnimatePresence>
          {active && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-sm z-10"
            />
          )}
        </AnimatePresence>

        {/* Modal */}
        <AnimatePresence>
          {active && (
            <div className="fixed inset-0 flex items-center justify-center z-20 p-4">
              <motion.div
                layoutId={`card-${active.job._id}`}
                ref={ref}
                className="w-full max-w-4xl bg-white rounded-xl shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
              >
                <div className="relative">
                  <Image
                    src={active.src}
                    alt={active.title}
                    width={800}
                    height={192}
                    className="w-full h-48 object-cover"
                  />
                  <button
                    onClick={() => setActive(null)}
                    className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 shadow-md transition-all"
                  >
                    <CloseIcon />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{active.title}</h2>
                      <p className="text-gray-600 mt-1">{active.role}</p>
                    </div>
<div className="flex gap-4 mb-6">
  {/* Primary Action */}
  <button
    onClick={() =>
      mode === "apply"
        ? handleApply(active.job._id)
        : handleGenerateReport(active.job._id)
    }
    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
  >
    {mode === "apply" ? "Apply Now" : "View Report"}
  </button>

  {/* Update Button */}
  {mode === "reports" && (
    <button
      onClick={() => {
        
        console.log("Update clicked for offer:", active.job._id);
      }}
      className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
    >
      Update
    </button>
  )}
</div>



                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <DetailItem
                      label="Location"
                      value={
                        active.job.location
                          ? `${active.job.location.address_line}, ${active.job.location.area}, ${active.job.location.city}, ${active.job.location.state}, ${active.job.location.country} ${active.job.location.pincode}`
                          : "Unknown Location"
                      }
                    />
                    <DetailItem
                      label="Openings"
                      value={active.job.total_opening?.toString() || "N/A"}
                    />
                    <DetailItem label="Drive Type" value={active.job.drive || "N/A"} />
                    <DetailItem label="Offer Type" value={active.job.type || "N/A"} />
                    <DetailItem label="Sector" value={active.job.sector || "N/A"} />
                    <DetailItem
                      label="Salary"
                      value={
                        active.job.salary
                          ? `₹${(active.job.salary.min / 100000).toFixed(2)} - ₹${(
                              active.job.salary.max / 100000
                            ).toFixed(2)} LPA`
                          : "N/A"
                      }
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Requirements</h3>
                    <div className="flex flex-wrap gap-2">
                      <Tag
                        label={
                          active.job.criteria
                            ? `CGPA ${active.job.criteria.min_result}, Max Backlogs: ${active.job.criteria.max_backlog}, Branch: ${active.job.criteria.branch}, Passout: ${active.job.criteria.passout_year?.join(
                                ", "
                              ) || "N/A"}`
                            : "N/A"
                        }
                      />
                      {active.job.skills?.map(
                        (skill, i) => skill && <Tag key={`${active.job._id}-skill-${i}`} label={skill} />
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Job Description</h3>
                    <p className="text-gray-600">
                      We&apos;re looking for talented individuals to join our team. This role involves
                      working on cutting-edge technologies and collaborating with cross-functional
                      teams to deliver high-quality solutions.
                    </p>
                  </div>

                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Cards List */}
        {!loading && !error && cards.length > 0 && (
          <div className="max-w-4xl mx-auto space-y-4">
            {cards.map((card) => (
              <motion.div
                layoutId={`card-${card.job._id}`}
                key={`card-${card.job._id}`}
                onClick={() => setActive(card)}
                whileHover={{ scale: 1.01 }}
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <motion.div layoutId={`image-${card.job._id}`}>
                    <Image
                      src={card.src}
                      alt={card.title}
                      width={56}
                      height={56}
                      className="rounded-lg object-cover"
                    />
                  </motion.div>
                  <div className="flex-1">
                    <motion.h3 layoutId={`title-${card.job._id}`} className="font-semibold text-gray-900">
                      {card.title}
                    </motion.h3>
                    <motion.p layoutId={`description-${card.job._id}`} className="text-gray-600 text-sm">
                      {card.description}
                    </motion.p>
                  </div>

{/* <motion.button
  onClick={(e) => {
    e.stopPropagation();
    setActive(card); // open modal immediately
  }}
  className="px-4 py-2 text-sm rounded-lg font-medium bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
>
  {mode === "apply" ? "Apply Now" : "View Report"}
</motion.button> */}
<motion.button
  onClick={(e) => {
    e.stopPropagation();
    setActive(card); // open modal
  }}
  className="px-4 py-2 text-sm rounded-lg font-medium bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
>
  View Details
</motion.button>




                </div>


              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Components
const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <span className="text-sm text-gray-500">{label}</span>
    <p className="font-medium text-gray-900">{value}</p>
  </div>
);

const Tag: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
    {label}
  </span>
);

const CloseIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-5 w-5"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M18 6l-12 12" />
    <path d="M6 6l12 12" />
  </svg>
);
