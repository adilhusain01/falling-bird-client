import React from 'react';
import { usePrivy } from '@privy-io/react-auth';

const Login = () => {
  const { login } = usePrivy();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      background: 'linear-gradient(to bottom, #87CEEB, #B0E0E6)',
      fontFamily: 'Arial, sans-serif',
      textAlign: 'center'
    }}>
      <h1>🐦 Welcome to Shishimaroo</h1>
      <p>Log in to start falling through the clouds!</p>
      <button
        onClick={login}
        style={{
          padding: '12px 24px',
          fontSize: '18px',
          backgroundColor: '#6A6FF5',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        Log In
      </button>
    </div>
  );
};

export default Login;