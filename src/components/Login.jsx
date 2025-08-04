import React from 'react';
import { usePrivy } from '@privy-io/react-auth';

// Styles for the Login component
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    padding: '20px',
    textAlign: 'center',
  },
  title: {
    color: '#333',
    fontSize: '32px',
    marginBottom: '15px',
  },
  subtitle: {
    color: '#555',
    fontSize: '16px',
    marginBottom: '30px',
    maxWidth: '300px',
    lineHeight: '1.5',
  },
  loginButton: {
    padding: '16px 32px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#FFFFFF',
    background: 'linear-gradient(45deg, #4ECDC4, #45B7B8)',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 20px rgba(78, 205, 196, 0.4)',
    },
  },
  contentBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '20px',
    padding: '40px 30px',
    maxWidth: '340px',
    width: '100%',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.1)',
  },
};

const Login = () => {
  const { login } = usePrivy();

  return (
    <div className="page-container">
      <div style={styles.container}>
        <div style={styles.contentBox}>
          <h1 style={styles.title}>🐦 Shishimaroo</h1>
          <p style={styles.subtitle}>
            Log in to start falling through the clouds and earn rewards!
          </p>
          <button
            onClick={login}
            style={styles.loginButton}
          >
            Log In with Wallet
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;



