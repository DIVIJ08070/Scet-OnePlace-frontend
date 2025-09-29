'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Calendar, BookOpen, Award } from 'lucide-react';
import API, { setAxiosToken } from '../components/libs/axios';




interface FormData {
  name: string;
  profileImage:string;
  resume:string;
  email: string;
  enrollment: string;
  dob: string;
  contact: string;
  gender: string;
  caste: string;
  profileImageUrl: string;
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
  semesterResults: string[]; // Degree SPI
  tenthResult: string;
  tenthPassoutYear: string;
  qualificationType: 'twelfth' | 'diploma' | '';
  twelfthResult?: string;
  twelfthPassoutYear?: string;
  diplomaSemesterResults?: string[];
  diplomaPassoutYear?: string;
  cgpa: string;
  backlogs: string;
}

type StudentProfile = FormData & AddressData & AcademicData;

const UserProfile = () => {
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {

      const token = localStorage.getItem('accessToken');
  if (token) setAxiosToken(token);
  console.log('Access Token:', localStorage.getItem('accessToken'));
console.log('Fetching student profile...');

    const fetchStudent = async () => {
      try {
        const res = await API.get('/api/v1/me/');
        if (res.status !== 200) throw new Error('Failed to fetch student data');
        const data = res.data.data.user;

        const result = data.academic_details.result;

        // Map diploma semester results if available
        const diplomaResults = result.diploma?.result
          ? Object.entries(result.diploma.result)
              .filter(([key]) => key.startsWith('sem'))
              .sort(([a], [b]) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')))
              .map(([_, value]) => value.toString())
          : [];

        const studentProfile: StudentProfile = {
          name: data.name,
          profileImage:data.profileImage,
          resume:data.resume,
          email: data.email,
          enrollment: data.enrollment_no,
          dob: new Date(data.dob).toLocaleDateString(),
          contact: data.contact,
          gender: data.gender,
          caste: data.caste,
          profileImageUrl: '/default-profile.png',

          fullAddressLine: data.address.address_line,
          area: data.address.area,
          city: data.address.city,
          state: data.address.state,
          country: data.address.country,
          pinCode: data.address.pincode.toString(),

          passoutYear: data.academic_details.passout_year.toString(),
          semesterResults: result.degree?.result
         ? Object.entries(result.degree.result)
          .filter(([key]) => key.startsWith('sem'))
          .sort(([a], [b]) => parseInt(a.replace(/\D/g, '')) - parseInt(b.replace(/\D/g, '')))
          .map(([_, value]) => value.toString())
          : [],


          tenthResult: result.ssc?.percentage ? `${result.ssc.percentage}%` : '',
          tenthPassoutYear: result.ssc?.completion_year?.toString() || '',

          qualificationType: result.diploma ? 'diploma' : result.hsc ? 'twelfth' : '',

          twelfthResult: result.hsc?.percentage ? `${result.hsc.percentage}%` : '',
          twelfthPassoutYear: result.hsc?.completion_year?.toString() || '',

          diplomaSemesterResults: diplomaResults,
          diplomaPassoutYear: result.diploma?.completion_year?.toString() || '',



          cgpa: result.degree?.cgpa.toString() || "NA", 
          backlogs: result.degree?.backlogs || "NA", 
        };

        setStudent(studentProfile);
      } catch (error) {
        console.error('Failed to fetch student data:', error);
        setError('Unable to load profile. Please try again later.');
      }
    };

    fetchStudent();
  }, []);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (error) return <div className="p-10 text-red-600">{error}</div>;
  if (!student) return <div className="p-10">Loading Profile...</div>;


  return (
    <div className="min-h-screen bg-gray-50 font-inter p-4 sm:p-6 lg:p-8 my-10">
      <motion.div
        className="max-w-7xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden"
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.1 }}
      >
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-8 relative">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <motion.img
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg"
              src={student.profileImageUrl}
              alt="Profile Picture"
              variants={fadeIn}
            />
            <motion.div variants={fadeIn} className="text-center sm:text-left">
              <h1 className="text-4xl font-extrabold text-white">{student.name}</h1>
              <p className="text-blue-200 text-lg font-medium">{student.enrollment}</p>
            </motion.div>
          </div>
        </div>

        {/* Profile Body */}
        <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact + Personal */}
          <motion.div className="lg:col-span-1 space-y-8" variants={fadeIn}>
            <div className="p-6 bg-gray-50 rounded-2xl border">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Contact Information</h3>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center">
                  <Mail className="w-5 h-5 mr-3 text-blue-500" />
                  {student.email}
                </div>
                <div className="flex items-center">
                  <Phone className="w-5 h-5 mr-3 text-blue-500" />
                  {student.contact}
                </div>
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 mr-3 text-blue-500 mt-1" />
                  <span>{`${student.fullAddressLine}, ${student.area}, ${student.city}, ${student.state}, ${student.country} - ${student.pinCode}`}</span>
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 rounded-2xl border">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Personal Details</h3>
              <div className="space-y-3 text-gray-600">
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-3 text-blue-500" />
                  <strong>DOB:</strong> {student.dob}
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-5 h-5 mr-3 text-blue-500" />
                  <strong>Gender:</strong> {student.gender}
                </div>
                <div className="flex items-center">
                  <Award className="w-5 h-5 mr-3 text-blue-500" />
                  <strong>Caste:</strong> {student.caste}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Academic Details */}
          <motion.div className="lg:col-span-2 space-y-8" variants={fadeIn}>
            <div className="p-6 bg-gray-50 rounded-2xl border">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Academic Record</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-center">
                <div className="bg-blue-100 p-4 rounded-lg">
                  <p className="text-sm text-blue-800 font-semibold">CGPA</p>
                  <p className="text-2xl font-bold text-blue-600">{student.cgpa}</p>
                </div>
                <div className="bg-green-100 p-4 rounded-lg">
                  <p className="text-sm text-green-800 font-semibold">Backlogs</p>
                  <p className="text-2xl font-bold text-green-600">{student.backlogs}</p>
                </div>
                <div className="bg-indigo-100 p-4 rounded-lg">
                  <p className="text-sm text-indigo-800 font-semibold">Passout Year</p>
                  <p className="text-2xl font-bold text-indigo-600">{student.passoutYear}</p>
                </div>
                <div className="bg-yellow-100 p-4 rounded-lg">
                  <p className="text-sm text-yellow-800 font-semibold">10th Result</p>
                  <p className="text-2xl font-bold text-yellow-600">{student.tenthResult}</p>
                </div>
              </div>

              {/* Degree SPI */}
              {student.semesterResults.length > 0 && (
                <div className="mb-8">
                  <h4 className="font-bold text-gray-700 mb-3">Degree Semester Performance (SPI)</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {student.semesterResults.map((spi, index) => (
                      <div key={index} className="border p-3 rounded-lg text-center">
                        <p className="text-xs font-semibold text-gray-500">Sem {index + 1}</p>
                        <p className="text-lg font-bold text-gray-700">{spi}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 12th or Diploma */}
              <div className="space-y-4">
                {student.qualificationType === 'twelfth' && (
                  <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
                    <div>
                      <p className="font-bold text-gray-800">12th Grade</p>
                      <p className="text-sm text-gray-500">Passout Year: {student.twelfthPassoutYear}</p>
                    </div>
                    <p className="text-lg font-bold text-blue-600">{student.twelfthResult}</p>
                  </div>
                )}

                {student.qualificationType === 'diploma' && student.diplomaSemesterResults && (
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-gray-800">Diploma</p>
                        <p className="text-sm text-gray-500">Passout Year: {student.diplomaPassoutYear || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {student.diplomaSemesterResults.map((spi, index) => (
                        <div key={index} className="border p-2 rounded-md text-center bg-gray-50">
                          <p className="text-xs font-semibold text-gray-500">Sem {index + 1}</p>
                          <p className="text-md font-bold text-gray-700">{spi}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile;