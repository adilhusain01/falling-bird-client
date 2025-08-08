import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AudioManager } from '../utils/AudioManager';
import { useTokenBalance } from '../utils/useTokenBalance';
import Slider from '@mui/material/Slider';

const Game = () => {
  const [gameState, setGameState] = useState('bidding');
  const [score, setScore] = useState(0.0);
  const [gameOverInfo, setGameOverInfo] = useState({ title: '', scoreText: '' });
  const [isRestarting, setIsRestarting] = useState(false);
  const [bidAmount, setBidAmount] = useState(1);
  const [currentBid, setCurrentBid] = useState(0);
  const { tokenBalance, refetch: refetchBalance } = useTokenBalance();
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const audioManagerRef = useRef(null);
  const gameLogicRef = useRef(null);
  const animationFrameId = useRef(null);
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const getCrashTime = () => {
    const rand = Math.random();
    if (rand < 0.2) {
      return Math.random() * 1000;
    } else if (rand < 0.6) {
      return 1000 + Math.random() * 4000;
    } else {
      return 5000 + Math.random() * 5000;
    }
  };

  const crash = useCallback(async () => {
    const audio = audioManagerRef.current;
    if (!audio) return;

    if (gameLogicRef.current) {
      gameLogicRef.current.bird.crying = true;
      for (let i = 0; i < 25; i++) {
        gameLogicRef.current.particles.push({
          x: gameLogicRef.current.bird.x,
          y: gameLogicRef.current.bird.y,
          vx: (Math.random() - 0.5) * 15,
          vy: (Math.random() - 0.5) * 15,
          life: 1,
          color: `hsl(${Math.random() * 60 + 15}, 80%, 60%)`
        });
      }
    }

    // Note: In a real implementation, token balance would be updated via blockchain transactions
    // For now, we just refresh the balance to get the latest state
    refetchBalance();
    setGameState('gameOver');
    setGameOverInfo({ title: '💥 Crashed!', scoreText: `Lost: ${currentBid} GBT` });
    setCurrentBid(0);

    audio.stopFallingSound();
    audio.stopBackgroundMusic();
    audio.playCrashSound();

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      await audio.cleanup();
    } catch (e) {
      console.error('Error during audio cleanup:', e);
    } finally {
      setIsRestarting(false);
    }
  }, [currentBid, refetchBalance]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    audioManagerRef.current = new AudioManager();

    gameLogicRef.current = {
      bird: { x: canvas.width / 2, y: canvas.height / 2, width: 80, height: 60, rotation: 0, wingPhase: 0, crying: false, fallSpeed: 0 },
      clouds: Array.from({ length: 12 }, (_, i) => ({
        x: Math.random() * (canvas.width + 200) - 100, y: i * 120 + Math.random() * 80, size: Math.random() * 80 + 60, speed: Math.random() * 3 + 2, opacity: Math.random() * 0.4 + 0.6
      })),
      particles: [],
      gameTime: 0,
      crashTimer: getCrashTime(),
    };

    const logic = gameLogicRef.current;
    let lastTime = 0;

    const drawCloud = (cloud) => {
      ctx.save();
      ctx.globalAlpha = cloud.opacity;
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.beginPath();
      ctx.arc(cloud.x + 3, cloud.y + 3, cloud.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath();
      const { x, y, size } = cloud;
      ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
      ctx.arc(x - size * 0.35, y, size * 0.4, 0, Math.PI * 2);
      ctx.arc(x + size * 0.35, y, size * 0.4, 0, Math.PI * 2);
      ctx.arc(x - size * 0.2, y - size * 0.35, size * 0.35, 0, Math.PI * 2);
      ctx.arc(x + size * 0.2, y - size * 0.35, size * 0.35, 0, Math.PI * 2);
      ctx.arc(x, y - size * 0.5, size * 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawBird = () => {
      const bird = logic.bird;
      ctx.save();
      ctx.translate(bird.x, bird.y);
      ctx.rotate(bird.rotation);
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.beginPath();
      ctx.ellipse(3, 8, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, bird.width / 2);
      gradient.addColorStop(0, bird.crying ? '#8B4513' : '#FF6B35');
      gradient.addColorStop(1, bird.crying ? '#654321' : '#FF4500');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.ellipse(0, 0, bird.width / 2, bird.height / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFE5B4';
      ctx.beginPath();
      ctx.ellipse(0, 8, bird.width / 3, bird.height / 3, 0, 0, Math.PI * 2);
      ctx.fill();
      const wingFlap = Math.sin(bird.wingPhase) * 0.7 + 0.3;
      ctx.fillStyle = '#FF8C42';
      ctx.save();
      ctx.rotate(-wingFlap * 0.8);
      ctx.beginPath();
      ctx.ellipse(-25, -8, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.save();
      ctx.rotate(wingFlap * 0.8);
      ctx.beginPath();
      ctx.ellipse(25, -8, 18, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#FFA500';
      ctx.beginPath();
      ctx.moveTo(bird.width / 2, 0);
      ctx.lineTo(bird.width / 2 + 15, -5);
      ctx.lineTo(bird.width / 2 + 15, 5);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(-12, -12, 10, 0, Math.PI * 2);
      ctx.arc(12, -12, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = bird.crying ? 'red' : 'black';
      ctx.beginPath();
      ctx.arc(-12, -12, 5, 0, Math.PI * 2);
      ctx.arc(12, -12, 5, 0, Math.PI * 2);
      ctx.fill();
      if (bird.crying) {
        ctx.fillStyle = 'lightblue';
        for (let i = 0; i < 3; i++) {
          ctx.beginPath();
          ctx.arc(-8 + Math.random() * 4, -5 + i * 8, 3, 0, Math.PI * 2);
          ctx.arc(16 + Math.random() * 4, -5 + i * 8, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    };

    const drawParticles = () => {
      logic.particles.forEach(particle => {
        ctx.save();
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
    };

    const update = (deltaTime) => {
      logic.gameTime += deltaTime;
      setScore(logic.gameTime / 1000);

      if (logic.gameTime >= logic.crashTimer) {
        crash();
        return;
      }

      logic.bird.wingPhase += deltaTime * 0.015;
      logic.bird.rotation = Math.sin(logic.bird.wingPhase) * 0.3;
      logic.bird.fallSpeed = Math.min(logic.bird.fallSpeed + deltaTime * 0.001, 2);
      logic.bird.y += logic.bird.fallSpeed;
      if (logic.bird.y > canvas.height / 2 + 50) logic.bird.y = canvas.height / 2 + 50;
      if (logic.bird.y < canvas.height / 2 - 50) logic.bird.y = canvas.height / 2 - 50;

      logic.clouds.forEach(cloud => {
        cloud.y -= cloud.speed * (1 + (logic.gameTime / 1000) * 0.1);
        if (cloud.y < -150) {
          cloud.y = canvas.height + 150;
          cloud.x = Math.random() * (canvas.width + 200) - 100;
          cloud.size = Math.random() * 80 + 60;
        }
      });

      logic.particles = logic.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5;
        p.life -= deltaTime * 0.003;
        return p.life > 0;
      });
    };

    const render = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#87CEEB');
      gradient.addColorStop(1, '#B0E0E6');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      logic.clouds.forEach(drawCloud);
      drawBird();
      drawParticles();
    };

    const animate = (currentTime) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      if (gameStateRef.current === 'playing') {
        update(deltaTime);
      }
      render();
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [crash]);

  const handleBidSubmit = () => {
    if (bidAmount < 1 || bidAmount > tokenBalance) return;
    setCurrentBid(bidAmount);
    setGameState('start');
  };

  const startGame = useCallback(async () => {
    if (isRestarting) return;

    setIsRestarting(true);
    const audio = audioManagerRef.current;

    const canvas = canvasRef.current;
    if (gameLogicRef.current) {
      gameLogicRef.current.gameTime = 0;
      gameLogicRef.current.score = 0;
      gameLogicRef.current.crashTimer = getCrashTime();
      gameLogicRef.current.bird.crying = false;
      gameLogicRef.current.bird.y = canvas.height / 2;
      gameLogicRef.current.particles = [];
    }

    setScore(0);
    setGameState('playing');

    try {
      await audio.cleanup();
      await new Promise(resolve => setTimeout(resolve, 50));
      audioManagerRef.current = new AudioManager();
      const newAudio = audioManagerRef.current;
      const audioInitialized = await newAudio.initAudio();
      if (!audioInitialized) {
        throw new Error('Failed to initialize audio');
      }
      setTimeout(() => {
        try {
          newAudio.startBackgroundMusic();
          newAudio.startFallingSound();
        } catch (e) {
          console.error('Error starting audio:', e);
        }
      }, 50);
    } catch (error) {
      console.error('Error initializing audio:', error);
    } finally {
      setIsRestarting(false);
    }
  }, [isRestarting]);

  const cashOut = useCallback(async () => {
    const audio = audioManagerRef.current;
    const winnings = Math.floor(currentBid * score);
    
    // Note: In a real implementation, this would trigger a blockchain transaction
    // to transfer winnings to the user's wallet
    refetchBalance();
    
    setGameState('gameOver');
    setGameOverInfo({ 
      title: '🎉 Cashed Out!', 
      scoreText: `Won: ${winnings} GBT (${score.toFixed(1)}x)` 
    });
    
    setCurrentBid(0);

    audio.stopFallingSound();
    audio.stopBackgroundMusic();
    audio.playCashOutSound();

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      await audio.cleanup();
    } catch (e) {
      console.error('Error during audio cleanup:', e);
    } finally {
      setIsRestarting(false);
    }
  }, [score, currentBid, refetchBalance]);

  return (
    <div className="page-container">
      {/* Floating magical elements */}
      <div className="floating-elements">
        <div className="floating-element">🐦</div>
        <div className="floating-element">☁️</div>
        <div className="floating-element">✨</div>
        <div className="floating-element">🍃</div>
      </div>

      <canvas 
        ref={canvasRef} 
        width={400} 
        height={711} 
        className="absolute top-0 left-0 w-full h-full" 
      />
      
      {gameState === 'playing' && (
        <>
          {/* Score and bid display at top */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-xs">
            <div className="ghibli-card px-4 py-2 flex justify-between items-center">
              <div className="text-center px-2">
                <p className="ghibli-title text-sm text-slate-500">Bid</p>
                <p className="text-lg font-bold">{currentBid} SSM</p>
              </div>
              <div className="h-8 w-px bg-slate-200 mx-2"></div>
              <div className="text-center px-2">
                <p className="ghibli-title text-sm text-slate-500">Multiplier</p>
                <p className="text-lg font-bold">{score.toFixed(1)}x</p>
              </div>
              <div className="h-8 w-px bg-slate-200 mx-2"></div>
              <div className="text-center px-2">
                <p className="ghibli-title text-sm text-slate-500">Balance</p>
                <p className="text-lg font-bold">{tokenBalance.toFixed(2)} GBT</p>
              </div>
            </div>
          </div>
          
          {/* Cash Out button at bottom */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 w-full max-w-xs px-4">
            <button 
              className="ghibli-button ghibli-button-red w-full py-3 text-lg"
              onClick={cashOut}
            >
              Cash Out
            </button>
          </div>
        </>
      )}

      {gameState === 'bidding' && (
        <div className="flex flex-col items-center justify-center w-full h-full p-6 z-10">
          <div className="text-6xl mb-6" style={{ animation: 'gentle-float 3s ease-in-out infinite' }}>
            💰
          </div>
          <div className="ghibli-card w-full max-w-sm p-8 text-center">
            <h1 className="ghibli-title text-3xl mb-6">Place Your Bid</h1>
            <p className="text-slate-600 mb-6">
              Available Balance: {tokenBalance.toFixed(2)} GBT
            </p>
            
            <div className="mb-6 px-4">
              <div className="flex justify-between text-sm text-slate-500 mb-2">
                <span>1 GBT</span>
                <span>Max: {Math.floor(tokenBalance)} GBT</span>
              </div>
              <Slider
                value={bidAmount}
                min={1}
                max={Math.max(1, Math.floor(tokenBalance))}
                step={1}
                onChange={(e, value) => setBidAmount(value)}
                valueLabelDisplay="auto"
                valueLabelFormat={(value) => `${value} GBT`}
                sx={{
                  color: '#4f46e5',
                  '& .MuiSlider-thumb': {
                    width: 24,
                    height: 24,
                    backgroundColor: '#fff',
                    border: '2px solid currentColor',
                    '&:hover, &.Mui-focusVisible': {
                      boxShadow: '0 0 0 8px rgba(79, 70, 229, 0.16)',
                    },
                    '&.Mui-active': {
                      boxShadow: '0 0 0 14px rgba(79, 70, 229, 0.16)',
                    },
                  },
                  '& .MuiSlider-rail': {
                    opacity: 0.5,
                    backgroundColor: '#bfdbfe',
                  },
                  '& .MuiSlider-track': {
                    border: 'none',
                  },
                }}
              />
            </div>
            
            <div className="space-y-4">
              <button 
                className={`ghibli-button ghibli-button-green px-6 py-3 w-full text-lg ${
                  tokenBalance < 1 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={handleBidSubmit}
                disabled={tokenBalance < 1}
              >
                {tokenBalance < 1 ? 'Insufficient Balance' : `Bid ${bidAmount} GBT`}
              </button>
              <button
                className="ghibli-button px-6 py-3 w-full text-lg"
                onClick={() => navigate('/profile')}
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'start' && (
        <div className="flex flex-col items-center justify-center w-full h-full p-6 z-10">
          <div className="text-6xl mb-6" style={{ animation: 'gentle-float 3s ease-in-out infinite' }}>
            🐦
          </div>
          <div className="ghibli-card w-full max-w-sm p-8 text-center">
            <h1 className="ghibli-title text-3xl mb-6">Shishimaroo</h1>
            <p className="text-slate-600 mb-6">
              Current Bid: {currentBid} GBT
            </p>
            <div className="space-y-4">
              <button 
                className="ghibli-button ghibli-button-green px-6 py-3 w-full text-lg"
                onClick={startGame}
              >
                Start Falling
              </button>
              <button
                className="ghibli-button px-6 py-3 w-full text-lg"
                onClick={() => {
                  setCurrentBid(0);
                  setGameState('bidding');
                }}
              >
                Change Bid
              </button>
            </div>
          </div>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="flex flex-col items-center justify-center w-full h-full p-6 z-10">
          <div className="ghibli-card w-full max-w-sm p-8 text-center">
            <h2 className="ghibli-title text-2xl mb-2">{gameOverInfo.title}</h2>
            <p className="text-slate-700 text-xl font-bold mb-6">
              {gameOverInfo.scoreText}
            </p>
            
            <div className="space-y-4">
              <button 
                className="ghibli-button ghibli-button-green px-6 py-3 w-full text-lg"
                onClick={() => {
                  if (tokenBalance >= 1) {
                    setGameState('bidding');
                  } else {
                    // If no balance, go to profile to add funds
                    navigate('/profile');
                  }
                }}
              >
                {tokenBalance >= 1 ? 'Play Again' : 'Add Funds'}
              </button>
              <button
                className="ghibli-button px-6 py-3 w-full text-lg"
                onClick={() => navigate('/profile')}
              >
                View Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;