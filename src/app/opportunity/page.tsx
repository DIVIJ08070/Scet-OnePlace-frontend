'use client';

import React, { useEffect, useId, useRef, useState } from "react";
import Image from "next/image"; // for optimized images
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "../components/hooks/use-outside-click";

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

export default function ExpandableCard() {
  const [active, setActive] = useState<Card | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

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

  const cards: Card[] = jobs.map((job) => ({
    title: job.company?.name || "Unknown Company",
    role: job.role,
    description: `Location: ${job.location?.city || "Unknown"}, Criteria: CGPA > ${job.criteria?.min_result || "N/A"}`,
    src: job.company?.logo?.startsWith("http") ? job.company.logo : `https://${job.company?.logo || ""}`,
    ctaText: "View Details",
    ctaLink: job.company?.link?.startsWith("http") ? job.company.link : `https://${job.company?.link || "#"}`,
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
                layoutId={`card-${active.title}-${id}`}
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
                    <a
                      href={active.ctaLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                    >
                      {active.ctaText}
                    </a>
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
                          ? `₹${(active.job.salary.min / 100000).toFixed(2)} - ₹${(active.job.salary.max / 100000).toFixed(2)} LPA`
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
                            ? `CGPA ${active.job.criteria.min_result}, Max Backlogs: ${active.job.criteria.max_backlog}, Branch: ${active.job.criteria.branch}, Passout: ${active.job.criteria.passout_year?.join(", ") || "N/A"}`
                            : "N/A"
                        }
                      />
                      {active.job.skills?.map((skill, i) => skill && <Tag key={i} label={skill} />)}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Job Description</h3>
                    <p className="text-gray-600">
                      We&apos;re looking for talented individuals to join our team. This role involves working on cutting-edge
                      technologies and collaborating with cross-functional teams to deliver high-quality solutions.
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
                layoutId={`card-${card.title}-${id}`}
                key={`card-${card.title}-${id}`}
                onClick={() => setActive(card)}
                whileHover={{ scale: 1.01 }}
                className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <motion.div layoutId={`image-${card.title}-${id}`}>
                    <Image
                      src={card.src}
                      alt={card.title}
                      width={56}
                      height={56}
                      className="rounded-lg object-cover"
                    />
                  </motion.div>
                  <div className="flex-1">
                    <motion.h3 layoutId={`title-${card.title}-${id}`} className="font-semibold text-gray-900">
                      {card.title}
                    </motion.h3>
                    <motion.p layoutId={`description-${card.description}-${id}`} className="text-gray-600 text-sm">
                      {card.description}
                    </motion.p>
                  </div>
                  <motion.button
                    layoutId={`button-${card.title}-${id}`}
                    className="px-4 py-2 text-sm rounded-lg font-medium bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
                  >
                    {card.ctaText}
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
