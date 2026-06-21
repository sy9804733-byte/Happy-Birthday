import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Gift, Sparkles, Star, Heart, Copy, Check, Gamepad, HelpCircle } from 'lucide-react';

interface GiftBoxProps {
  onOpen: () => void;
  honoreeName: string;
}

export const GiftBox: React.FC<GiftBoxProps> = ({ onOpen, honoreeName }) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const playOpenSound = () => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Warm rising celebratory fantasy notes
    const freqs = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50]; 
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
      
      gain.gain.setValueAtTime(0.25, ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.08 + 0.4);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(ctx.currentTime + idx * 0.08);
      osc.stop(ctx.currentTime + idx * 0.08 + 0.45);
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    
    // Play subtle high-pitched success beep
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    }

    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleOpenGift = () => {
    if (isOpen) return;
    setIsOpen(true);
    playOpenSound();
    onOpen(); // Trigger confetti burst
  };

  const handleWrapAgain = () => {
    setIsOpen(false);
  };

  return (
    <div id="interactive-giftbox-card" className="bg-white rounded-[32px] border-4 border-[#1A1A1A] p-6 shadow-[8px_8px_0px_0px_#1A1A1A] relative overflow-hidden flex flex-col items-center justify-center min-h-[460px] w-full">
      
      {/* Decorative top badge */}
      <div className="absolute top-4 left-4 bg-[#FF6B6B] text-white text-[10px] font-black uppercase tracking-wider border-2 border-[#1A1A1A] px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_#1A1A1A] flex items-center gap-1.5 z-10">
        <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
        Bhaiya&apos;s Gaming Chest
      </div>

      <AnimatePresence mode="wait">
        {!isOpen ? (
          /* UNOPENED STATE */
          <motion.div
            key="unopened-gift"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center cursor-pointer select-none py-8 w-full h-full text-center"
            onClick={handleOpenGift}
          >
            {/* Box Body with cute realistic Neo-brutalist ribbons */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                rotate: [0, -3, 3, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 2.0, 
                ease: "easeInOut" 
              }}
              className="relative w-44 h-44 flex items-center justify-center filter drop-shadow-[5px_5px_0px_#1A1A1A] hover:scale-105 transition-transform"
            >
              {/* Lid of the gift box */}
              <div className="absolute top-1/4 w-48 h-10 bg-[#FF6B6B] border-4 border-[#1A1A1A] rounded-lg库 z-20 flex justify-center shadow-[0px_4px_0px_0px_#1A1A1A]">
                {/* Horizontal Ribbon and Bow on top */}
                <div className="absolute top-[-26px] left-1/2 -translate-x-1/2 w-16 h-6 flex justify-center gap-1.5">
                  <div className="w-7 h-7 border-4 border-[#1A1A1A] bg-[#FFD700] rounded-full rotate-[45deg]" />
                  <div className="w-7 h-7 border-4 border-[#1A1A1A] bg-[#FFD700] rounded-full rotate-[-45deg]" />
                </div>
                <div className="w-10 h-full bg-[#FFD700] border-x-4 border-[#1A1A1A]" />
              </div>

              {/* Lower Box container */}
              <div className="absolute top-[48%] w-40 h-26 bg-[#FF8E8E] border-4 border-[#1A1A1A] rounded-b-xl z-10 flex justify-center">
                <div className="w-10 h-full bg-[#FFD700] border-x-4 border-[#1A1A1A]" />
              </div>

              {/* Decorative sparkles */}
              <Star className="absolute top-0 left-0 w-6 h-6 text-[#FFD700] fill-[#FFD700]" />
              <Star className="absolute bottom-2 right-0 w-7 h-7 text-[#4ECDC4] fill-[#4ECDC4]" />
            </motion.div>

            <h3 className="text-2xl font-black uppercase text-[#1A1A1A] mt-6 tracking-tight flex items-center gap-2">
              🎁 Tap to Open Your Gift!
            </h3>
            <p className="text-xs text-gray-700 font-bold max-w-md mt-2 uppercase tracking-wider bg-amber-100/60 px-4 py-2 border-2 border-[#1A1A1A] rounded-xl inline-block shadow-[2px_2px_0px_0px_#1A1A1A]">
              Bhaiya, tap this special package to unwrap your Steam treasures! 🎮🖥️
            </p>
          </motion.div>
        ) : (
          /* OPENED STATE: Reveal Game Accounts with absolute gaming dashboard look */
          <motion.div
            key="opened-gift"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex flex-col items-center w-full h-full text-center"
          >
            {/* Header banner */}
            <div className="flex flex-col items-center gap-1 mt-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl animate-bounce">🎂</span>
                <span className="text-xs font-black uppercase text-[#1A1A1A] tracking-wider bg-[#FFD700] border-2 border-[#1A1A1A] px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_#1A1A1A]">
                  HAPPY BIRTHDAY BHAIYA, STEAM ID AUR PASSWORD 🎁
                </span>
                <span className="text-2xl animate-bounce" style={{ animationDelay: '0.15s' }}>🎮</span>
              </div>
            </div>

            {/* Two Side-by-Side neo-brutal gaming cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-2">
              
              {/* GAME CARD A: 007 FIRST LIGHT */}
              <div className="bg-[#FFE8EC] border-4 border-[#1A1A1A] rounded-[24px] p-5 shadow-[6px_6px_0px_0px_#1A1A1A] text-left flex flex-col justify-between relative overflow-hidden min-h-[290px]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF6B6B]/10 rounded-full blur-xl pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase bg-[#FF6B6B] text-white border-2 border-[#1A1A1A] px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_#1A1A1A] flex items-center gap-1.5">
                      <Gamepad className="w-3.5 h-3.5" />
                      007 FIRST LIGHT
                    </span>
                    <span className="text-lg">🕵️‍♂️🔫</span>
                  </div>

                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                    Steam Credentials:
                  </p>

                  <div className="flex flex-col gap-2.5">
                    {/* Username row */}
                    <div className="bg-white border-2 border-[#1A1A1A] rounded-xl p-2.5 flex items-center justify-between shadow-[2px_2px_0px_0px_#1A1A1A]">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-500 uppercase">STEAM ID</span>
                        <span className="font-mono text-sm font-black text-[#1A1A1A]">sf757376</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard('sf757376', '007-id')}
                        className="p-1.5 bg-[#4ECDC4] hover:bg-[#3db8b0] border-2 border-[#1A1A1A] rounded-lg transition-colors cursor-pointer"
                        title="Copy Steam ID"
                      >
                        {copiedField === '007-id' ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-[#1A1A1A]" />}
                      </button>
                    </div>

                    {/* Password row */}
                    <div className="bg-white border-2 border-[#1A1A1A] rounded-xl p-2.5 flex items-center justify-between shadow-[2px_2px_0px_0px_#1A1A1A]">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-500 uppercase">PASSWORD</span>
                        <span className="font-mono text-sm font-black text-[#1A1A1A]">Juj22485</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard('Juj22485', '007-pass')}
                        className="p-1.5 bg-[#FFD700] hover:bg-[#ebc500] border-2 border-[#1A1A1A] rounded-lg transition-colors cursor-pointer"
                        title="Copy Password"
                      >
                        {copiedField === '007-pass' ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-[#1A1A1A]" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-[#1A1A1A]/10 flex items-center justify-between text-[10px] font-black text-[#1A1A1A] uppercase tracking-wide">
                  <span>💥 Active Account Bundle</span>
                  <span>Ready to Play</span>
                </div>
              </div>

              {/* GAME CARD B: SPIDER-MAN: MILES MORALES */}
              <div className="bg-[#E2FFDE] border-4 border-[#1A1A1A] rounded-[24px] p-5 shadow-[6px_6px_0px_0px_#1A1A1A] text-left flex flex-col justify-between relative overflow-hidden min-h-[290px]">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#6BCB77]/10 rounded-full blur-xl pointer-events-none" />
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black uppercase bg-[#6BCB77] text-white border-2 border-[#1A1A1A] px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_#1A1A1A] flex items-center gap-1.5">
                      <Gamepad className="w-3.5 h-3.5" />
                      SPIDER-MAN: MILES MORALES
                    </span>
                    <span className="text-lg">🕷️🕸️</span>
                  </div>

                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
                    Steam Credentials:
                  </p>

                  <div className="flex flex-col gap-2.5">
                    {/* Username row */}
                    <div className="bg-white border-2 border-[#1A1A1A] rounded-xl p-2.5 flex items-center justify-between shadow-[2px_2px_0px_0px_#1A1A1A]">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-500 uppercase">LOGIN ID</span>
                        <span className="font-mono text-sm font-black text-[#1A1A1A]">cnykqx48s</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard('cnykqx48s', 'spidey-id')}
                        className="p-1.5 bg-[#4ECDC4] hover:bg-[#3db8b0] border-2 border-[#1A1A1A] rounded-lg transition-colors cursor-pointer"
                        title="Copy Login"
                      >
                        {copiedField === 'spidey-id' ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-[#1A1A1A]" />}
                      </button>
                    </div>

                    {/* Password row */}
                    <div className="bg-white border-2 border-[#1A1A1A] rounded-xl p-2.5 flex items-center justify-between shadow-[2px_2px_0px_0px_#1A1A1A]">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-gray-500 uppercase">PASSWORD</span>
                        <span className="font-mono text-sm font-black text-[#1A1A1A]">Progamer@</span>
                      </div>
                      <button
                        onClick={() => copyToClipboard('Progamer@', 'spidey-pass')}
                        className="p-1.5 bg-[#FFD700] hover:bg-[#ebc500] border-2 border-[#1A1A1A] rounded-lg transition-colors cursor-pointer"
                        title="Copy Password"
                      >
                        {copiedField === 'spidey-pass' ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-[#1A1A1A]" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-[#1A1A1A]/10 flex items-center justify-between text-[10px] font-black text-[#1A1A1A] uppercase tracking-wide">
                  <span>🦸 Unleash the Hero Inside</span>
                  <span>Ready to Play</span>
                </div>
              </div>

            </div>

            {/* Actions for Opened Gift */}
            <div className="flex flex-col sm:flex-row gap-2.5 w-full max-w-sm mt-8">
              
              <button
                id="close-chest-btn"
                onClick={handleWrapAgain}
                className="flex-1 flex items-center justify-center gap-2 text-xs font-black px-6 py-3.5 bg-white hover:bg-[#FFF0F2] text-[#1A1A1A] border-3 border-[#1A1A1A] rounded-xl shadow-[4px_4px_0px_0px_#1A1A1A] hover:translate-y-[1px] transition-all cursor-pointer uppercase tracking-tight"
              >
                <Gift className="w-4 h-4 text-[#FF6B6B]" />
                Wrap Box 💝
              </button>
              
            </div>

            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-4">
              Happy Gaming, {honoreeName}! 🎉🎮
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
