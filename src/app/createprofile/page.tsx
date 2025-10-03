'use client';
import React, { useEffect, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

import type { CredentialResponse } from '@react-oauth/google';
import { useToken } from '../components/context/TokenContext';

// Define interfaces for TypeScript
interface FormData {
  name: string;
  profileImage:String|null;
  resume:String | null;
  email: string;
  enrollment_no: string;
  dob: string;
  contact: string;
  gender: string;
  caste: string;
}

interface AddressData {
  fullAddressLine: string;
  area: string;
  city: string;
  state: string;
  country: string;
  pinCode: string;
}

interface AcademicData {
  passoutYear: string;
  semesterResults: string[];
  tenthResult: string;
  tenthPassoutYear: string;
  qualificationType: 'twelfth' | 'diploma' | '';
  twelfthResult: string;
  twelfthPassoutYear: string;
  diplomaSemesterResults: string[];
  diplomaPassoutYear: string;
  cgpa: string;
  backlogs: string;
}

// Extend JwtPayload to include name and email
interface CustomJwtPayload extends JwtPayload {
  name?: string;
  email?: string;
}

const Createprofile = () => {
  const { setAccessToken, setRefreshToken } = useToken();
  const router = useRouter();
  const [user, setUser] = useState<CustomJwtPayload | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    profileImage: "data:image/png;base64,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",
    resume: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJsAAACUCAMAAACz6atrAAAAbFBMVEX///8jHyAAAAAgHB38/PwhHyDY2Njt7e0dGBnh4eEaFRb39/cFAAAfGhvLy8vT09MTDA5VVFSurq64uLjn5+deXl7BwcGJiYmioqJjY2N9fHwLAARLSUqEg4MsKSpvb289PDwzMjKYmJhDQ0OTifG0AAAFRklEQVR4nO2c2ZaiMBCGmwphCUEDCAhh7/d/x0Edu3XcgKSicw7flRd9jn+H1F749bWysrKysrLyKdhOMuRlWeZD4tjvFvOL7WdlDwBcHODjp77M/I8QmJUdcM+6xOPQldm7hblJAyK0bgkFNIn7TmlZB94dYX9PD7r3nZ2fSvZQ2QEmU/890mIqnyoboZLGb1Bm108e5+WDrY1brJvCBGWHo4PUsEkEEZ8mzaKUR4FJaW718qpdICuTJ5cCnaHN4qkxZaMZWLO0WeYMIhGzhI0QkZiR5gKZq40SMHPlyjl2cEaWJqRls5/oEWEitlYLtVX40rKJ8eAGQD84O3qeejyGRdh+ZGPNNtK/EGuDrC1f+kjH6JDjSgu6KYnRfViHG/Od5cc2WoODqm2vpG2Pqq1aaqUHGKqLs/t79d5Uwh7Ti/jNUg9ygDSYVdeGKGkLMT3c/MztCtQsLlbUhlmsxktSN1PaPvncPljbJ9tCphIWxsCAmV46VMm/WZjB3u1VtIU9aiH4wbH+q57aProHr1G1bZTyN9yCwWXLLxxhuDm5vajhcEKUyEVgstwY0HtJ7vfSQsv7Rm+tLq5mkCuZA0G47OA8z0BHOl50cJSbGIK41ZKDY2Z65Ytqe+Sa/odyvjgw0lIdCYq5KaYojI1mXDJHHKWMGBzMOM2M8EBZY+iyndiy6eIY25qUNorrpz5W0RuW9vXlV9OsFao3jMXdcsLg2YPyPcsOSf/q6HhjaMZ2i1+DeJwHEwH1m9YcjjglA3JnlkopAVYaN4IRd/j5aG9zAOFdnx7xOEC+/U3BB1OXLhgAvi8fVlZHDQcpGPM8JiTwJqovuwujScNgJGg5BZDRaV2lY66T7Nv0u+u7Kmr3iXN1TPHoCgkU+LHBjuHodEOIpn2ZE8Gxty4gRi6z7PJnIC68evfy73e1d44fBHBrwN1lMCDSa/1n1yjwW0/+WgmF6vU/sxinE1f+gnDRJo++b5e0kl/6F0pFh3bpnOYmvhMh+iLeBddPyw52cdGIW78ssLKlbc/ubayM7h/6doizjeP4jrPJ4qHtR5931yUznKRkRx+nbJ7go/k2fd83o0GOvvjhXzKKcOd23auEjRASkldDpfHO6RcXCTpvB+mBNioizcrsBXXfI3T7OcXBwhVUb7PLn78e9QQCOtO62cXyc0ShT9pebfx3C9fWi9tZy5dC7uNZupLNVmWocB9dvZut3st2hAgtsctuEbRZotXh5LZSp/84Q7iOg2t1G+kJ2apL2+kLVtdocMDafdsZPrz+8ue4ShPTZ7BI1cdtsY5tvHGq1lBjXbfDkrmitrsvEekhlGrS0Kz0AKhl58uGV1O1qY24Sox4dUYouV830p0dXeIpvUjjdxix9AzpVULDBsvxnmAqSxmJ/qzyEq5ScCmtGr9GaYSf454bqGy/o6S8vyg5kQhZm0prBC1BOsE+WZvKQtwna9PcB/kXpb7IgOzfVEqGjcIq3muIUswKFr+NNQWm9kKv0n7lK1T3LwvEWka1QxikXEt//BaZKo9U3X7eu81TAR1L0kGrtRF9gkCrZRAdDKDbBQt9M3In5Tp9CeOpxnGgHXegSx2DTvN0PIgjoaH/EAoRxfpXHuykpM/WaF5DBNAywRna226SUiEXxVjCpKBp4mKuE7hJnnIANufxEgYg09zEz9cEflZXVEohGAsfnCE9BBMSMiaElLSqs6cLEdoFJkNdVL0Hp19GGlWeZJKjosOvJAHpq6IeEpOyLgS6vrPJ9nlZRF0j4IRouqgt8322cXz3LbJWVlZWVlZW/g/+ANeRVQQGZrG0AAAAAElFTkSuQmCC",
    email: '',
    enrollment_no: '',
    dob: '',
    contact: '',
    gender: '',
    caste: '',
  });
  const [addressData, setAddressData] = useState<AddressData>({
    fullAddressLine: '',
    area: '',
    city: '',
    state: '',
    country: '',
    pinCode: '',
  });
  const [academicData, setAcademicData] = useState<AcademicData>({
    passoutYear: '',
    semesterResults: [],
    tenthResult: '',
    tenthPassoutYear: '',
    qualificationType: '',
    twelfthResult: '',
    twelfthPassoutYear: '',
    diplomaSemesterResults: Array(6).fill(''),
    diplomaPassoutYear: '',
    cgpa: '',
    backlogs: '',
  });
  const [showAddress, setShowAddress] = useState(false);
  const [showAcademic, setShowAcademic] = useState(false);

  // Determine the current step for the stepper and image display
  const currentStep = !showAddress && !showAcademic ? 1 : showAddress ? 2 : 3;

  // Image URLs for each step (using placeholder images for demonstration)
  const stepImages: { [key: number]: string } = {
    1: 'personal_detail.png', // Placeholder for personal details image
    2: 'address.png',  // Placeholder for address details image
    3: 'academic.png',// Placeholder for academic details image
  };

  // Handle changes for address form fields
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressData({ ...addressData, [e.target.name]: e.target.value });
  };

  // Handle changes for academic form fields
  const handleAcademicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAcademicData({ ...academicData, [name]: value });
  };

  // Handle changes for individual semester results
  const handleSemesterChange = (index: number, value: string) => {
    const updatedResults = [...academicData.semesterResults];
    updatedResults[index] = value;
    setAcademicData({ ...academicData, semesterResults: updatedResults });
  };

  // Handle changes for individual diploma semester results
  const handleDiplomaSemesterChange = (index: number, value: string) => {
    const updatedResults = [...academicData.diplomaSemesterResults];
    updatedResults[index] = value;
    setAcademicData({ ...academicData, diplomaSemesterResults: updatedResults });
  };

  // Handle qualification type change (12th, Diploma, None)
  const handleQualificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const qualificationType = e.target.value as 'twelfth' | 'diploma' | '';
    setAcademicData({
      ...academicData,
      qualificationType,
      // Clear relevant fields if qualification type changes
      twelfthResult: qualificationType !== 'twelfth' ? '' : academicData.twelfthResult,
      twelfthPassoutYear: qualificationType !== 'twelfth' ? '' : academicData.twelfthPassoutYear,
      diplomaSemesterResults: qualificationType !== 'diploma' ? Array(6).fill('') : academicData.diplomaSemesterResults,
      diplomaPassoutYear: qualificationType !== 'diploma' ? '' : academicData.diplomaPassoutYear,
    });
  };

  // Handle successful Google login
  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (idToken) {
      const decoded = jwtDecode<CustomJwtPayload>(idToken);
      setUser(decoded);
      setToken(idToken);
      // Pre-fill name and email from Google account
      setFormData((prev) => ({
        ...prev,
        name: decoded.name || '',
        email: decoded.email || '',
      }));
      // Store user info in localStorage (optional, for persistence across sessions)
      localStorage.setItem('google-user', JSON.stringify(decoded));
      localStorage.setItem('google-token', idToken);
    } else {
      console.error('No credential returned from Google login.');
    }
  };

  // Handle changes for main form fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

// Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      console.error('User not authenticated. Please sign in.');
      return;
    }
    
    // --- START: Data Restructuring to match your desired format ---
    const restructuredData = {
      name: formData.name,
      // resume:formData.resume,
      // profileImage:formData.profileImage,
      enrollment_no: formData.enrollment_no,
      dob: formData.dob,
      email: formData.email,
      googleId: token,
      contact: formData.contact,
      gender: formData.gender,
      caste: formData.caste,
      academic_details: {
        passout_year: parseInt(academicData.passoutYear, 10), // Convert to number
        result: {
          ssc: {
            percentage: parseFloat(academicData.tenthResult), // Convert to number
            completion_year: parseInt(academicData.tenthPassoutYear, 10), // Convert to number
          },
          hsc: academicData.qualificationType === 'twelfth' ? {
            percentage: parseFloat(academicData.twelfthResult), // Convert to number
            completion_year: parseInt(academicData.twelfthPassoutYear, 10), // Convert to number
          } : undefined, // Conditionally include or set to undefined
          diploma: academicData.qualificationType === 'diploma' ? {
            result: academicData.diplomaSemesterResults.reduce((acc: Record<string, number>, current, index) => {
              acc[`sem${index + 1}`] = parseFloat(current);
              return acc;
            }, {} as Record<string, number>),
            completion_year: parseInt(academicData.diplomaPassoutYear, 10), // Convert to number
          } : undefined, // Conditionally include or set to undefined
          degree: {
            result: academicData.semesterResults.reduce((acc: Record<string, number>, current, index) => {
              acc[`sem${index + 1}`] = parseFloat(current);
              return acc;
            }, {} as Record<string, number>),
            completion_year: parseInt(academicData.passoutYear, 10), // You already have passoutYear
//             cgpa: parseFloat(academicData.cgpa), // Convert to number
            backlogs: parseInt(academicData.backlogs, 10), // Convert to number
          },
        },
      },
      address: {
        address_line: addressData.fullAddressLine,
        area: addressData.area,
        city: addressData.city,
        state: addressData.state,
        country: addressData.country,
        pincode: parseInt(addressData.pinCode, 10), // Convert to number
      },
    };

    // Remove keys with 'undefined' values
    if (!restructuredData.academic_details.result.hsc) {
      delete restructuredData.academic_details.result.hsc;
    }
    if (!restructuredData.academic_details.result.diploma) {
      delete restructuredData.academic_details.result.diploma;
    }

    console.log('Final data to be sent:', restructuredData);
    // --- END: Data Restructuring ---

    try {
      // Send restructured data to the backend
      const res = await fetch('http://localhost:5000/api/v1/student/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restructuredData),
      });

const data = await res.json();

if (res.ok) {
  console.log('✅ Profile created successfully:', data);


  localStorage.setItem("accessToken", data.data.tokens.accessToken);
  localStorage.setItem("refreshToken", data.data.tokens.refreshToken);

  localStorage.setItem("student", JSON.stringify(data.data.student));

  console.log( data.data.tokens.accessToken)
  setAccessToken(data.data.tokens.accessToken);
  setRefreshToken(data.data.tokens.refreshToken);

  // Redirect
  router.push('/studentdashboard');
} else {
  console.error('❌ Failed to create profile:', data);
  // Show error message
}

    } catch (error) {
      console.error('❌ Network error or API call failed:', error);
    }
  };

  // Load user data from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('google-user');
    const storedToken = localStorage.getItem('google-token');
    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser) as CustomJwtPayload;
      setUser(parsedUser);
      setToken(storedToken);
      setFormData((prev) => ({
        ...prev,
        name: parsedUser.name || '',
        email: parsedUser.email || '',
      }));
    }
  }, []);

  // Calculate number of semesters based on passout year
  const calculateSemesters = (passoutYear: string): number => {
    const currentYear = new Date().getFullYear(); // Get current year dynamically
    const passout = parseInt(passoutYear, 10);
    if (isNaN(passout) || passout < currentYear) {
      return 8; // Assume all semesters completed if passout year is in the past or invalid
    }
    const yearsRemaining = passout - currentYear;
    // Assuming 2 semesters per year, and a total of 8 semesters for a 4-year degree
    // Adjust logic if degree duration is different or semester calculation needs refinement
    return Math.max(2, 8 - yearsRemaining * 2); // At least 2 semesters, up to 8
  };

  // Update semesterResults array when passoutYear changes
  useEffect(() => {
    if (academicData.passoutYear) {
      const numSemesters = calculateSemesters(academicData.passoutYear);
      const currentResults = academicData.semesterResults || [];
      const updatedResults = Array(numSemesters).fill('');
      for (let i = 0; i < Math.min(currentResults.length, numSemesters); i++) {
        updatedResults[i] = currentResults[i] || '';
      }
      setAcademicData((prev) => ({ ...prev, semesterResults: updatedResults }));
    }
  }, [academicData.passoutYear]);

  // Animation variants for form sections
  const formVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
    exit: { opacity: 0, x: 50, transition: { duration: 0.3, ease: "easeIn" } },
  };

  return (
    <div className="min-h-screen flex font-inter">
      {/* Overlay Login Prompt */}
      {!user && (
        <motion.div
          className="fixed inset-0 z-[10000] flex justify-center items-center backdrop-blur-md bg-black/20"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="bg-white/95 p-8 rounded-3xl shadow-2xl max-w-lg w-full mx-4 text-center border-b-4 border-blue-600">
            <motion.h1
              className="text-4xl md:text-5xl font-extrabold text-blue-700 mb-4"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              🚨 Please Sign In First
            </motion.h1>
            <motion.p
              className="text-gray-600 mb-8 max-w-md mx-auto text-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              To continue creating your student profile, sign in with your SCET Google account and unlock your personalized placement journey.
            </motion.p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex justify-center"
            >
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log('❌ Login Failed')} />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Left 60% - Form Section */}
      <div className="w-full lg:w-3/5 bg-white flex items-center justify-center p-4 lg:p-8 relative z-10 my-8">
        <motion.div
          className="w-full max-w-2xl mx-auto p-6 sm:p-8 bg-white shadow-2xl rounded-3xl space-y-6 transform transition-all duration-500 ease-in-out border-b-4 border-blue-600"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: user ? 0.2 : 1.2 }} // Delay appearance if login overlay is shown
        >
          <h2 className="text-3xl font-extrabold text-blue-800 mb-6 text-center">
            {currentStep === 1 ? 'Personal Details' : currentStep === 2 ? 'Address Details' : 'Academic Details'}
          </h2>

          <AnimatePresence mode="wait">
            {/* Personal Details Section */}
            {currentStep === 1 && (
              <motion.form
                key="personal-form"
                onSubmit={(e) => e.preventDefault()}
                className="space-y-5"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                  />
                </div>
                 {/* <div>
                  <label htmlFor="resume" className="block text-sm font-semibold text-gray-700 mb-1">
                    Resume
                  </label>
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    value={formData.resume}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                  />
                </div> */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    placeholder="Email"
                  />
                </div>
                <div>
                  <label htmlFor="enrollment_no" className="block text-sm font-semibold text-gray-700 mb-1">
                    enrollment Number
                  </label>
                  <input
                    type="text"
                    id="enrollment_no"
                    name="enrollment_no"
                    value={formData.enrollment_no}
                    onChange={handleChange}
                    placeholder="enrollment_no "
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                  />
                </div>
                <div>
                  <label htmlFor="dob" className="block text-sm font-semibold text-gray-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dob"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                  />
                </div>
                <div>
                  <label htmlFor="contact" className="block text-sm font-semibold text-gray-700 mb-1">
                    Contact Number
                  </label>
                  <input
                    type="tel"
                    id="contact"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    placeholder="Contact Number"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                  />
                </div>
                <div>
                  <label htmlFor="gender" className="block text-sm font-semibold text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="caste" className="block text-sm font-semibold text-gray-700 mb-1">
                    Caste
                  </label>
                  <select
                    id="caste"
                    name="caste"
                    value={formData.caste}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                  >
                    <option value="">Select Caste</option>
                    <option value="General">General</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="OBC">OBC</option>
                    <option value="SEBC">SEBC</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddress(true)}
                  className="w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
                >
                  Next
                </button>
              </motion.form>
            )}

            {/* Address Details Section */}
            {currentStep === 2 && (
              <motion.form
                key="address-form"
                onSubmit={(e) => e.preventDefault()}
                className="space-y-5"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div>
                  <label htmlFor="fullAddressLine" className="block text-sm font-semibold text-gray-700 mb-1">
                    Full Address Line
                  </label>
                  <input
                    type="text"
                    id="fullAddressLine"
                    name="fullAddressLine"
                    value={addressData.fullAddressLine}
                    onChange={handleAddressChange}
                    placeholder="Full Address Line"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
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
                  />
                </div>
                <div>
                  <label htmlFor="pinCode" className="block text-sm font-semibold text-gray-700 mb-1">
                    Pin Code
                  </label>
                  <input
                    type="text"
                    id="pinCode"
                    name="pinCode"
                    value={addressData.pinCode}
                    onChange={handleAddressChange}
                    placeholder="Pin Code"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowAddress(false)}
                    className="w-full py-3 px-6 bg-gray-300 text-gray-800 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddress(false);
                      setShowAcademic(true);
                    }}
                    className="w-full py-3 px-6 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
                  >
                    Next
                  </button>
                </div>
              </motion.form>
            )}

            {/* Academic Details Section */}
            {currentStep === 3 && (
              <motion.form
                key="academic-form"
                onSubmit={handleSubmit}
                className="space-y-5"
                variants={formVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <div>
                  <label htmlFor="passoutYear" className="block text-sm font-semibold text-gray-700 mb-1">
                    Degree Passout Year
                  </label>
                  <input
                    type="number"
                    id="passoutYear"
                    name="passoutYear"
                    value={academicData.passoutYear}
                    onChange={handleAcademicChange}
                    placeholder="Passout Year (e.g., 2025)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {academicData.semesterResults.map((result, index) => (
                    <div key={index}>
                      <label htmlFor={`semester${index + 1}`} className="block text-sm font-semibold text-gray-700 mb-1">
                        Sem {index + 1} SPI
                      </label>
                      <input
                        type="text"
                        id={`semester${index + 1}`}
                        value={result}
                        onChange={(e) => handleSemesterChange(index, e.target.value)}
                        placeholder={`Sem ${index + 1} SPI`}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label htmlFor="tenthResult" className="block text-sm font-semibold text-gray-700 mb-1">
                    10th Result (e.g., Percentage)
                  </label>
                  <input
                    type="text"
                    id="tenthResult"
                    name="tenthResult"
                    value={academicData.tenthResult}
                    onChange={handleAcademicChange}
                    placeholder="10th Result"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                  />
                </div>
                <div>
                  <label htmlFor="tenthPassoutYear" className="block text-sm font-semibold text-gray-700 mb-1">
                    10th Passout Year
                  </label>
                  <input
                    type="number"
                    id="tenthPassoutYear"
                    name="tenthPassoutYear"
                    value={academicData.tenthPassoutYear}
                    onChange={handleAcademicChange}
                    placeholder="10th Passout Year (e.g., 2018)"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Additional Qualification</label>
                  <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="qualificationTwelfth"
                        name="qualificationType"
                        value="twelfth"
                        checked={academicData.qualificationType === 'twelfth'}
                        onChange={handleQualificationChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="qualificationTwelfth" className="text-sm font-medium text-gray-700">
                        Completed 12th Grade
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="qualificationDiploma"
                        name="qualificationType"
                        value="diploma"
                        checked={academicData.qualificationType === 'diploma'}
                        onChange={handleQualificationChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="qualificationDiploma" className="text-sm font-medium text-gray-700">
                        Completed Diploma
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="qualificationNone"
                        name="qualificationType"
                        value=""
                        checked={academicData.qualificationType === ''}
                        onChange={handleQualificationChange}
                        className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                      />
                      <label htmlFor="qualificationNone" className="text-sm font-medium text-gray-700">
                        None
                      </label>
                    </div>
                  </div>
                </div>
                {academicData.qualificationType === 'twelfth' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5 overflow-hidden"
                  >
                    <div>
                      <label htmlFor="twelfthResult" className="block text-sm font-semibold text-gray-700 mb-1">
                        12th Result (e.g., Percentage)
                      </label>
                      <input
                        type="text"
                        id="twelfthResult"
                        name="twelfthResult"
                        value={academicData.twelfthResult}
                        onChange={handleAcademicChange}
                        placeholder="12th Result"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label htmlFor="twelfthPassoutYear" className="block text-sm font-semibold text-gray-700 mb-1">
                        12th Passout Year
                      </label>
                      <input
                        type="number"
                        id="twelfthPassoutYear"
                        name="twelfthPassoutYear"
                        value={academicData.twelfthPassoutYear}
                        onChange={handleAcademicChange}
                        placeholder="12th Passout Year (e.g., 2020)"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                      />
                    </div>
                  </motion.div>
                )}
                {academicData.qualificationType === 'diploma' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    transition={{ duration: 0.3 }}
                    className="space-y-5 overflow-hidden"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {academicData.diplomaSemesterResults.map((result, index) => (
                        <div key={index}>
                          <label htmlFor={`diplomaSemester${index + 1}`} className="block text-sm font-semibold text-gray-700 mb-1">
                            Diploma Sem {index + 1} SPI
                          </label>
                          <input
                            type="text"
                            id={`diplomaSemester${index + 1}`}
                            value={result}
                            onChange={(e) => handleDiplomaSemesterChange(index, e.target.value)}
                            placeholder={`Diploma Sem ${index + 1} SPI`}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                          />
                        </div>
                      ))}
                    </div>
                    <div>
                      <label htmlFor="diplomaPassoutYear" className="block text-sm font-semibold text-gray-700 mb-1">
                        Diploma Passout Year
                      </label>
                      <input
                        type="number"
                        id="diplomaPassoutYear"
                        name="diplomaPassoutYear"
                        value={academicData.diplomaPassoutYear}
                        onChange={handleAcademicChange}
                        placeholder="Diploma Passout Year (e.g., 2020)"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                      />
                    </div>
                  </motion.div>
                )}
                <div>
                  <label htmlFor="cgpa" className="block text-sm font-semibold text-gray-700 mb-1">
                    Overall CGPA
                  </label>
                  <input
                    type="text"
                    id="cgpa"
                    name="cgpa"
                    value={academicData.cgpa}
                    onChange={handleAcademicChange}
                    placeholder="Overall CGPA"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                  />
                </div>
                <div>
                  <label htmlFor="backlogs" className="block text-sm font-semibold text-gray-700 mb-1">
                    Number of Backlogs
                  </label>
                  <input
                    type="text"
                    id="backlogs"
                    name="backlogs"
                    value={academicData.backlogs}
                    onChange={handleAcademicChange}
                    placeholder="Backlogs"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-gray-800 bg-gray-50"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddress(true);
                      setShowAcademic(false);
                    }}
                    className="w-full py-3 px-6 bg-gray-300 text-gray-800 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="w-full py-3 px-6 bg-green-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition duration-300 ease-in-out"
                  >
                    Submit Profile
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Right 40% - Image & Stepper Section */}
      <div className="hidden lg:flex lg:w-2/5 bg-gradient-to-br from-blue-500 to-blue-700 flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* Dynamic Image */}
        <motion.img
          key={currentStep} // Key changes to re-trigger animation on step change
          src={stepImages[currentStep]}
          alt={`Step ${currentStep} illustration`}
          className="w-full  h-auto rounded-xl  object-contain"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          onError={(e) => {
            e.currentTarget.onerror = null; // prevents looping
            e.currentTarget.src = `https://placehold.co/600x800/2563EB/FFFFFF?text=Image+Error`; // Fallback image
          }}
        />

        {/* Stepper Indicator */}
        <div className="flex space-x-4 mt-12">
          {[1, 2, 3].map((stepNum) => (
            <div
              key={stepNum}
              className={`w-5 h-5 rounded-full transition-all duration-300 ease-in-out flex items-center justify-center
                ${currentStep === stepNum ? 'bg-white scale-125 shadow-md' : 'bg-blue-300'}
              `}
            >
              {currentStep > stepNum && (
                <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              )}
            </div>
          ))}
        </div>
        <div className="text-white text-lg font-semibold mt-4">
          Step {currentStep} of 3
        </div>
      </div>
    </div>
  );
};

export default Createprofile;
