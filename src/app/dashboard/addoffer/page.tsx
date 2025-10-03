'use client';
import React, { useState, useEffect ,useRef} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ExpandableCard from '@/app/opportunity/page';

interface Location {
  address_line: string;
  area: string;
  city: string;
  state: string;
  country: string;
  pincode: number;
}

interface Company {
  _id: string;
  name: string;
}

interface Criteria {
  min_result: number;
  max_backlog: number;
  passout_year: number[];
  branch: string;
}

interface OfferData {
  _id?: string;
  company: string;
  role: string;
  location: Location;
  total_opening: number;
  drive: string;
  type: string;
  sector: string;
  salary: {
    min: number;
    max: number;
  };
  criteria: Criteria;
}

const AddOfferForm = () => {
  const [offerData, setOfferData] = useState<OfferData>({
    company: '',
    role: '',
    location: {
      address_line: '',
      area: '',
      city: '',
      state: '',
      country: '',
      pincode: 0,
    },
    total_opening: 0,
    drive: '',
    type: '',
    sector: '',
    salary: {
      min: 0,
      max: 0,
    },
    criteria: {
      min_result: 0,
      max_backlog: 0,
      passout_year: [],
      branch: '',
    },
  });
    // Company dropdown state
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companySearch, setCompanySearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [offers, setOffers] = useState<OfferData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch offers from API
  const fetchOffers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://127.0.0.1:5000/api/v1/offer', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch offers: ${res.status} ${res.statusText} - ${errorText}`);
      }
      const json = await res.json();
      console.log('GET API Response:', json);
      let offersArray: OfferData[] = [];
      if (json.data) {
        if (Array.isArray(json.data)) {
          offersArray = json.data;
        } else if (json.data.offer && Array.isArray(json.data.offer)) {
          offersArray = json.data.offer;
        } else {
          console.warn('GET API Response invalid format:', json.data);
        }
      } else {
        console.warn('GET API Response missing data field:', json);
      }
      console.log('Parsed Offers:', offersArray);
      setOffers(offersArray);
      setError(null);
    } catch (err: unknown) {
  const errorMessage =
    err instanceof Error ? `Failed to load offers: ${err.message}` : 'Unknown error';
  setError(errorMessage);
  console.error('Fetch Error:', err);
  setOffers([]);
}

     finally {
      setIsLoading(false);
    }
  };

useEffect(() => {
  const fetchCompanies = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/v1/company');
      const json = await res.json();

      if (json.data && Array.isArray(json.data.company)) {
        // Extract only name and _id
        const companyList = json.data.company.map((c: any) => ({
          _id: c._id,
          name: c.name,
        }));
        setCompanies(companyList);
      } else {
        console.warn('Unexpected API response format:', json);
      }
    } catch (err) {
      console.error('Failed to fetch companies:', err);
    }
  };

  fetchCompanies();
  fetchOffers(); // fetch existing offers
}, []);


    useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );



  // Log offers state changes
  useEffect(() => {
    console.log('Offers State Updated:', offers);
  }, [offers]);
const handleChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;

  // Handle nested fields like "location.city" or "criteria.min_result"
  if (name.includes('.')) {
    const [parent, child] = name.split('.') as [keyof Pick<OfferData, 'location' | 'criteria' | 'salary'>, string];

    setOfferData((prev) => {
      // Narrow parent type
      type NestedObject = OfferData['location'] | OfferData['criteria'] | OfferData['salary'];
      const nested = prev[parent] as NestedObject;

      // Determine new value with proper parsing
      let parsedValue: string | number | number[];
      if (parent === 'location' && child === 'pincode') parsedValue = parseInt(value) || 0;
      else if (parent === 'criteria' && child === 'min_result') parsedValue = parseFloat(value) || 0;
      else if (parent === 'criteria' && child === 'max_backlog') parsedValue = parseInt(value) || 0;
      else if (parent === 'criteria' && child === 'passout_year') parsedValue = [parseInt(value) || 0];
      else if (parent === 'salary') parsedValue = parseInt(value) || 0;
      else parsedValue = value;

      return {
        ...prev,
        [parent]: {
          ...nested,
          [child]: parsedValue,
        },
      };
    });
  } else {
    // Handle top-level fields
    setOfferData((prev) => ({
      ...prev,
      [name]: name === 'total_opening' ? parseInt(value) || 0 : value,
    }));
  }
};


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!offerData.company) {
        setError('Company ID is required');
        return;
      }
      if (offerData.location.address_line.startsWith('http')) {
        setError('Location address line should not be a URL');
        return;
      }
      const payload = {
        ...offerData,
        total_opening: parseInt(String(offerData.total_opening)) || 0,
        salary: {
          min: parseInt(String(offerData.salary.min)) || 0,
          max: parseInt(String(offerData.salary.max)) || 0,
        },
        location: {
          ...offerData.location,
          pincode: parseInt(String(offerData.location.pincode)) || 0,
        },
        criteria: {
          ...offerData.criteria,
          min_result: parseFloat(String(offerData.criteria.min_result)) || 0,
          max_backlog: parseInt(String(offerData.criteria.max_backlog)) || 0,
          passout_year: offerData.criteria.passout_year.length
            ? offerData.criteria.passout_year
            : [new Date().getFullYear() + 1],
          branch: offerData.criteria.branch.split(",")
        },
        
      };
      console.log('POST Payload:', payload);
      const res = await fetch('http://127.0.0.1:5000/api/v1/offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to add offer: ${res.status} ${res.statusText} - ${errorText}`);
      }
      const newOffer = await res.json();
      console.log('POST Response:', newOffer);
      const newOfferData = newOffer.data?.offer || newOffer.data;
      if (newOfferData && typeof newOfferData === 'object' && newOfferData.role) {
        setOffers((prev) => {
          const updated = [...prev, newOfferData];
          console.log('Updated Offers:', updated);
          return updated;
        });
        await fetchOffers(); // Refresh list
      } else {
        throw new Error('Invalid offer data in response');
      }
      setOfferData({
        company: '',
        role: '',
        location: { address_line: '', area: '', city: '', state: '', country: '', pincode: 0 },
        total_opening: 0,
        drive: '',
        type: '',
        sector: '',
        salary: { min: 0, max: 0 },
        criteria: { min_result: 0, max_backlog: 0, passout_year: [], branch: '' },
      });
      setError(null);
    } catch (err: unknown) {
  const errorMessage =
    err instanceof Error ? `Failed to add offer: ${err.message}` : 'Unknown error';
  setError(errorMessage);
  console.error('Submit Error:', err);
}

  };

  // Animation variants


const formVariants: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.5, ease: "easeOut" } 
  },
  exit: { 
    opacity: 0, 
    x: 50, 
    transition: { duration: 0.3, ease: "easeIn" } 
  },
};


  return (
    <div className="min-h-screen font-inter text-blue-800 p-6 mt-10 overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-3rem)] rounded-2xl">
        {/* Form Section - Scrollable */}
        <div className="lg:w-1/2 overflow-y-auto max-h-screen pb-10 mt-12">
          <motion.form
            onSubmit={handleSubmit}
            className="bg-blue-50 shadow-md rounded-lg p-6 space-y-6"
            variants={formVariants}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-2xl font-bold text-center">Add New Offer</h2>

            {error && (
              <motion.div
                className="p-4 bg-red-100 text-red-700 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {error}
                {error.includes('Failed to load offers') && (
                  <button
                    onClick={fetchOffers}
                    className="ml-4 py-1 px-3 bg-blue-600 text-white rounded-lg"
                  >
                    Retry
                  </button>
                )}
              </motion.div>
            )}
{/* Company Dropdown */}
<div className="relative" ref={dropdownRef}>
  <label className="block text-sm font-semibold text-gray-700 mb-1">
    Company
  </label>
  <input
    type="text"
    placeholder="Search company..."
    value={companySearch}
    onFocus={() => setIsDropdownOpen(true)}
    onChange={(e) => {
      setCompanySearch(e.target.value);
      setIsDropdownOpen(true);
    }}
    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
    required
  />
  <AnimatePresence>
    {isDropdownOpen && (
      <motion.ul
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg mt-1 max-h-60 overflow-auto shadow-lg"
      >
        {filteredCompanies.length ? (
          filteredCompanies.map((company) => (
            <li
              key={company._id}
              onClick={() => {
                setOfferData((prev) => ({ ...prev, company: company._id }));
                setCompanySearch(company.name);
                setIsDropdownOpen(false);
              }}
              className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
            >
              {company.name}
            </li>
          ))
        ) : (
          <li className="px-3 py-2 text-gray-400">No company found</li>
        )}
      </motion.ul>
    )}
  </AnimatePresence>
</div>

{/* Hidden input to store company _id */}
<input type="hidden" name="company" value={offerData.company} />


            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1">
                Role
              </label>
              <input
                type="text"
                id="role"
                name="role"
                value={offerData.role}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                required
              />
            </div>

            <div>
              <label htmlFor="location.address_line" className="block text-sm font-semibold text-gray-700 mb-1">
                Address Line
              </label>
              <input
                type="text"
                id="location.address_line"
                name="location.address_line"
                value={offerData.location.address_line}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                required
              />
            </div>

            <div>
              <label htmlFor="location.area" className="block text-sm font-semibold text-gray-700 mb-1">
                Area
              </label>
              <input
                type="text"
                id="location.area"
                name="location.area"
                value={offerData.location.area}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="location.city" className="block text-sm font-semibold text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                id="location.city"
                name="location.city"
                value={offerData.location.city}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="location.state" className="block text-sm font-semibold text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                id="location.state"
                name="location.state"
                value={offerData.location.state}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="location.country" className="block text-sm font-semibold text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                id="location.country"
                name="location.country"
                value={offerData.location.country}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="location.pincode" className="block text-sm font-semibold text-gray-700 mb-1">
                Pincode
              </label>
              <input
                type="number"
                id="location.pincode"
                name="location.pincode"
                value={offerData.location.pincode}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="total_opening" className="block text-sm font-semibold text-gray-700 mb-1">
                Total Openings
              </label>
              <input
                type="number"
                id="total_opening"
                name="total_opening"
                value={offerData.total_opening}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                required
              />
            </div>

            <div>
              <label htmlFor="drive" className="block text-sm font-semibold text-gray-700 mb-1">
                Drive Type
              </label>
              <select
                id="drive"
                name="drive"
                value={offerData.drive}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                required
              >
                <option value="">Select Drive Type</option>
                <option value="on campus">On Campus</option>
                <option value="off campus">Off Campus</option>
              </select>
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-1">
                Offer Type
              </label>
              <select
                id="type"
                name="type"
                value={offerData.type}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                required
              >
                <option value="">Select Offer Type</option>
                <option value="internship">Internship</option>
                <option value="placement">Placement</option>
                <option value="internship and placement">Internship and Placement</option>
              </select>
            </div>

            <div>
              <label htmlFor="sector" className="block text-sm font-semibold text-gray-700 mb-1">
                Sector
              </label>
              <select
                id="sector"
                name="sector"
                value={offerData.sector}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                required
              >
                <option value="">Select Sector</option>
                <option value="IT">IT</option>
                <option value="Core">Core</option>
                <option value="Management">Management</option>
              </select>
            </div>

            <div>
              <label htmlFor="salary.min" className="block text-sm font-semibold text-gray-700 mb-1">
                Minimum Salary (₹)
              </label>
              <input
                type="number"
                id="salary.min"
                name="salary.min"
                value={offerData.salary.min}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="salary.max" className="block text-sm font-semibold text-gray-700 mb-1">
                Maximum Salary (₹)
              </label>
              <input
                type="number"
                id="salary.max"
                name="salary.max"
                value={offerData.salary.max}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                required
              />
            </div>

            <div>
              <label htmlFor="criteria.min_result" className="block text-sm font-semibold text-gray-700 mb-1">
                Minimum Result (CGPA)
              </label>
              <input
                type="number"
                id="criteria.min_result"
                name="criteria.min_result"
                value={offerData.criteria.min_result}
                onChange={handleChange}
                step="0.1"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                required
              />
            </div>

            <div>
              <label htmlFor="criteria.max_backlog" className="block text-sm font-semibold text-gray-700 mb-1">
                Maximum Backlogs
              </label>
              <input
                type="number"
                id="criteria.max_backlog"
                name="criteria.max_backlog"
                value={offerData.criteria.max_backlog}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
              />
            </div>

            <div>
              <label htmlFor="criteria.passout_year" className="block text-sm font-semibold text-gray-700 mb-1">
                Passout Year
              </label>
              <input
                type="number"
                id="criteria.passout_year"
                name="criteria.passout_year"
                value={offerData.criteria.passout_year[0] || ''}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                required
              />
            </div>

            <div>
              <label htmlFor="criteria.branch" className="block text-sm font-semibold text-gray-700 mb-1">
                Branch
              </label>
              <input
                type="text"
                id="criteria.branch"
                name="criteria.branch"
                value={offerData.criteria.branch}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
            >
              Add Offer
            </button>
          </motion.form>
        </div>

        {/* ExpandableCard Section - Scrollable */}
        <div className="lg:w-1/2 overflow-y-auto h-[calc(100vh-3rem)] -mt-7.5 pb-10">
        <ExpandableCard mode="reports" />
          
        </div>
      </div>
    </div>
  );

};

export default AddOfferForm;