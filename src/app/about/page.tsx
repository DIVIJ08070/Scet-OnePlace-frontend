'use client';
import React from 'react';

// Placeholder for Navbar - replace with your actual Navbar component
const Navbar = () => (
  <nav className="bg-white shadow-md p-4 fixed top-0 left-0 w-full z-10">
    {/* Your Navbar content goes here */}
    <div className="text-gray-800 font-bold">T&P Portal</div>
  </nav>
);

// Placeholder for Header - replace with your actual Header component
const Header = ({ title, text }: { title: string; text: string }) => (
  <header className="pt-24">
    <div className="max-w-6xl mx-auto bg-blue-600 text-white p-8 text-center rounded-2xl">
      <h1 className="text-4xl font-extrabold mb-2">{title}</h1>
      <p className="max-w-3xl mx-auto">{text}</p>
    </div>
  </header>
);

const AboutContainer = () => (
  <div className="w-full max-w-6xl mx-auto bg-white my-8 rounded-2xl p-8 md:p-12 border border-gray-200 shadow-lg">
    <div className="w-full mx-auto">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center text-blue-800">About Training & Placement</h1>
      <hr className=" h-1 bg-blue-500 mx-auto my-4 rounded" />
      <div className="text-gray-600 space-y-4 text-base md:text-lg">
        <p>The Department of Training and Placement (T&P) at Sarvajanik College of Engineering and Technology (SCET), Surat, has a comprehensive approach towards providing career guidance, counselling for higher studies, pre-placement training, and placement support.</p>
        <p>The T&P cell at SCET Surat aligns with the guidelines provided by the National Board of Accreditation (NBA). About 500 students graduate every year from SCET campus. Out of these, about 60% of students go for placements through T&P. Remaining students opt for higher studies or their personal ventures.</p>
        
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 pt-6 border-b-2 border-gray-200 pb-2">Our Activities</h2>
        
        <div className="space-y-8 mt-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-blue-700">Infrastructure</h3>
            <p className="mt-2">The T & P Cell is well equipped with excellent infrastructure to support each and every stage of the placement processes. Training and placement department has independent computer terminals with internet connection. Independent office with notice boards & easy access to interview room & state of the art Seminar Hall We send invitation letters / emails with all the details to more than 700 companies to carry recruitment drives from our college and for vocational training or internships.</p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-blue-700">Career Guidance Facilities</h3>
            <p className="mt-2">The T&P cell at SCET Surat provides various facilities for career guidance to help students make informed career choices. The department conducts career guidance sessions to provide students with information regarding various career paths and opportunities available in the market.</p>
            <p>The cell also provides students with access to various books and resources related to placement and career guidance.</p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-blue-700">Counselling for Higher Studies</h3>
            <p className="mt-2">The T&P cell at SCET Surat provides counselling for higher studies to guide students who want to pursue higher education. T&P provides ample opportunities for development of Soft skills to its students. Many courses have mandatory class room presentations and group discussion components which help improve communication skill & Personality development. Career guidance programs are conducted to develop the student’s communication skills in order to prepare them to face interviews in any walk of life.</p>
            <p>The cell provides guidance and resources related to various competitive exams like GATE, GRE, GMAT, etc. to help students prepare for the exams.</p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-blue-700">Pre-Placement Training</h3>
            <p className="mt-2">The T&P cell at SCET Surat provides various pre-placement training programs to enhance the employability skills of students. The cell conducts workshops, seminars, and guest lectures on topics like resume building, interview skills, communication skills, aptitude, and technical skills. The cell also provides guidance to students on higher competitive exams, and entrepreneurship.</p>
          </div>

          <div>
            <h3 className="text-xl md:text-2xl font-bold text-blue-700">Placement Process and Support</h3>
            <p className="mt-2">The T&P cell at SCET Surat is committed to providing students with the best possible opportunities and guidance to help them achieve their career goals. The T&P cell at SCET Surat has a well-structured placement process and provides support to students throughout the placement process upto the joining date and after. The placement support process includes but not restricted to:</p>
            <ul className="list-disc list-inside pl-4 space-y-2 mt-2">
              <li>Announcing Campus Recruitment of a particular Organisation.</li>
              <li>Providing list of applicants with details to organizations for scrutiny.</li>
              <li>Co-ordination between organizations & college / department for planning and execution of campus recruitment drive which includes PPT, Online/Offline Tests, GD, interview, etc.</li>
            </ul>
            <p className="mt-4">The department maintains a strong relationship with various industries, corporate companies, and startups, across various domains, which helps in providing the students with ample opportunities for internships, projects, and placements.</p>
            <p>The cell has a strong track record of successful placements in various reputed companies such as Reliance, AMNS, L&T, TCS, Wipro, L&T Infosys, and many more. The list of our recruiters is available on our website.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AboutPage = () => (
  <div className="min-h-screen w-full bg-white bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.1)_0,rgba(0,163,255,0)_100%)]">
    <Navbar />
    <Header
      title="ABOUT"
      text="Welcome to our placement portal, where we connect students with top employers. We provide tailored career opportunities, resources, and guidance to help students transition smoothly from academia to industry."
    />
    <AboutContainer />
  </div>
);

export default AboutPage;

