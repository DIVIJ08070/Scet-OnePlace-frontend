'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Variants } from "framer-motion";
import { easeIn, easeOut } from "framer-motion";

interface Address {
  address_line: string;
  area: string;
  city: string;
  state: string;
  country: string;
  pincode: number;
}

interface CompanyData {
  _id?: string;
  name: string;
  logo: string;
  link: string;
  description: string;
  contact: string;
  address: Address;
}

const AddCompany = () => {
  const [companyData, setCompanyData] = useState({
    name: '',
    logo: '',
    link: '',
    description: '',
    contact: '',
  });

  const [addressData, setAddressData] = useState({
    address_line: '',
    area: '',
    city: '',
    state: '',
    country: '',
    pincode: '',
  });

  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const currentStep = showAddressForm ? 2 : 1;

  // Fetch companies from API
  const fetchCompanies = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('http://127.0.0.1:5000/api/v1/company', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch companies: ${res.status} ${res.statusText} - ${errorText}`);
      }
      const json = await res.json();
      console.log('GET API Response:', json);
      let companiesArray: CompanyData[] = [];
      if (json.data) {
        if (Array.isArray(json.data)) {
          companiesArray = json.data;
        } else if (json.data.company && Array.isArray(json.data.company)) {
          companiesArray = json.data.company;
        } else {
          console.warn('GET API Response invalid format:', json.data);
        }
      } else {
        console.warn('GET API Response missing data field:', json);
      }
      console.log('Parsed Companies:', companiesArray);
      setCompanies(companiesArray);
      setError(null);
} catch (err: unknown) {
  if (err instanceof Error) {
    const errorMessage = `Failed to load companies: ${err.message}`;
    setError(errorMessage);
    console.error('Fetch Error:', err.message);
  } else {
    setError('An unknown error occurred.');
    console.error('Fetch Error:', err);
  }
  setCompanies([]);
} finally {
  setIsLoading(false);
}

  };

  // Initial fetch on mount
  useEffect(() => {
    fetchCompanies();
  }, []);

  // Log companies state changes
  useEffect(() => {
    console.log('Companies State Updated:', companies);
  }, [companies]);

  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCompanyData({ ...companyData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressData({ ...addressData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (addressData.address_line.startsWith('http')) {
        setError('Address line should not be a URL');
        return;
      }
      const payload = {
        ...companyData,
        address: { ...addressData, pincode: parseInt(addressData.pincode) || 0 },
      };
      console.log('POST Payload:', payload);
      const res = await fetch('http://127.0.0.1:5000/api/v1/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to add company: ${res.status} ${res.statusText} - ${errorText}`);
      }
      const newCompany = await res.json();
      console.log('POST Response:', newCompany);
      const newCompanyData = newCompany.data?.company || newCompany.data;
      if (newCompanyData && typeof newCompanyData === 'object' && newCompanyData.name) {
        setCompanies((prev) => {
          const updated = [...prev, newCompanyData];
          console.log('Updated Companies:', updated);
          return updated;
        });
        await fetchCompanies(); // Refresh list
      } else {
        throw new Error('Invalid company data in response');
      }
      setCompanyData({ name: '', logo: '', link: '', description: '', contact: '' });
      setAddressData({ address_line: '', area: '', city: '', state: '', country: '', pincode: '' });
      setShowAddressForm(false);
      setError(null);
} catch (err: unknown) {
  if (err instanceof Error) {
    setError(`Failed to add company: ${err.message}`);
    console.error('Submit Error:', err.message);
  } else {
    setError('An unknown error occurred while adding the company.');
    console.error('Submit Error:', err);
  }
}

  };

  const toggleCompanyDetails = (company: CompanyData) => {
    setSelectedCompany(selectedCompany?.name === company.name ? null : company);
  };

  // Animation variants
  // const formVariants = {
  //   hidden: { opacity: 0, x: -50 },
  //   visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } },
  //   exit: { opacity: 0, x: 50, transition: { duration: 0.3, ease: 'easeIn' } },
  // };

const formVariants: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { duration: 0.5, ease: easeOut } 
  },
  exit: { 
    opacity: 0, 
    x: 50, 
    transition: { duration: 0.3, ease: easeIn } 
  },
};

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: easeOut } },
  };

  const detailsVariants = {
    hidden: { opacity: 0, height: 0, transition: { duration: 0.3 } },
    visible: { opacity: 1, height: 'auto', transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen flex font-inter">
      {/* Form Section */}
      <div className="w-full lg:w-3/5 bg-white flex items-center justify-center p-4 lg:p-8 relative z-10 my-8">
        <motion.div
          className="w-full max-w-2xl mx-auto p-6 sm:p-8 bg-white shadow-2xl rounded-3xl space-y-6 border-b-4 border-blue-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl font-extrabold text-blue-800 mb-6 text-center">
            {currentStep === 1 ? 'Company Details' : 'Company Address'}
          </h2>

          {error && (
            <motion.div
              className="p-4 bg-red-100 text-red-700 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
              {error.includes('Failed to load companies') && (
                <button
                  onClick={fetchCompanies}
                  className="ml-4 py-1 px-3 bg-blue-600 text-white rounded-lg"
                >
                  Retry
                </button>
              )}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.form
                key="company-form"
                onSubmit={(e) => e.preventDefault()}
                className="space-y-5"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={companyData.name}
                    onChange={handleCompanyChange}
                    placeholder="Company Name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="logo" className="block text-sm font-semibold text-gray-700 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="text"
                    id="logo"
                    name="logo"
                    value={companyData.logo}
                    onChange={handleCompanyChange}
                    placeholder="Logo URL"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="link" className="block text-sm font-semibold text-gray-700 mb-1">
                    Website Link
                  </label>
                  <input
                    type="text"
                    id="link"
                    name="link"
                    value={companyData.link}
                    onChange={handleCompanyChange}
                    placeholder="Website Link"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={companyData.description}
                    onChange={handleCompanyChange}
                    placeholder="Description"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="contact" className="block text-sm font-semibold text-gray-700 mb-1">
                    Contact
                  </label>
                  <input
                    type="text"
                    id="contact"
                    name="contact"
                    value={companyData.contact}
                    onChange={handleCompanyChange}
                    placeholder="Contact"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddressForm(true)}
                  className="w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
                >
                  Next
                </button>
              </motion.form>
            )}

            {currentStep === 2 && (
              <motion.form
                key="address-form"
                onSubmit={handleSubmit}
                className="space-y-5"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div>
                  <label
                    htmlFor="address_line"
                    className="block text-sm font-semibold text-gray-700 mb-1"
                  >
                    Address Line
                  </label>
                  <input
                    type="text"
                    id="address_line"
                    name="address_line"
                    value={addressData.address_line}
                    onChange={handleAddressChange}
                    placeholder="Address Line"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="area" className="block text-sm font-semibold text-gray-700 mb-1">
                    Area
                  </label>
                  <input
                    type="text"
                    id="area"
                    name="area"
                    value={addressData.area}
                    onChange={handleAddressChange}
                    placeholder="Area"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={addressData.city}
                    onChange={handleAddressChange}
                    placeholder="City"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-sm font-semibold text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={addressData.state}
                    onChange={handleAddressChange}
                    placeholder="State"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-sm font-semibold text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={addressData.country}
                    onChange={handleAddressChange}
                    placeholder="Country"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="pincode" className="block text-sm font-semibold text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    id="pincode"
                    name="pincode"
                    value={addressData.pincode}
                    onChange={handleAddressChange}
                    placeholder="Pincode"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(false)}
                    className="w-full py-3 px-6 bg-gray-300 text-gray-800 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-full py-3 px-6 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
                  >
                    Submit Company
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Company List Section */}
      <div className="w-full lg:w-2/5 bg-gradient-to-br from-blue-500 to-blue-700 flex-col p-4 lg:p-8 relative overflow-hidden">
        <h3 className="text-2xl font-extrabold text-white mb-6">Existing Companies</h3>
        <div className="overflow-y-auto max-h-[calc(100vh-150px)] space-y-4 pr-2">
          {isLoading ? (
            <motion.div
              className="text-white text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              Loading companies...
            </motion.div>
          ) : error ? (
            <motion.div
              className="text-red-200 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {error}
              <button
                onClick={fetchCompanies}
                className="ml-4 py-1 px-3 bg-blue-600 text-white rounded-lg"
              >
                Retry
              </button>
            </motion.div>
          ) : companies.length === 0 ? (
            <motion.div
              className="text-white text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              No companies found.
            </motion.div>
          ) : (
            <AnimatePresence>
              {Array.isArray(companies) &&
                companies.map((company, index) => (
                  <motion.div
                    key={company._id || company.name + index}
                    className="bg-white rounded-xl shadow-lg cursor-pointer"
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                    onClick={() => toggleCompanyDetails(company)}
                  >
                    <div className="flex items-center p-4">
                      <img
                        src={company.logo.startsWith('http') ? company.logo : `https://${company.logo}`}
                        alt={`${company.name} logo`}
                        className="w-12 h-12 rounded-full object-cover mr-4"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/48x48/2563EB/FFFFFF?text=Logo';
                        }}
                      />
                      <h4 className="text-lg font-bold text-gray-800 truncate">{company.name}</h4>
                    </div>
                    <AnimatePresence>
                      {selectedCompany?.name === company.name && (
                        <motion.div
                          className="p-4 bg-gray-50 border-t border-gray-200"
                          variants={detailsVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                        >
                          <p className="text-sm text-gray-600 mb-2">{company.description}</p>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Contact:</strong> {company.contact}
                          </p>
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Address:</strong>{' '}
                            {`${company.address.address_line}, ${company.address.area}, ${company.address.city}, ${company.address.state}, ${company.address.country} - ${company.address.pincode}`}
                          </p>
                          <a
                            href={
                              company.link.startsWith('http')
                                ? company.link
                                : `https://${company.link}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-sm hover:underline"
                          >
                            Visit Website
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Mobile Modal for Company Details */}
      {selectedCompany && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            className="bg-white rounded-xl p-6 w-11/12 max-w-md max-h-[80vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center mb-4">
              <img
                src={
                  selectedCompany.logo.startsWith('http')
                    ? selectedCompany.logo
                    : `https://${selectedCompany.logo}`
                }
                alt={`${selectedCompany.name} logo`}
                className="w-12 h-12 rounded-full object-cover mr-4"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/48x48/2563EB/FFFFFF?text=Logo';
                }}
              />
              <h4 className="text-lg font-bold text-gray-800">{selectedCompany.name}</h4>
            </div>
            <p className="text-sm text-gray-600 mb-2">{selectedCompany.description}</p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Contact:</strong> {selectedCompany.contact}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Address:</strong>{' '}
              {`${selectedCompany.address.address_line}, ${selectedCompany.address.area}, ${selectedCompany.address.city}, ${selectedCompany.address.state}, ${selectedCompany.address.country} - ${selectedCompany.address.pincode}`}
            </p>
            <a
              href={
                selectedCompany.link.startsWith('http')
                  ? selectedCompany.link
                  : `https://${selectedCompany.link}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 text-sm hover:underline"
            >
              Visit Website
            </a>
            <button
              className="w-full mt-4 py-2 px-4 bg-gray-300 text-gray-800 rounded-lg font-semibold"
              onClick={() => setSelectedCompany(null)}
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AddCompany;