import { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Sparkles, Settings, Play, Square, Heart, Award, Check, Tv } from 'lucide-react';
import { ConfettiConfig } from './types';
import { ConfettiCanvas } from './components/ConfettiCanvas';
import { BirthdayCake } from './components/BirthdayCake';
import { GiftBox } from './components/GiftBox';

// Import our custom generated avatar images
// @ts-ignore
import birthdayBoyCartoon from './assets/images/bhaiya_cartoon_1782038261215.jpg';

export default function App() {
  // Global honoree state (always BHAIYA)
  const [honoreeName, setHonoreeName] = useState<string>('BHAIYA');
  
  // Confetti controls
  const [confettiConfig, setConfettiConfig] = useState<ConfettiConfig>({
    type: 'colorful',
    speed: 5,
    density: 2, // 1: sparse, 2: normal, 3: blizzard
  });
  const [burstCount, setBurstCount] = useState<number>(0);

  // Audio Synthesizer states
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(false);
  const [musicTempo, setMusicTempo] = useState<number>(120); // Classic tempo
  const activeSynthCtxRef = useRef<AudioContext | null>(null);
  const playScheduledTimeoutRef = useRef<number[]>([]);

  // Statistics tracker
  const [blowoutsCount, setBlowoutsCount] = useState<number>(0);

  // Load initial settings
  useEffect(() => {
    localStorage.setItem('celebration_boy_name', 'BHAIYA');
    setHonoreeName('BHAIYA');

    // Blowout counter persistence
    const savedBlowouts = localStorage.getItem('celebration_blowouts_count');
    if (savedBlowouts) {
      setBlowoutsCount(parseInt(savedBlowouts, 10));
    }
  }, []);

  // Trigger burst increments
  const triggerConfettiBurst = () => {
    setBurstCount(prev => prev + 1);
  };

  // Sound Synth Synthesizer player control for "Happy Birthday Melody"
  const stopHappyBirthdayMelody = () => {
    // Clear timeouts
    playScheduledTimeoutRef.current.forEach(tId => window.clearTimeout(tId));
    playScheduledTimeoutRef.current = [];

    // Close audio context
    if (activeSynthCtxRef.current) {
      try {
        activeSynthCtxRef.current.close();
      } catch (e) {
        console.error("Error closing synthesizer context:", e);
      }
      activeSynthCtxRef.current = null;
    }
    setIsPlayingMusic(false);
  };

  const playHappyBirthdayMelody = () => {
    stopHappyBirthdayMelody();
    setIsPlayingMusic(true);

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    activeSynthCtxRef.current = ctx;

    // Helper to synthesize a note
    const playNote = (frequency: number, startTime: number, duration: number, isVibrand: boolean = false) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      // Warm vibrand/triangle wave for retro synth acoustic
      osc.type = isVibrand ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(frequency, startTime);
      
      // Filter out high screeches
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, startTime);

      // Simple amplitude envelope
      gain.gain.setValueAtTime(0.01, startTime);
      gain.gain.linearRampToValueAtTime(0.18, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.005, startTime + duration - 0.02);
      
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    // Note frequencies
    const C4 = 261.63, D4 = 293.66, E4 = 329.63, F4 = 349.23, G4 = 392.00, A4 = 440.00, Bb4 = 466.16, C5 = 523.25;

    // Note sequence details (note, beats)
    const melodySetup = [
      { f: C4, b: 0.75 }, { f: C4, b: 0.25 }, { f: D4, b: 1 }, { f: C4, b: 1 }, { f: F4, b: 1 }, { f: E4, b: 2 }, // Happy Birthday to you
      { f: C4, b: 0.75 }, { f: C4, b: 0.25 }, { f: D4, b: 1 }, { f: C4, b: 1 }, { f: G4, b: 1 }, { f: F4, b: 2 }, // Happy Birthday to you
      { f: C4, b: 0.75 }, { f: C4, b: 0.25 }, { f: C5, b: 1 }, { f: A4, b: 1 }, { f: F4, b: 1 }, { f: E4, b: 1 }, { f: D4, b: 2 }, // Happy Birthday dear Siddharth
      { f: Bb4, b: 0.75 }, { f: Bb4, b: 0.25 }, { f: A4, b: 1 }, { f: F4, b: 1 }, { f: G4, b: 1 }, { f: F4, b: 2.5 } // Happy Birthday to you!
    ];

    const beatLength = 60 / musicTempo; // seconds per beat
    let timeCursor = ctx.currentTime + 0.15;

    melodySetup.forEach((item) => {
      const noteDuration = item.b * beatLength;
      playNote(item.f, timeCursor, noteDuration, musicTempo > 150);
      timeCursor += noteDuration + 0.03; // spacer gap
    });

    // Schedule automatic state cleanup when melody finishes
    const totalDurationMs = (timeCursor - ctx.currentTime) * 1000 + 400;
    const tId = window.setTimeout(() => {
      setIsPlayingMusic(false);
      activeSynthCtxRef.current = null;
    }, totalDurationMs);
    playScheduledTimeoutRef.current.push(tId);
  };

  // Clean up audio references on unmount
  useEffect(() => {
    return () => {
      playScheduledTimeoutRef.current.forEach(tId => window.clearTimeout(tId));
      if (activeSynthCtxRef.current) {
        activeSynthCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  // Handle Birthday Cake blowout success
  const handleCakeAllBlowout = () => {
    // Generate massive multiple confetti bursts
    triggerConfettiBurst();
    
    // Stagger additional delay bursts for extreme luxury party effect
    const delayTimers = [250, 600, 1100, 1600].map(delay => 
      window.setTimeout(() => {
        triggerConfettiBurst();
      }, delay)
    );

    // Update blowout counters
    setBlowoutsCount(prev => {
      const updated = prev + 1;
      localStorage.setItem('celebration_blowouts_count', String(updated));
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-[#FFD700] relative text-[#1A1A1A] pb-16 antialiased font-sans">
      
      {/* High-Performance Canvas Confetti falling background */}
      <ConfettiCanvas config={confettiConfig} burstCount={burstCount} />

      {/* Decorative static flat shapes in background for Vibrant Palette feel */}
      <div className="absolute top-10 left-20 w-8 h-8 bg-[#FF6B6B] rounded-sm rotate-12 pointer-events-none opacity-40 sm:opacity-90 z-0"></div>
      <div className="absolute top-32 left-[18%] w-6 h-10 bg-[#4ECDC4] rounded-full rotate-45 pointer-events-none opacity-40 sm:opacity-90 z-0"></div>
      <div className="absolute top-12 left-[82%] w-12 h-6 bg-[#FF9F43] rounded-lg -rotate-12 pointer-events-none opacity-40 sm:opacity-90 z-0"></div>
      <div className="absolute top-64 left-[5%] w-10 h-10 border-4 border-[#54A0FF] rotate-45 pointer-events-none opacity-40 sm:opacity-90 z-0"></div>
      <div className="absolute top-[500px] left-[8%] w-14 h-4 bg-[#EE5253] rounded-full rotate-12 pointer-events-none opacity-40 sm:opacity-90 z-0"></div>
      <div className="absolute top-[450px] left-[90%] w-8 h-8 bg-[#00D2D3] rounded-full pointer-events-none opacity-40 sm:opacity-90 z-0"></div>
      <div className="absolute bottom-24 left-[75%] w-10 h-10 bg-[#F368E0] rounded-sm -rotate-45 pointer-events-none opacity-40 sm:opacity-90 z-0"></div>
      <div className="absolute top-[680px] right-12 w-16 h-4 bg-[#10AC84] rounded-full rotate-45 pointer-events-none opacity-40 sm:opacity-90 z-0"></div>

      {/* Outer Layout Centered Wrapper */}
      <div className="max-w-6xl mx-auto px-4 pt-6 sm:pt-10 flex flex-col gap-6 sm:gap-8 relative z-10">
        
        {/* Top Navigation / Branding from design specs */}
        <header className="flex justify-between items-center z-10 w-full mb-2">
          <div className="text-xl sm:text-2xl font-black tracking-tighter bg-white px-5 py-2 rounded-full border-4 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] uppercase">
            BIRTHDAY.VIBES ⚡
          </div>
          <div className="flex gap-2">
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center border-4 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] font-bold text-lg">🎈</div>
            <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center border-4 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] font-bold text-lg">🎂</div>
          </div>
        </header>

        {/* Top Header Card: Profile Spotlight of Birthday Honoree */}
        <header id="birthday-chief-card" className="w-full bg-white rounded-[40px] p-6 sm:p-8 border-4 border-[#1A1A1A] shadow-[12px_12px_12px_0px_rgba(26,26,26,0.15)] md:shadow-[12px_12px_0px_0px_#1A1A1A] relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
          
          {/* Creative floating gold text tag */}
          <div className="absolute -top-3 -right-3 sm:top-5 sm:right-5 bg-[#FFD700] text-[#1A1A1A] font-black text-xs px-4 py-2.5 rounded-full border-3 border-[#1A1A1A] rotate-6 shadow-[3px_3px_0px_0px_#1A1A1A] z-10 select-none">
            IT&apos;S YOUR DAY! 👑
          </div>

          {/* Elegant Profile Picture framed elegantly with a solid thick border */}
          <div className="relative group shrink-0">
            {/* Pulsing neo-brutal offset highlight */}
            <div className="absolute inset-0 bg-[#FF6B6B] rounded-full border-4 border-[#1A1A1A] translate-x-2 translate-y-2 group-hover:translate-x-1 group-hover:translate-y-1 transition-transform" />
            
            <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-[#1A1A1A] bg-[#4ECDC4] flex items-center justify-center z-10">
              <img
                src={birthdayBoyCartoon}
                alt="Bhaiya Cartoon Portrait"
                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Sparkle decorative indicator */}
            <div className="absolute -bottom-1 -right-1 bg-[#FFD700] text-[#1A1A1A] p-2 rounded-full shadow-[2px_2px_0px_0px_#1A1A1A] border-3 border-[#1A1A1A] select-none z-20 animate-bounce">
              <Sparkles className="w-4 h-4 text-[#1A1A1A]" />
            </div>
          </div>

          {/* Profile Name and Info Detail */}
          <div className="flex-1 text-center md:text-left flex flex-col gap-3 relative z-5">
            <span className="text-xs uppercase font-black tracking-widest text-[#1A1A1A] px-4 py-1.5 bg-[#4ECDC4] border-2 border-[#1A1A1A] rounded-full w-fit mx-auto md:mx-0 flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#1A1A1A] rotate-[-1deg] select-none">
              <Heart className="w-3.5 h-3.5 fill-[#1A1A1A] text-[#1A1A1A]" />
              BIRTHDAY SPOTLIGHT
            </span>

            <div className="flex flex-col gap-1.5 items-center md:items-start">
              <h1 className="flex flex-col items-center md:items-start leading-none select-none">
                <span className="text-3xl sm:text-5xl font-black tracking-tight text-[#1A1A1A] uppercase font-display">
                  HAPPY BIRTHDAY,
                </span>
                <span className="text-4xl sm:text-6xl font-black uppercase text-[#FF6B6B] tracking-tighter drop-shadow-[4px_4px_0px_#1A1A1A] font-display mt-0.5">
                  {honoreeName}!
                </span>
              </h1>
            </div>

            {/* Quick Stats list */}
            <div className="flex flex-wrap gap-4 items-center justify-center md:justify-start mt-2">
              <button
                id="blowouts-pill-btn"
                onClick={triggerConfettiBurst}
                className="flex items-center gap-1.5 text-xs font-black text-[#1A1A1A] bg-white border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] hover:bg-[#FFF0F2] px-4 py-2 rounded-full cursor-pointer select-none rotate-[1deg] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_#1A1A1A] transition-all"
                title="Puff and generate confetti magic!"
              >
                <Award className="w-3.5 h-3.5 text-[#FF9F43]" />
                <span>{blowoutsCount} CAKE BLOWOUTS</span>
              </button>
            </div>
          </div>
        </header>

        {/* Exclusive Beautiful Interactive Gift Box Section */}
        <section id="giftbox-interactive-section" className="w-full">
          <GiftBox onOpen={triggerConfettiBurst} honoreeName={honoreeName} />
        </section>

        {/* Middle Two-Column Grid: Left Controls & Music / Right Interactive Cake */}
        <section id="party-interaction-grid" className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full">
          
          {/* Column A (width: 5) - Celebration Controls & Synthesizer */}
          <div className="col-span-1 md:col-span-5 flex flex-col gap-6">
            
            {/* Retro Synthesizer Music Box */}
            <div id="retro-synthesizer-card" className="bg-white rounded-[32px] border-4 border-[#1A1A1A] p-5 shadow-[8px_8px_0px_0px_#1A1A1A] flex flex-col gap-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b-2 border-gray-100 pb-2">
                <span className="text-xs font-black text-gray-800 tracking-wider flex items-center gap-1 uppercase">
                  <Volume2 className="w-4 h-4 text-[#FF6B6B] animate-pulse" />
                  SYNTH MUSIC BOX & CELEBRATION VIDEO 📻📽️
                </span>
                <span className="text-[9px] font-black text-[#1A1A1A] bg-[#4ECDC4] border border-[#1A1A1A] px-2 py-0.5 rounded-full uppercase">
                  ACTIVE SYNC
                </span>
              </div>

              {/* Flex or Grid container for Side-by-Side on larger, stack on smaller */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                
                {/* Column 1 - Music Controls */}
                <div className="flex flex-col gap-4 justify-between">
                  <p className="text-[11px] font-semibold text-gray-600 leading-relaxed">
                    Play the retro synthesized &quot;Happy Birthday&quot; melody crafted purely using browser frequencies!
                  </p>

                  {/* Player control interface */}
                  <div className="flex items-center gap-3 bg-[#FFE8EC]/35 p-3 rounded-2xl border-2 border-[#1A1A1A]">
                    {isPlayingMusic ? (
                      <button
                         id="stop-music-btn"
                         onClick={stopHappyBirthdayMelody}
                         className="p-3.5 bg-[#FF6B6B] hover:bg-[#eb5e5e] text-white border-3 border-[#1A1A1A] rounded-full transition-all shadow-[2px_2px_0px_0px_#1A1A1A] hover:translate-y-[1px] cursor-pointer"
                         title="Stop song"
                       >
                        <Square className="w-4 h-4 fill-white text-white" />
                      </button>
                    ) : (
                      <button
                        id="play-music-btn"
                        onClick={playHappyBirthdayMelody}
                        className="p-3.5 bg-[#4ECDC4] hover:bg-[#41b7b0] text-[#1A1A1A] border-3 border-[#1A1A1A] rounded-full transition-all shadow-[2px_2px_0px_0px_#1A1A1A] hover:translate-y-[1px] cursor-pointer animate-bounce"
                        title="Play song"
                      >
                        <Play className="w-4 h-4 fill-current ml-0.5" />
                      </button>
                    )}

                    <div className="flex-1">
                      <div className="text-xs font-black text-gray-800 uppercase tracking-tight">
                        {isPlayingMusic ? '🎵 Playing & Syncing...' : '🔇 Not Playing'}
                      </div>
                      <div className="text-[10px] text-[#FF6B6B] font-bold uppercase tracking-wider">
                        {isPlayingMusic ? 'Melody + Video is live' : 'Tap play to celebrate!'}
                      </div>
                    </div>
                  </div>

                  {/* Tempo adjustments */}
                  <div>
                    <label className="block text-[11px] font-black text-gray-600 uppercase mb-1.5">Melody Tempo Vibe</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'CHILL ☕', val: 90 },
                        { label: 'CLASSIC 🎂', val: 120 },
                        { label: 'SAMBA 💃', val: 165 },
                      ].map(item => (
                        <button
                          key={item.val}
                          id={`music-tempo-btn-${item.val}`}
                          onClick={() => {
                            setMusicTempo(item.val);
                            if (isPlayingMusic) {
                              setTimeout(playHappyBirthdayMelody, 50);
                            }
                          }}
                          className={`text-[10px] py-1.5 rounded-xl border-2 border-[#1A1A1A] font-extrabold transition-all cursor-pointer ${
                            musicTempo === item.val
                            ? 'bg-[#FF9F43] text-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A]'
                            : 'bg-white text-[#1A1A1A] hover:bg-[#FFD700]'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Column 2 - Celebration Video Side-by-Side */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-wider flex items-center gap-1 leading-none">
                    <Tv className="w-3.5 h-3.5 text-[#FF6B6B]" />
                    CELEBRATION VIDEO 📽️
                  </span>
                  <div className="relative aspect-video w-full rounded-2xl border-4 border-[#1A1A1A] bg-[#1A1A1A] overflow-hidden shadow-[4px_4px_0px_0px_#1A1A1A]">
                    <iframe
                      src={isPlayingMusic 
                        ? "https://player.cloudinary.com/embed/?cloud_name=dipocg3as&public_id=downloaded-file_rdqhsc&autoplay=true&muted=0"
                        : "https://player.cloudinary.com/embed/?cloud_name=dipocg3as&public_id=downloaded-file_rdqhsc&autoplay=false&muted=0"
                      }
                      width="100%"
                      height="100%"
                      allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full border-none"
                    />
                    {!isPlayingMusic && (
                      <div 
                        onClick={playHappyBirthdayMelody}
                        className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-white hover:bg-amber-50 cursor-pointer select-none transition-all duration-300 group z-10"
                      >
                        <Play className="w-12 h-12 text-[#FF6B6B] mb-2.5 group-hover:scale-110 transition-transform duration-300 animate-pulse" />
                        <span className="text-xs font-black text-[#1A1A1A] uppercase tracking-widest leading-tight">
                          CLICK PLAY TO START VIDEO & SONG
                        </span>
                        <span className="text-[9px] font-bold text-[#FF6B6B] uppercase mt-1 tracking-wider">
                          Synchronized Celebration Stream
                        </span>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Confetti Configuration Panel */}
            <div id="confetti-config-card" className="bg-white rounded-[32px] border-4 border-[#1A1A1A] p-5 shadow-[8px_8px_0px_0px_#1A1A1A] flex flex-col gap-4 relative overflow-hidden">
              <div className="flex items-center justify-between border-b-2 border-gray-100 pb-2">
                <span className="text-xs font-black text-gray-800 tracking-wider flex items-center gap-1 uppercase">
                  <Settings className="w-4 h-4 text-[#FF9F43] animate-spin" style={{ animationDuration: '6s' }} />
                  CONFETTI PANEL 🎊
                </span>
                <button
                  id="action-burst-confetti"
                  onClick={triggerConfettiBurst}
                  className="text-xs font-black px-4 py-2 bg-[#FF6B6B] hover:bg-[#f05a5a] text-white rounded-xl border-2 border-[#1A1A1A] shadow-[3px_3px_0px_0px_#1A1A1A] cursor-pointer transition-all uppercase tracking-tight"
                >
                  BLAST 💥
                </button>
              </div>

              {/* Type Picker */}
              <div>
                <label className="block text-[11px] font-black text-gray-600 uppercase mb-1.5">Confetti Material</label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { value: 'colorful', label: 'RAINBOW 🎨' },
                    { value: 'gold', label: 'GOLD ✨' },
                    { value: 'neon', label: 'NEON 🕺' },
                    { value: 'stars', label: 'STARS ⭐' },
                    { value: 'emojis', label: 'EMOJIS 🥳' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      id={`confetti-material-btn-${opt.value}`}
                      onClick={() => setConfettiConfig(prev => ({ ...prev, type: opt.value as any }))}
                      className={`text-[10px] font-black px-3 py-2 rounded-xl border-2 border-[#1A1A1A] transition-all cursor-pointer ${
                        confettiConfig.type === opt.value
                        ? 'bg-[#4ECDC4] text-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A]'
                        : 'bg-white text-[#1A1A1A] hover:bg-[#4ECDC4]/30'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Density control */}
              <div>
                <label className="block text-[11px] font-black text-gray-600 uppercase mb-1.5">Falling Blizzard Level</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'BREEZE 🍃', value: 1 },
                    { label: 'NORMAL 🎈', value: 2 },
                    { label: 'BLIZZARD ❄️', value: 3 },
                  ].map(item => (
                    <button
                      key={item.value}
                      id={`confetti-density-btn-${item.value}`}
                      onClick={() => setConfettiConfig(prev => ({ ...prev, density: item.value }))}
                      className={`text-[10px] py-2 bg-white hover:bg-gray-50 border-2 border-[#1A1A1A] rounded-xl font-black transition-all cursor-pointer ${
                        confettiConfig.density === item.value
                        ? 'bg-[#FF9F43] text-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A]'
                        : 'text-[#1A1A1A]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Column B (width: 7) - Interactive Birthday Cake wrapper */}
          <div className="col-span-1 md:col-span-7">
            <BirthdayCake onAllBlowOut={handleCakeAllBlowout} />
          </div>

        </section>

        {/* Dynamic footer matching theme design */}
        <footer className="w-full bg-white rounded-3xl p-6 border-4 border-[#1A1A1A] shadow-[6px_6px_0px_0px_#1A1A1A] flex flex-col sm:flex-row justify-between items-center gap-4 mt-4">
          <div className="flex flex-col text-center sm:text-left">
            <span className="text-4xl font-extrabold tracking-tighter opacity-30 uppercase font-display leading-none">21 / 06</span>
            <span className="font-black text-[11px] uppercase tracking-widest text-[#1A1A1A]">Celebration Date</span>
          </div>
          <div className="bg-[#1A1A1A] text-white px-5 py-3 rounded-2xl flex items-center gap-3.5">
            <div className="animate-pulse w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="font-extrabold text-xs uppercase tracking-wide">VIRTUAL PARTY ROOM ACTIVE</span>
          </div>
        </footer>

      </div>
    </div>
  );
}
