import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Mic, MicOff, Flame, FlameKindling, RefreshCw } from 'lucide-react';

interface BirthdayCakeProps {
  onAllBlowOut: () => void;
}

export const BirthdayCake: React.FC<BirthdayCakeProps> = ({ onAllBlowOut }) => {
  const [candleCount, setCandleCount] = useState<number>(5);
  // Track state of each candle (true = lit, false = blown out)
  const [candles, setCandles] = useState<boolean[]>(Array(5).fill(true));
  const [isMicEnabled, setIsMicEnabled] = useState<boolean>(false);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [showBlowSuccess, setShowBlowSuccess] = useState<boolean>(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const javascriptNodeRef = useRef<AudioWorkletNode | ScriptProcessorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Resize candles array when count changes
  useEffect(() => {
    setCandles(Array(candleCount).fill(true));
    setShowBlowSuccess(false);
  }, [candleCount]);

  // Audio synthesis for celebration chimes and blowout
  const playSynthesizedChime = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play a delightful, warm major pentatonic celebration arpeggio
    const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]; // C5, D5, E5, G5, A5, C6
    notes.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + index * 0.12);
      
      gain.gain.setValueAtTime(0.3, ctx.currentTime + index * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + index * 0.12 + 0.6);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + index * 0.12);
      osc.stop(ctx.currentTime + index * 0.12 + 0.65);
    });
  };

  const playBlowSound = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play a white noise whoosh sound simulating blowout puff
    const bufferSize = ctx.sampleRate * 0.4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.35);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.38);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start();
    noise.stop(ctx.currentTime + 0.4);
  };

  // Toggle single candle state
  const handleCandleClick = (index: number) => {
    const newCandles = [...candles];
    newCandles[index] = !newCandles[index];
    setCandles(newCandles);
    
    if (newCandles[index]) {
      // Lit candle sound
      playShortChime(600);
    } else {
      // Extinguished candle sound
      playShortChime(250);
      checkAllBlownOut(newCandles);
    }
  };

  const playShortChime = (freq: number) => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.16);
  };

  const checkAllBlownOut = (currentCandles: boolean[]) => {
    const anyLeft = currentCandles.some(c => c === true);
    if (!anyLeft && currentCandles.length > 0) {
      setShowBlowSuccess(true);
      playSynthesizedChime();
      onAllBlowOut();
    }
  };

  const blowVolumeTrigger = 35; // Sensitivity threshold (1-100 scale)

  // Blow out everything with a puff button or microphone puff
  const blowOutAllCandles = () => {
    setCandles(Array(candleCount).fill(false));
    playBlowSound();
    setShowBlowSuccess(true);
    playSynthesizedChime();
    onAllBlowOut();
  };

  const relightCandles = () => {
    setCandles(Array(candleCount).fill(true));
    setShowBlowSuccess(false);
    playShortChime(440);
  };

  // Microphone sound-capturing hook
  useEffect(() => {
    if (!isMicEnabled) {
      cleanupMic();
      return;
    }

    const initMic = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;
        analyserRef.current = analyser;

        const micro = audioCtx.createMediaStreamSource(stream);
        microphoneRef.current = micro;

        const javascriptNode = audioCtx.createScriptProcessor(2048, 1, 1);
        javascriptNodeRef.current = javascriptNode;

        micro.connect(analyser);
        analyser.connect(javascriptNode);
        javascriptNode.connect(audioCtx.destination);

        javascriptNode.onaudioprocess = () => {
          const array = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(array);
          let values = 0;

          const length = array.length;
          for (let i = 0; i < length; i++) {
            values += array[i];
          }

          const average = values / length;
          // Scale volume to 0-100 range
          const volume = Math.min(100, Math.round((average / 110) * 100));
          setMicVolume(volume);

          // Blow out trigger
          if (volume > blowVolumeTrigger) {
            setCandles(prev => {
              const anyLit = prev.some(c => c === true);
              if (anyLit) {
                // Extinguish them incrementally or all at once depending on puff strength
                const indexToBlow = prev.findIndex(c => c === true);
                if (indexToBlow !== -1) {
                  const updated = [...prev];
                  updated[indexToBlow] = false;
                  playBlowSound();
                  
                  // Check if this was the last one
                  const stillAnyLit = updated.some(c => c === true);
                  if (!stillAnyLit) {
                    setTimeout(() => {
                      setShowBlowSuccess(true);
                      playSynthesizedChime();
                      onAllBlowOut();
                    }, 100);
                  }
                  return updated;
                }
              }
              return prev;
            });
          }
        };
      } catch (err) {
        console.error("Failed to fetch microphone input stream for interactive blow out:", err);
        setIsMicEnabled(false);
      }
    };

    initMic();

    return () => {
      cleanupMic();
    };
  }, [isMicEnabled]);

  const cleanupMic = () => {
    // stop media tracks
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    // disconnect nodes
    if (javascriptNodeRef.current) {
      javascriptNodeRef.current.disconnect();
      javascriptNodeRef.current = null;
    }
    if (microphoneRef.current) {
      microphoneRef.current.disconnect();
      microphoneRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    setMicVolume(0);
  };

  return (
    <div id="birthday-cake-container" className="flex flex-col items-center select-none py-6 px-4 bg-white rounded-[32px] border-4 border-[#1A1A1A] shadow-[8px_8px_0px_0px_#1A1A1A] max-w-sm w-full mx-auto relative overflow-hidden">
      
      {/* Sparkles / status bar */}
      <div className="flex w-full items-center justify-between mb-4">
        <span className="text-xs font-black text-[#1A1A1A] tracking-tight flex items-center gap-1 uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#FF6B6B]" />
          INTERACTIVE CAKE
        </span>
        <div className="flex gap-1 items-center">
          {[3, 5, 7, 10].map(cnt => (
            <button
              key={cnt}
              id={`candle-selector-${cnt}`}
              onClick={() => setCandleCount(cnt)}
              className={`text-xs px-2.5 py-1 rounded-lg font-black transition-all border-2 border-[#1A1A1A] ${
                candleCount === cnt 
                ? 'bg-[#FF9F43] text-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A]' 
                : 'bg-white text-[#1A1A1A] hover:bg-[#FFD700]/20'
              }`}
            >
              {cnt}
            </button>
          ))}
        </div>
      </div>

      {/* Mic control and blowout HUD */}
      <div className="flex w-full justify-between items-center bg-[#FFE5E9]/50 p-2.5 rounded-2xl mb-6 border-2 border-[#1A1A1A]">
        <button
          id="mic-on-off-btn"
          onClick={() => setIsMicEnabled(!isMicEnabled)}
          className={`flex items-center gap-1.5 text-xs font-black px-3.5 py-2 rounded-xl transition-all border-2 border-[#1A1A1A] ${
            isMicEnabled 
            ? 'bg-[#FF6B6B] text-white shadow-[2px_2px_0px_0px_#1A1A1A] animate-pulse' 
            : 'bg-white text-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] hover:bg-[#FFD700]/30'
          }`}
        >
          {isMicEnabled ? (
            <>
              <Mic className="w-3.5 h-3.5" />
              Blow now!
            </>
          ) : (
            <>
              <MicOff className="w-3.5 h-3.5" />
              Use Mic
            </>
          )}
        </button>

        {isMicEnabled && (
          <div className="flex items-center gap-1.5 flex-1 pl-3">
            <div className="w-full h-3.5 bg-white border-2 border-[#1A1A1A] rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-75 ${
                  micVolume > blowVolumeTrigger ? 'bg-[#FF6B6B] animate-pulse' : 'bg-[#4ECDC4]'
                }`}
                style={{ width: `${micVolume}%` }}
              />
            </div>
            <span className="text-[10px] font-black text-[#1A1A1A] w-6 text-right">
              {micVolume}%
            </span>
          </div>
        )}

        {!isMicEnabled && (
          <div className="flex gap-1.5">
            <button
              id="extinguish-all-btn"
              onClick={blowOutAllCandles}
              className="px-3.5 py-2 bg-[#4ECDC4] hover:bg-[#3db0a7] text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] rounded-xl text-xs font-black cursor-pointer transition-transform duration-75 active:translate-y-[2px]"
            >
              Blow All
            </button>
            <button
              id="relight-all-btn"
              onClick={relightCandles}
              className="p-2 bg-[#FF9F43] hover:bg-[#ea923b] text-[#1A1A1A] border-2 border-[#1A1A1A] shadow-[2px_2px_0px_0px_#1A1A1A] rounded-xl cursor-pointer"
              title="Relight candles"
            >
              <RefreshCw className="w-3.5 h-3.5 font-bold" />
            </button>
          </div>
        )}
      </div>

      {/* The Visual Cake Render */}
      <div className="relative h-64 w-full flex flex-col justify-end items-center mb-4 mt-8">
        
        {/* Render Candles above Cake */}
        <div className="absolute top-0 flex justify-center items-end gap-3 z-30 w-full" style={{ bottom: '150px' }}>
          {candles.map((isLit, i) => (
            <div 
              key={i} 
              id={`candle-wrapper-${i}`}
              onClick={() => handleCandleClick(i)}
              className="flex flex-col items-center cursor-pointer transition-transform duration-200 hover:scale-110 relative"
              style={{ bottom: i % 2 !== 0 ? '1px' : '6px' }}
            >
              {/* Flame Component */}
              {isLit ? (
                <div className="absolute -top-7 select-none animate-bounce flex flex-col items-center">
                  <div className="w-4 h-6 rounded-full bg-gradient-to-t from-red-500 via-orange-400 to-yellow-200 opacity-90 blur-[1px] animate-pulse relative" style={{ animationDuration: `${0.4 + i*0.1}s` }}>
                    <div className="absolute bottom-1 left-1.5 w-1 h-2 rounded-full bg-blue-300 opacity-80" />
                  </div>
                  {/* Fire light glow */}
                  <div className="absolute -top-1 w-6 h-6 rounded-full bg-yellow-300/30 blur-md pointer-events-none animate-pulse" />
                </div>
              ) : (
                <div className="absolute -top-3 w-1 h-3 flex flex-col items-center">
                  {/* Smoke puff */}
                  <div className="w-1.5 h-2 bg-gray-400/40 rounded-full animate-ping opacity-0" style={{ animationDelay: '50ms' }} />
                </div>
              )}
              
              {/* Wick */}
              <div className="w-[1.5px] h-2 bg-gray-800" />
              
              {/* Body */}
              <div 
                className={`w-3.5 h-12 rounded-t-sm transition-all border-2 border-[#1A1A1A] shadow-sm ${
                  i % 3 === 0 ? 'bg-[#FF6B6B]' :
                  i % 3 === 1 ? 'bg-[#FF9F43]' :
                  'bg-[#4ECDC4]'
                }`}
              >
                {/* Diagonal candle spiral decorations */}
                <div className="w-full h-1 bg-white/40 rotate-12 mt-1.5" />
                <div className="w-full h-1 bg-white/40 rotate-12 mt-2" />
              </div>
            </div>
          ))}
        </div>

        {/* Cake Tier 3 (Top - Smallest) */}
        <div id="cake-tier-3" className="w-[120px] h-12 bg-pink-100 rounded-t-xl border-x-4 border-t-2 border-[#1A1A1A] relative z-25 flex justify-center items-end" style={{ marginBottom: '-4px' }}>
          {/* Icing frosting drips */}
          <div className="absolute inset-x-0 top-0 h-4 bg-[#FFE8EC] rounded-t-lg flex justify-around border-b-2 border-[#1A1A1A]">
            <div className="w-5 h-6 bg-[#FFE8EC] rounded-b-full border-r border-[#1A1A1A]" />
            <div className="w-4 h-7 bg-[#FFE8EC] rounded-b-full border-x border-[#1A1A1A]" />
            <div className="w-5 h-5 bg-[#FFE8EC] rounded-b-full border-x border-[#1A1A1A]" style={{ marginTop: '1px' }} />
            <div className="w-4 h-6 bg-[#FFE8EC] rounded-b-full border-l border-[#1A1A1A]" />
          </div>
          {/* Sprinkles decoration */}
          <div className="absolute top-5 inset-x-2 flex justify-around gap-1">
            <div className="w-1 h-2 rounded bg-amber-400 rotate-45 transform" />
            <div className="w-1.5 h-1 rounded bg-[#6BCB77] -rotate-12 transform" />
            <div className="w-1 h-2 rounded bg-sky-400 rotate-12 transform" />
            <div className="w-1 h-1 rounded-full bg-pink-500" />
          </div>
          <div className="w-3.5 h-3.5 rounded-full bg-[#FF4971] border-2 border-[#1A1A1A] shadow-sm mb-0.5 absolute -top-1.5" />
        </div>

        {/* Cake Tier 2 (Middle) */}
        <div id="cake-tier-2" className="w-[180px] h-14 bg-[#FFDEE4] rounded-t-2xl border-x-4 border-t-2 border-[#1A1A1A] relative z-20 flex justify-center" style={{ marginBottom: '-4px' }}>
          {/* Dripping Chocolate or strawberry glaze frosting */}
          <div className="absolute inset-x-0 top-0 h-4.5 bg-[#FF7D9E] rounded-t-xl flex justify-between px-1 border-b-2 border-[#1A1A1A]">
            <div className="w-5 h-7 bg-[#FF7D9E] rounded-b-full border-r border-[#1A1A1A]" />
            <div className="w-4.5 h-8 bg-[#FF7D9E] rounded-b-full border-x border-[#1A1A1A] mt-0.5" />
            <div className="w-6 h-5.5 bg-[#FF7D9E] rounded-b-full border-x border-[#1A1A1A]" />
            <div className="w-5 h-6.5 bg-[#FF7D9E] rounded-b-full border-x border-[#1A1A1A]" />
            <div className="w-4.5 h-8 bg-[#FF7D9E] rounded-b-full border-l border-[#1A1A1A]" />
          </div>
          {/* Confetti sprinkle specks */}
          <div className="absolute top-7 inset-x-4 flex justify-between flex-wrap gap-2 px-2">
            <div className="w-1.5 h-2 rounded bg-[#FFE17D] rotate-12" />
            <div className="w-2.5 h-1.5 rounded bg-[#B983FF] -rotate-45" />
            <div className="w-1 h-1.5 rounded bg-sky-300" />
          </div>
        </div>

        {/* Cake Tier 1 (Bottom - Widest) */}
        <div id="cake-tier-1" className="w-[235px] h-16 bg-[#FFF] rounded-t-3xl border-x-4 border-t-2 border-[#1A1A1A] relative z-10 flex justify-center shadow-lg">
          {/* Dripping white frosting with sprinkles */}
          <div className="absolute inset-x-0 top-0 h-4.5 bg-white rounded-t-2xl flex justify-between px-2 border-b-2 border-[#1A1A1A]">
            <div className="w-6 h-8 bg-white rounded-b-full border-r-2 border-[#1A1A1A]" />
            <div className="w-7 h-9 bg-white rounded-b-full border-x-2 border-[#1A1A1A]" />
            <div className="w-6 h-6 bg-white rounded-b-full border-x-2 border-[#1A1A1A]" />
            <div className="w-5 h-8.5 bg-white rounded-b-full border-x-2 border-[#1A1A1A]" />
            <div className="w-6 h-6 bg-white rounded-b-full border-x-2 border-[#1A1A1A]" />
            <div className="w-5 h-7 bg-white rounded-b-full border-l-2 border-[#1A1A1A]" />
          </div>
          {/* Confetti decoration */}
          <div className="absolute top-10 inset-x-4 flex justify-around">
            <div className="w-2 h-3 bg-[#FF6B6B] rotate-12 rounded" />
            <div className="w-2.5 h-2 bg-[#4ECDC4] -rotate-12 rounded shadow" />
            <div className="w-2 h-2.5 bg-[#FF9F43] rotate-45 rounded" />
          </div>
        </div>

        {/* Elegant Gold Plate / Base */}
        <div id="cake-plate" className="w-[265px] h-5 bg-[#FFD700] rounded-full border-4 border-[#1A1A1A] shadow-[4px_4px_0px_0px_#1A1A1A] relative z-5 flex items-center justify-center">
          <div className="absolute -bottom-2 w-[210px] h-4.5 bg-black/10 blur-md rounded-full" />
        </div>
      </div>

      {showBlowSuccess ? (
        <div className="text-center animate-bounce duration-1000 mt-2">
          <p className="text-[#FF6B6B] font-black text-sm tracking-tight uppercase">
            🎉 HAPPY BIRTHDAY! 🎉
          </p>
          <span className="text-[10px] text-[#FF9F43] font-black uppercase">Click Relight to restart!</span>
        </div>
      ) : (
        <p className="text-center text-xs text-[#1A1A1A] font-extrabold uppercase px-4 leading-normal mt-2">
          Click candles or let microphone capture your puffs to extinguish!
        </p>
      )}
    </div>
  );
};
