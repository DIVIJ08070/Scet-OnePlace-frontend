'use client';
import React, { useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useToken } from '../components/context/TokenContext';
import { GoogleLogin } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode';

// ✅ Types
type Easing = 'linear' | 'easeIn' | 'easeOut' | 'easeInOut';
interface GoogleJwtPayload {
  sub: string; // Google ID
  name: string;
  email: string;
  picture?: string;
}

// ✅ Animations
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const textVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as Easing } },
};

const buttonVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' as Easing } },
  hover: { scale: 1.05, boxShadow: '0px 4px 15px rgba(0,0,0,0.2)', transition: { duration: 0.3 } },
  tap: { scale: 0.95 },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut' as Easing } },
};

const MainBody = () => {
  const { setAccessToken, setRefreshToken, token } = useToken();
  const router = useRouter();
  const [showAdminForm, setShowAdminForm] = useState(false);

  // ✅ Student login (JWT login with backend)
  const Jwtloginid = async (token: string | null) => {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:5000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleId: token }),
      });

      const data = await res.json();
      if (res.ok) {
        const { accessToken, refreshToken } = data.data.tokens;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);

        router.push('/studentdashboard');
      } else {
        console.error('❌ JWT login failed:', data);
      }
    } catch (err) {
      console.error('❌ Network error in student login:', err);
    }
  };

  // ✅ Admin login via Google
  const handleGoogleAdminLogin = async (credentialResponse: any) => {
    try {
      if (!credentialResponse.credential) return;

      // Decode JWT from Google
      const decoded: GoogleJwtPayload = jwtDecode(credentialResponse.credential);
      console.log('✅ Google Admin decoded:', decoded);
      const idToken = credentialResponse.credential;

      const restructuredData = {
        name: decoded.name,
        email: decoded.email,
        googleId: idToken,
      };

      // Send to backend
      const res = await fetch('http://localhost:5000/api/v1/admin/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restructuredData),
      });

      const data = await res.json();

      if (res.ok) {
        console.log('✅ Admin login success:', data);

        localStorage.setItem('adminAccessToken', data.data.tokens.accessToken);
        localStorage.setItem('adminRefreshToken', data.data.tokens.refreshToken);

        if (data.data.admin) {
          localStorage.setItem('admin', JSON.stringify(data.data.admin));
        }

        setAccessToken(data.data.tokens.accessToken);
        setRefreshToken(data.data.tokens.refreshToken);

        router.push('/dashboard');
      } else {
        console.error('❌ Failed to add admin:', data);
        alert(data.message || 'Admin login failed');
      }
    } catch (error) {
      console.error('❌ Google Admin login error:', error);
      alert('Something went wrong with Google login.');
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
        {/* Left Side Text */}
        <div className="flex-1 flex flex-col justify-center md:ml-4 px-4 md:px-0">
          <motion.h2 className="text-xl md:text-3xl mb-2 md:mb-3 text-black font-bold" variants={textVariants}>
            Welcome to
          </motion.h2>
          <motion.h1
            className="text-5xl md:text-8xl font-bold mb-2 md:mb-4 leading-tight bg-gradient-to-r from-[#0e1b38] to-[#0087f5] text-transparent bg-clip-text"
            variants={textVariants}
          >
            SCET <span className="text-transparent">OnePlace</span>
          </motion.h1>
          <motion.h3 className="text-xl md:text-3xl font-semibold mb-4 text-black" variants={textVariants}>
            Streamlining Campus Placements for Students, Recruiters, and TNP.
          </motion.h3>
          <motion.p className="text-base md:text-xl mb-8 text-gray-600" variants={textVariants}>
            A digital initiative by the SCET TNP Department to enhance placement outcomes through smart,
            structured, and accessible tools.
          </motion.p>

          {/* Buttons */}
          <motion.div className="flex gap-4 md:gap-6" variants={containerVariants}>
            <motion.button
              onClick={() => router.push('/createprofile')}
              className="w-28 md:w-32 h-10 rounded-lg bg-blue-600 text-white font-semibold shadow-md"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Create Profile
            </motion.button>

            <motion.button
              onClick={() => Jwtloginid(token)}
              className="w-28 md:w-32 h-10 rounded-lg bg-green-600 text-white font-semibold shadow-md"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Sign in
            </motion.button>

            <motion.button
              onClick={() => setShowAdminForm(true)}
              className="w-36 h-10 rounded-lg bg-purple-600 text-white font-semibold shadow-md"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Admin Login
            </motion.button>
          </motion.div>
        </div>

        {/* Right Side Image */}
        <motion.div className="flex-1 flex items-center justify-center mt-8 md:mt-0" variants={imageVariants}>
          <motion.img
            src="iso.png"
            alt="Hero"
            className="w-full h-auto max-h-[70vh] md:max-h-[100%] object-contain"
          />
        </motion.div>
      </motion.section>

      {/* ✅ Admin Modal (Google Login) */}
      {showAdminForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[90%] max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4 text-purple-700">Admin Login</h2>
            <GoogleLogin
              onSuccess={handleGoogleAdminLogin}
              onError={() => console.log('❌ Admin Google Login Failed')}
            />
            <button
              type="button"
              onClick={() => setShowAdminForm(false)}
              className="mt-4 text-sm text-gray-600 hover:text-black"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainBody;
