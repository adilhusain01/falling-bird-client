export class AudioManager {
            constructor() {
                this.context = null;
                this.soundEnabled = true;
                this.fallingSoundPlaying = false;
                this.fallingSoundNode = null;
                this.backgroundMusicPlaying = false;
                this.backgroundMusicNodes = [];
                this.masterGain = null;
                this.musicGain = null;
                this.sfxGain = null;
                this.initAudio();
            }
            
            async cleanup() {
                if (this.fallingSoundNode) {
                    try {
                        this.fallingSoundNode.stop();
                    } catch (e) {
                        console.log('Error stopping falling sound:', e);
                    }
                    this.fallingSoundNode = null;
                }
                
                this.backgroundMusicNodes.forEach(node => {
                    try {
                        if (node && typeof node.stop === 'function') {
                            node.stop();
                        } else if (node && node.oscillator && typeof node.oscillator.stop === 'function') {
                            node.oscillator.stop();
                        }
                    } catch (e) {
                        console.log('Error stopping background music:', e);
                    }
                });
                this.backgroundMusicNodes = [];
                
                this.fallingSoundPlaying = false;
                this.backgroundMusicPlaying = false;
                
                if (this.context) {
                    try {
                        if (this.context.state !== 'closed') {
                            await this.context.close();
                        }
                    } catch (e) {
                        console.log('Error closing audio context:', e);
                    } finally {
                        this.context = null;
                    }
                }
            }
            
            async initAudio() {
                try {
                    // Check if audio is supported
                    if (!window.AudioContext && !window.webkitAudioContext) {
                        console.warn('Web Audio API not supported');
                        this.soundEnabled = false;
                        return false;
                    }
                    
                    // Close existing context if any
                    if (this.context && this.context.state !== 'closed') {
                        try {
                            await this.context.close();
                        } catch (e) {
                            console.warn('Error closing existing audio context:', e);
                        }
                    }
                    
                    this.context = new (window.AudioContext || window.webkitAudioContext)();
                    
                    // Add error event listener
                    this.context.addEventListener('statechange', () => {
                        if (this.context) {
                            console.log('Audio context state changed to:', this.context.state);
                        }
                    });
                    
                    this.masterGain = this.context.createGain();
                    this.masterGain.connect(this.context.destination);
                    this.masterGain.gain.value = 0.4;
                    
                    this.musicGain = this.context.createGain();
                    this.sfxGain = this.context.createGain();
                    
                    this.musicGain.connect(this.masterGain);
                    this.sfxGain.connect(this.masterGain);
                    
                    this.musicGain.gain.value = 0.6;
                    this.sfxGain.gain.value = 0.8;
                    
                    // Only resume if suspended due to browser policy
                    if (this.context.state === 'suspended') {
                        // Don't auto-resume, wait for user interaction
                        console.log('Audio context suspended, waiting for user interaction');
                    }
                    
                    return true;
                } catch (e) {
                    console.error('Audio initialization error:', e);
                    this.context = null;
                    this.soundEnabled = false;
                    return false;
                }
            }
            
            async resumeContext() {
                if (this.context && this.context.state === 'suspended') {
                    try {
                        await this.context.resume();
                        console.log('Audio context resumed successfully');
                    } catch (e) {
                        console.error('Failed to resume audio context:', e);
                        this.soundEnabled = false;
                    }
                }
            }
            
            createOscillator(frequency, type = 'sine', destination = null) {
                if (!this.context || !this.soundEnabled || this.context.state === 'closed') {
                    return null;
                }
                
                try {
                    const oscillator = this.context.createOscillator();
                    const gainNode = this.context.createGain();
                    
                    oscillator.type = type;
                    oscillator.frequency.setValueAtTime(frequency, this.context.currentTime);
                    
                    oscillator.connect(gainNode);
                    gainNode.connect(destination || this.sfxGain);
                    
                    return { oscillator, gainNode };
                } catch (e) {
                    console.error('Error creating oscillator:', e);
                    return null;
                }
            }
            
            startBackgroundMusic() {
                if (!this.context || !this.soundEnabled || this.backgroundMusicPlaying || this.context.state === 'closed') {
                    return;
                }
                
                // Try to resume context if suspended
                if (this.context.state === 'suspended') {
                    this.resumeContext();
                }
                
                this.backgroundMusicPlaying = true;
                this.backgroundMusicNodes = [];
                
                const melodyNotes = [
                    { freq: 523, duration: 0.3 }, // C5
                    { freq: 659, duration: 0.3 }, // E5
                    { freq: 784, duration: 0.6 }, // G5
                    { freq: 523, duration: 0.3 }, // C5
                    { freq: 659, duration: 0.3 }, // E5
                    { freq: 880, duration: 0.6 }, // A5
                    { freq: 784, duration: 0.3 }, // G5
                    { freq: 659, duration: 0.3 }, // E5
                    { freq: 698, duration: 0.6 }, // F5
                    { freq: 587, duration: 0.3 }, // D5
                    { freq: 523, duration: 0.9 }, // C5
                ];
                
                const bassNotes = [
                    { freq: 131, duration: 1.2 }, // C3
                    { freq: 165, duration: 1.2 }, // E3
                    { freq: 196, duration: 1.2 }, // G3
                    { freq: 220, duration: 1.2 }, // A3
                    { freq: 175, duration: 1.2 }, // F3
                    { freq: 147, duration: 1.2 }, // D3
                    { freq: 131, duration: 2.4 }, // C3
                ];
                
                this.playMelodyLoop(melodyNotes, 0, 'triangle');
                this.playMelodyLoop(bassNotes, 0, 'sawtooth', 0.4);
                this.playRhythmLoop();
            }
            
            playMelodyLoop(notes, startIndex = 0, waveType = 'triangle', volume = 0.3) {
                if (!this.backgroundMusicPlaying) return;
                
                const note = notes[startIndex];
                const sound = this.createOscillator(note.freq, waveType, this.musicGain);
                if (!sound) return;
                
                const { oscillator, gainNode } = sound;
                
                const vibrato = this.context.createOscillator();
                const vibratoGain = this.context.createGain();
                vibrato.frequency.setValueAtTime(5, this.context.currentTime);
                vibratoGain.gain.setValueAtTime(3, this.context.currentTime);
                
                vibrato.connect(vibratoGain);
                vibratoGain.connect(oscillator.frequency);
                
                gainNode.gain.setValueAtTime(0, this.context.currentTime);
                gainNode.gain.linearRampToValueAtTime(volume, this.context.currentTime + 0.05);
                gainNode.gain.linearRampToValueAtTime(volume * 0.7, this.context.currentTime + note.duration * 0.8);
                gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + note.duration);
                
                oscillator.start();
                vibrato.start();
                oscillator.stop(this.context.currentTime + note.duration);
                vibrato.stop(this.context.currentTime + note.duration);
                
                this.backgroundMusicNodes.push({ oscillator, gainNode, vibrato });
                
                setTimeout(() => {
                    if (this.backgroundMusicPlaying) {
                        const nextIndex = (startIndex + 1) % notes.length;
                        this.playMelodyLoop(notes, nextIndex, waveType, volume);
                    }
                }, note.duration * 1000);
            }
            
            playRhythmLoop() {
                if (!this.backgroundMusicPlaying) return;
                
                const kickOsc = this.createOscillator(60, 'sine', this.musicGain);
                if (kickOsc) {
                    const { oscillator, gainNode } = kickOsc;
                    
                    oscillator.frequency.exponentialRampToValueAtTime(30, this.context.currentTime + 0.1);
                    gainNode.gain.setValueAtTime(0.4, this.context.currentTime);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.2);
                    
                    oscillator.start();
                    oscillator.stop(this.context.currentTime + 0.2);
                    
                    this.backgroundMusicNodes.push(kickOsc);
                }
                
                setTimeout(() => {
                    if (this.backgroundMusicPlaying) {
                        const noise = this.context.createBufferSource();
                        const buffer = this.context.createBuffer(1, this.context.sampleRate * 0.1, this.context.sampleRate);
                        const data = buffer.getChannelData(0);
                        
                        for (let i = 0; i < data.length; i++) {
                            data[i] = Math.random() * 2 - 1;
                        }
                        
                        noise.buffer = buffer;
                        
                        const hihatFilter = this.context.createBiquadFilter();
                        hihatFilter.type = 'highpass';
                        hihatFilter.frequency.setValueAtTime(8000, this.context.currentTime);
                        
                        const hihatGain = this.context.createGain();
                        hihatGain.gain.setValueAtTime(0.15, this.context.currentTime);
                        hihatGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);
                        
                        noise.connect(hihatFilter);
                        hihatFilter.connect(hihatGain);
                        hihatGain.connect(this.musicGain);
                        
                        noise.start();
                        noise.stop(this.context.currentTime + 0.1);
                    }
                }, 150);
                
                setTimeout(() => {
                    if (this.backgroundMusicPlaying) {
                        this.playRhythmLoop();
                    }
                }, 600);
            }
            
            stopBackgroundMusic() {
                if (!this.backgroundMusicPlaying || !this.context || this.context.state === 'closed') return;
                
                this.backgroundMusicPlaying = false;
                
                try {
                    this.musicGain.gain.linearRampToValueAtTime(0, this.context.currentTime + 1);
                } catch (e) {
                    console.log('Error stopping background music gain:', e);
                }
                
                setTimeout(() => {
                    this.backgroundMusicNodes.forEach(node => {
                        try {
                            if (node.oscillator) node.oscillator.stop();
                            if (node.vibrato) node.vibrato.stop();
                        } catch (e) {
                            console.log('Error stopping audio node:', e);
                        }
                    });
                    this.backgroundMusicNodes = [];
                    
                    if (this.context && this.context.state !== 'closed') {
                        this.musicGain.gain.setValueAtTime(0.6, this.context.currentTime);
                    }
                }, 1000);
            }
            
            startFallingSound() {
                if (!this.context || !this.soundEnabled || this.fallingSoundPlaying || this.context.state === 'closed') {
                    return;
                }
                
                // Try to resume context if suspended
                if (this.context.state === 'suspended') {
                    this.resumeContext();
                }
                
                this.fallingSoundPlaying = true;
                const sound = this.createOscillator(150, 'sine', this.sfxGain);
                if (!sound) return;
                
                const { oscillator, gainNode } = sound;
                this.fallingSoundNode = { oscillator, gainNode };
                
                gainNode.gain.setValueAtTime(0, this.context.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.08, this.context.currentTime + 0.5);
                
                const lfo = this.context.createOscillator();
                const lfoGain = this.context.createGain();
                lfo.frequency.setValueAtTime(0.5, this.context.currentTime);
                lfoGain.gain.setValueAtTime(20, this.context.currentTime);
                
                lfo.connect(lfoGain);
                lfoGain.connect(oscillator.frequency);
                
                oscillator.start();
                lfo.start();
                
                this.fallingSoundLfo = lfo;
            }
            
            stopFallingSound() {
                if (!this.fallingSoundPlaying || !this.fallingSoundNode || !this.context || this.context.state === 'closed') return;
                
                try {
                    const { oscillator, gainNode } = this.fallingSoundNode;
                    
                    gainNode.gain.linearRampToValueAtTime(0, this.context.currentTime + 0.3);
                    oscillator.stop(this.context.currentTime + 0.4);
                    
                    if (this.fallingSoundLfo) {
                        this.fallingSoundLfo.stop(this.context.currentTime + 0.4);
                    }
                } catch (e) {
                    console.log('Error stopping falling sound:', e);
                }
                
                this.fallingSoundPlaying = false;
                this.fallingSoundNode = null;
            }
            
            playCrashSound() {
                if (!this.context || !this.soundEnabled || this.context.state === 'closed') {
                    return;
                }
                
                try {
                
                const noise = this.context.createBufferSource();
                const buffer = this.context.createBuffer(1, this.context.sampleRate * 0.5, this.context.sampleRate);
                const data = buffer.getChannelData(0);
                
                for (let i = 0; i < data.length; i++) {
                    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
                }
                
                noise.buffer = buffer;
                
                const filter = this.context.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1000, this.context.currentTime);
                filter.frequency.exponentialRampToValueAtTime(100, this.context.currentTime + 0.5);
                
                const crashGain = this.context.createGain();
                crashGain.gain.setValueAtTime(0.5, this.context.currentTime);
                crashGain.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.5);
                
                noise.connect(filter);
                filter.connect(crashGain);
                crashGain.connect(this.sfxGain);
                
                noise.start();
                noise.stop(this.context.currentTime + 0.5);
                } catch (e) {
                    console.error('Error playing crash sound:', e);
                }
            }
            
            playCashOutSound() {
                if (!this.context || !this.soundEnabled || this.context.state === 'closed') {
                    return;
                }
                
                try {
                
                const frequencies = [262, 330, 392, 523]; 
                
                frequencies.forEach((freq, index) => {
                    const sound = this.createOscillator(freq, 'triangle', this.sfxGain);
                    if (!sound) return;
                    
                    const { oscillator, gainNode } = sound;
                    const startTime = this.context.currentTime + index * 0.1;
                    
                    gainNode.gain.setValueAtTime(0, startTime);
                    gainNode.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
                    gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
                    
                    oscillator.start(startTime);
                    oscillator.stop(startTime + 0.3);
                });
                } catch (e) {
                    console.error('Error playing cash out sound:', e);
                }
            }
            
            toggle() {
                this.soundEnabled = !this.soundEnabled;
                if (!this.soundEnabled) {
                    this.stopFallingSound();
                    this.stopBackgroundMusic();
                } else if (this.backgroundMusicPlaying === false) {
                    // Audio is disabled, do nothing
                }
                return this.soundEnabled;
            }
        }