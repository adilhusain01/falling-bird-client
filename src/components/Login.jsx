import React, { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';

const Login = () => {
  const { login } = usePrivy();
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="page-container">
      {/* Floating magical elements */}
      <div className="floating-elements">
        <div className="floating-element">✨</div>
        <div className="floating-element">🌸</div>
        <div className="floating-element">🍃</div>
        <div className="floating-element">⭐</div>
      </div>

      <div className="flex flex-col items-center justify-center w-full h-full p-6">
        <div className="text-6xl mb-6" style={{ animation: 'gentle-float 3s ease-in-out infinite' }}>
          🐦
        </div>
        
        <div className="ghibli-card w-full max-w-sm p-8 text-center">
          <h1 className="ghibli-title text-3xl mb-2">Shishimaroo</h1>
          <p className="text-slate-600 text-sm mb-6" style={{ fontFamily: 'Kalam, cursive' }}>
            ~ A Magical Adventure Awaits ~
          </p>
          
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={`ghibli-button ghibli-button-green w-full py-3 text-lg ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="mr-2">🌀</span>
                <span>Summoning Magic...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <span className="mr-2">🔗</span>
                <span>Login with Magic</span>
              </span>
            )}
          </button>
          
          <div className="mt-6 flex justify-center gap-3 text-lg opacity-50">
            <span style={{ animation: 'gentle-float 3s ease-in-out infinite' }}>🌿</span>
            <span style={{ animation: 'gentle-float 3s ease-in-out infinite 0.5s' }}>🦋</span>
            <span style={{ animation: 'gentle-float 3s ease-in-out infinite 1s' }}>🌺</span>
          </div>
        </div>
        
        <p className="mt-6 text-xs text-slate-500 opacity-70" style={{ fontFamily: 'Kalam, cursive' }}>
          "In every cloud, there's a story waiting to unfold..."
        </p>
      </div>
    </div>
  );
};

export default Login;