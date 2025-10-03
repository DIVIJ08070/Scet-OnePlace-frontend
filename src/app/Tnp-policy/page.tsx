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

const TnPPContainer = () => (
  <div className="w-full max-w-6xl mx-auto bg-white my-8 rounded-2xl p-8 md:p-12 border border-gray-200 shadow-lg">
    <div className="w-full mx-auto">
      <h1 className="text-3xl md:text-4xl font-extrabold text-center text-blue-800">Student’s T&P Policy</h1>
      <hr className="h-1 bg-blue-500 mx-auto my-4 rounded" />
      <div className="text-gray-600 space-y-4 text-base md:text-lg">
        <div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-800">GOAL:</h3>
          <p className="mt-2">The aim of these rules is to ensure that students who are not serious about job placements do not waste opportunities that could have gone to more committed candidates. These rules will help to maintain professionalism and ethics during the campus placement process at SCET.</p>
        </div>

        <div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-800">RULES:</h3>
          <ol className="list-decimal list-inside space-y-4 mt-2">
            <li>Only students registered with the Training and Placement (T&P) Cell at SCET can apply for and participate in the logical process of on-campus placements for any of the companies that visit the campus.</li>
            <li>Students must follow all professional ethics and maintain appropriate dress codes during campus interviews.</li>
            <li>Once a campus placement has been announced, students must register themselves via the online form which would be shared via email and WhatsApp. It is compulsory for the registered students to attend the online or offline pre-placement talk (PPT) of that company.</li>
            <li>Once the job description, salary, bond, location, etc. are clear, the student must decide whether they want to participate in the logical process of the campus interview.</li>
            <li>Once a student has started the logical process of the campus interview, they cannot withdraw themselves before the entire process has been completed.</li>
            <li>If selected, the student must join the company on the date and time given by the company.</li>
            <li>All companies that visit the campus will be classified into three categories, namely A, B, and C, based on the annual package they offer. Category A companies offer an annual package of Rs. 4 lakhs or above, category B companies offer between Rs. 2.5 lakh to 4 lakh, and category C companies offer less than Rs. 2.5 lakh PA. Students who are selected by a category C company can participate in the campus placements of category A or B companies. Therefore, withdrawing from a category C company, if selected by a category A or B company, will not be considered a violation of rule 5.</li>
            <li>If a student registered with the T&P Cell applies for further studies or a job off-campus, it is their duty to inform the Training and Placement Officer (TPO) before participating in the PPT of any company.</li>
            <li>If the student mentioned in the above rule is selected off-campus or gets admission for further studies and wants to pursue it, they must inform the TPO and provide confirmation. After this, the student will not be considered guilty of any violation.</li>
            <li>If a company delays in providing a joining letter to an on-campus selected student, the T&P Cell will not be responsible for it.</li>
            <li>If a student violates any of the rules, the T&P Cell reserves the right to take appropriate action.</li>
            <li>The decision taken by the TPO in consultation with the HOS & the Principal will be considered final.</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
);


const TnpPage = () => (
  <div className="min-h-screen w-full bg-white bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.1)_0,rgba(0,163,255,0)_100%)]">
    <Navbar />
    <Header
      title="T&P POLICY"
      text="Our Training and Placement Policy ensures a transparent and efficient process for all students. We provide guidelines and support to help you prepare for and secure top job opportunities with leading employers."
    />
    <TnPPContainer />
  </div>
);

export default TnpPage;
