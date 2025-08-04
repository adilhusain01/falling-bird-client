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
    <>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-pulse-scale {
          animation: pulse 2s infinite;
        }
      `}</style>
      <div className="page-container">
        <div className="flex flex-col items-center justify-center h-full w-full p-5 text-center relative">
          <div className="absolute -top-1/2 -left-1/2 w-full h-full opacity-0 transition-opacity duration-300 ease-in-out pointer-events-none"
               style={{
                 background: 'radial-gradient(circle, rgba(102, 126, 234, 0.15) 0%, transparent 70%)',
                 width: '200%',
                 height: '200%'
               }}>
          </div>
          <div className="bg-slate-800 bg-opacity-85 rounded-3xl p-12 max-w-sm w-full shadow-2xl animate-fade-in-up backdrop-blur border border-white border-opacity-10"
               style={{
                 boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                 backdropFilter: 'blur(16px)'
               }}>
            <div className="mb-8 animate-float">
              <div className="text-6xl mb-4 animate-pulse-scale" 
                   style={{ filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3))' }}>
                🐦
              </div>
              <h1 className="text-white text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-400 via-purple-400 to-purple-600 bg-clip-text text-transparent"
                  style={{ letterSpacing: '-0.5px' }}>
                Shishimaroo
              </h1>
            </div>
            <p className="text-slate-400 text-base mb-10 max-w-xs leading-relaxed font-normal">
              Connect your wallet to start falling through the clouds and earn rewards in this thrilling adventure!
            </p>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className={`w-full py-4 px-8 text-base font-semibold text-white bg-gradient-to-r from-indigo-500 to-purple-600 border-none rounded-2xl cursor-pointer transition-all duration-300 shadow-lg relative overflow-hidden transform ${
                isHovered && !isLoading 
                  ? 'translate-y-0.5 shadow-xl bg-gradient-to-r from-purple-600 to-violet-600' 
                  : 'translate-y-0'
              } ${
                isLoading 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'cursor-pointer'
              }`}
              style={{
                boxShadow: isHovered && !isLoading 
                  ? '0 12px 35px rgba(102, 126, 234, 0.4)' 
                  : '0 8px 25px rgba(102, 126, 234, 0.25)'
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className="mr-3 text-xl animate-pulse-scale">
                {isLoading ? '⏳' : '🔗'}
              </span>
              {isLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;