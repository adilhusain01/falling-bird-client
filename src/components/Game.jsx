import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AudioManager } from '../utils/AudioManager';

const Game = () => {
  const [gameState, setGameState] = useState('start');
  const [score, setScore] = useState(0.0);
  const [gameOverInfo, setGameOverInfo] = useState({ title: '', scoreText: '' });
  const [isRestarting, setIsRestarting] = useState(false);
  const navigate = useNavigate();

  const canvasRef = useRef(null);
  const audioManagerRef = useRef(null);
  const gameLogicRef = useRef(null);
  const animationFrameId = useRef(null);
  const gameStateRef = useRef(gameState);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

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
  }, []);

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

    setGameState('gameOver');
    setGameOverInfo({ title: '💥 Crashed!', scoreText: 'Final Score: 0.0x' });

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
  }, []);

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
  }, []);

  const cashOut = useCallback(async () => {
    const audio = audioManagerRef.current;
    setGameState('gameOver');
    setGameOverInfo({ title: '🎉 Cashed Out!', scoreText: `Final Score: ${score.toFixed(1)}x` });

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
  }, [score]);

  return (
    <div className="game-container">
      <canvas ref={canvasRef} id="gameCanvas" width="360" height="640" />

      <div className="ui-overlay">
        {gameState === 'playing' && (
          <>
            <div
              className="score-display"
              style={{
                position: 'absolute',
                top: '100px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 10,
              }}
            >
              Score: {score.toFixed(1)}x
            </div>
            <div
              style={{
                position: 'absolute',
                left: '65%',
                bottom: '160px',
                transform: 'translateX(-50%)',
                zIndex: 10,
              }}
            >
              <button className="out-button" onClick={cashOut}>OUT</button>
            </div>
          </>
        )}
      </div>

      {gameState === 'start' && (
        <div className="start-screen">
          <h1>🐦 Shishimaaro</h1>
          <p>
            Help Shishimaaro fall through the clouds!<br />
            Your score increases the longer you fall.<br />
            Click "OUT" to cash in your score, or risk it all!<br />
            If you crash, you lose everything!
          </p>
          <button className="start-button" onClick={startGame}>Start Falling</button>
          <button
            className="profile-button"
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#6A6FF5',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
            onClick={() => navigate('/profile')}
          >
            View Profile
          </button>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="game-over-screen" style={{ display: 'block' }}>
          <h2>{gameOverInfo.title}</h2>
          <div className="final-score">{gameOverInfo.scoreText}</div>
          <button className="restart-button" onClick={startGame}>Play Again</button>
          <button
            className="profile-button"
            style={{
              padding: '12px 24px',
              fontSize: '16px',
              backgroundColor: '#6A6FF5',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              marginTop: '10px'
            }}
            onClick={() => navigate('/profile')}
          >
            View Profile
          </button>
        </div>
      )}
    </div>
  );
};

export default Game;