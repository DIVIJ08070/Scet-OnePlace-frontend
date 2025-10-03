'use client';
import React, { useState } from 'react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import {jwtDecode} from 'jwt-decode';
import axios from 'axios';

interface AdminPayload {
  name: string;
  email: string;
  googleId: string;
}

const AdminLogin: React.FC = () => {
  const [admin, setAdmin] = useState<AdminPayload | null>(null);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) return;

    const decoded: any = jwtDecode(idToken); // decoded Google JWT
    const adminData: AdminPayload = {
      name: decoded.name,
      email: decoded.email,
      googleId: idToken,
    };

    setAdmin(adminData);

    try {
      // Send data to backend
      const res = await axios.post('/api/admin/login', adminData);
      console.log('Admin login response:', res.data);
    } catch (err) {
      console.error('Error logging in admin:', err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      {!admin ? (
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.log('Login Failed')} />
      ) : (
        <div className="p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold">Welcome, {admin.name}</h2>
          <p>Email: {admin.email}</p>
          <p>Google ID: {admin.googleId}</p>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
