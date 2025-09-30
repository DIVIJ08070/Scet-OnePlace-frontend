'use client';
import { GoogleLogin } from '@react-oauth/google';
import { CredentialResponse } from '@react-oauth/google';

export default function GoogleSignIn() {
  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    console.log(credentialResponse)
    const token = credentialResponse.credential;

    if (token) {
      // ✅ Send token to backend for verification
      console.log('✅ Google token:', token);
    //   const res = await fetch('http://localhost:3000/api/auth/google', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ token }),
    //   });

    //   const data = await res.json();
    //   console.log('✅ Backend response:', data);
    }
  };

  const handleError = () => {
    console.error('❌ Google login failed');
  };

  return <GoogleLogin onSuccess={handleSuccess} onError={handleError} />;
}
