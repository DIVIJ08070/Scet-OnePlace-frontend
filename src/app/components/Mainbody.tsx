'use client';
import React from 'react';
import { motion, Variants, Transition } from 'framer-motion';
import Createprofile from '../createprofile/page';
import { useRouter } from 'next/navigation';
import { useToken } from '../components/context/TokenContext';
import API from './libs/axios';



// Define easing as a valid Easing type
type Easing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';

// Container variants for staggering child animations
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

// Variants for text elements (h2, h1, h3, p)
const textVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as Easing,
    },
  },
};

// Variants for buttons
const buttonVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as Easing,
    },
  },
  hover: {
    scale: 1.05,
    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
    transition: {
      duration: 0.3,
      ease: 'easeOut' as Easing,
    },
  },
  tap: { scale: 0.95 },
};

// Variants for image
const imageVariants: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut' as Easing,
    },
  },
};

// const loginstructure = { "googleId" : token }

const Jwtloginid = async (token: string | null) => {
  if (!token) return;

  try {
    const res = await API.post('/api/v1/auth/login', {googleId:  token }); // match backend schema
    console.log('✅ JWT login success:', res.data);
    const JwtToken = res.data.tokens
  } catch (err) {
    console.error('❌ JWT login failed:', err);
  }
};

const MainBody = () => {
  const { token, setAccessToken, setRefreshToken } = useToken();
  const router = useRouter();

  const Jwtloginid = async (token:string|null) => {
    if (!token) return;

    try {
      const res = await API.post('/api/v1/auth/login', {
        googleId: token,
      });

      console.log('✅ JWT login success:', res.data);

      const { accessToken, refreshToken } = res.data.data.tokens;

      // Save tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
       router.push('/profile');

      console.log(accessToken);
      console.log(refreshToken);
    } catch (err) {
      console.error('❌ JWT login failed:', err);
    }
  };
  return (
    <div className="relative z-0 min-h-screen w-full overflow-x-hidden bg-white bg-[radial-gradient(100%_50%_at_50%_0%,rgba(0,163,255,0.60)_0,rgba(0,163,255,0.1)_50%,rgba(0,163,255,0)_100%)]">
      <motion.section
        className="flex flex-col-reverse md:flex-row p-4 md:p-10 pt-16 md:pt-20 h-full max-w-full"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
      >
        <div className="flex-1 flex flex-col justify-center md:ml-4 px-4 md:px-0 overflow-x-hidden">
          <motion.h2
            className="text-xl md:text-3xl mb-2 md:mb-3 mt-4 md:mt-8 text-black font-manrope font-bold"
            variants={textVariants}
          >
            Welcome to
          </motion.h2>
          <motion.h1
            className="text-5xl md:text-8xl font-inter font-bold mb-2 md:mb-4 leading-tight bg-gradient-to-r from-[#0e1b38] to-[#0087f5] text-transparent bg-clip-text"
            variants={textVariants}
          >
            SCET <span className="text-transparent">OnePlace</span>
          </motion.h1>
          <motion.h3
            className="text-xl md:text-3xl font-semibold mb-3 md:mb-4 text-black"
            variants={textVariants}
          >
            Streamlining Campus Placements for<br className="md:hidden" /> SCET Students, Recruiters, and TNP.
          </motion.h3>
          <motion.p
            className="text-base md:text-xl mb-6 md:mb-8 text-gray-600"
            variants={textVariants}
          >
            A digital initiative by the SCET TNP Department to enhance<br className="md:hidden" /> campus placement outcomes through smart, structured, and<br className="md:hidden" /> accessible tools.
          </motion.p>
          <motion.div
            className="flex gap-4 md:gap-6 p-2 md:p-4 relative"
            variants={containerVariants}
          >
            <motion.button
              onClick={() => router.push('/createprofile')}
              className="w-28 md:w-32 h-10 rounded-lg bg-blue-600 text-white font-semibold transition-transform transform shadow-md text-sm md:text-base"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Create Profile
            </motion.button>
            <motion.button
              className="w-28 md:w-32 h-10 rounded-lg bg-green-600 text-white font-semibold transition-transform transform shadow-md text-sm md:text-base"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={() => Jwtloginid(token)} // ✅ correct – only runs on click


            >
              Signin
            </motion.button>
          </motion.div>
        </div>
        <motion.div
          className="flex-1 flex items-center justify-center mt-8 md:mt-0 overflow-x-hidden"
          variants={imageVariants}
        >
          <motion.img
            src="iso.png"
            alt="Hero"
            className="w-full h-auto max-h-[70vh] md:max-h-[100%] object-contain"
            variants={imageVariants}
          />
        </motion.div>
      </motion.section>
    </div>
  );
};

export default MainBody;