import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Volume2, VolumeX, Sparkles, Star, Heart, ArrowRight } from 'lucide-react';
import { REUNION_CONFIG } from '../config/reunionConfig';
import { sound } from '../utils/soundEffects';

interface OpeningSceneProps {
  onEnter: () => void;
}

export const OpeningScene: React.FC<OpeningSceneProps> = ({ onEnter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [stars, setStars] = useState<Array<{ id: number; left: number; top: number; size: number; delay: number }>>([]);

  // Generate gentle decorative floating golden stars
  useEffect(() => {
    const starList = Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      left: Math.random() * 95,
      top: Math.random() * 95,
      size: Math.random() * 14 + 10,
      delay: Math.random() * 3
    }));
    setStars(starList);
  }, []);

  const handleOpenEnvelope = () => {
    if (isOpen) return;
    sound.playPop();
    setIsOpen(true);

    // Warm celebratory confetti burst
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#E9B95B', '#E9B8B0', '#F6C9A8', '#594337', '#FFFFFF']
    });
  };

  const handleEnterSite = () => {
    sound.playSchoolBell();
    setIsEntering(true);
    setTimeout(() => {
      onEnter();
    }, 500);
  };

  const toggleSound = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-[#FFF5E8] flex flex-col items-center justify-center p-4 select-none">
      {/* Floating Golden Stars (★) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {stars.map((s) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0.4, scale: 0.8 }}
            animate={{
              opacity: [0.3, 0.85, 0.3],
              scale: [0.9, 1.2, 0.9],
              y: [0, -12, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: s.delay,
              ease: "easeInOut"
            }}
            style={{
              position: 'absolute',
              left: `${s.left}%`,
              top: `${s.top}%`,
              color: '#E9B95B',
              fontSize: `${s.size}px`
            }}
          >
            ★
          </motion.div>
        ))}
      </div>

      {/* Top Header Controls */}
      <header className="absolute top-4 left-4 right-4 max-w-5xl mx-auto flex items-center justify-between z-20">
        <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full clay-pill bg-[#FFFFFF] text-[#594337] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-[#E9B95B]" />
          <span>Star Matric Reunion 2026</span>
        </div>

        <button
          onClick={toggleSound}
          aria-label={isMuted ? "Unmute audio" : "Mute audio"}
          className="clay-button p-2.5 rounded-full bg-[#FFFFFF] text-[#594337] hover:text-[#E9B95B]"
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </header>

      {/* 3D CLAY ENVELOPE INTERACTION CONTAINER */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center perspective-1000 mt-6">
        
        {/* Envelope Outer Box */}
        <div className="relative w-full aspect-[4/3] max-w-[390px] mx-auto preserve-3d">
          
          {/* Envelope Back Surface */}
          <div 
            className="absolute inset-0 rounded-[32px] bg-[#F0E1CE]"
            style={{
              boxShadow: '10px 14px 28px rgba(89, 67, 55, 0.14), -8px -8px 24px rgba(255, 255, 255, 0.9)'
            }}
          />

          {/* LETTER CARD (Sliding Upwards out of envelope) */}
          <motion.div
            initial={false}
            animate={
              isOpen
                ? { y: -140, rotateX: 0, opacity: 1, scale: 1.02 }
                : { y: 0, opacity: 0.9, scale: 0.96 }
            }
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
            className="absolute inset-x-4 top-4 bottom-4 rounded-[24px] bg-[#FFFFFF] p-6 flex flex-col justify-between z-10 border border-[#F0E1CE]"
            style={{
              boxShadow: '6px 8px 20px rgba(89, 67, 55, 0.12), -4px -4px 14px rgba(255, 255, 255, 0.9)'
            }}
          >
            {/* Letter Header */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center space-x-1.5 text-[#E9B95B]">
                <span>★</span>
                <span className="text-[11px] font-black uppercase tracking-widest text-[#927B6C]">
                  Official Invitation
                </span>
                <span>★</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#594337] tracking-tight">
                {REUNION_CONFIG.schoolName}
              </h2>
              <p className="text-xs font-semibold text-[#E9B8B0]">
                {REUNION_CONFIG.batchName}
              </p>
            </div>

            {/* Nostalgic Invitation Letter Body */}
            <div className="my-2 p-3.5 rounded-2xl bg-[#FFF5E8] border border-[#F0E1CE] text-center space-y-1.5">
              <p className="text-xs sm:text-sm font-bold text-[#594337] italic font-kalam">
                "{REUNION_CONFIG.headline}"
              </p>
              <p className="text-[11px] text-[#927B6C] leading-relaxed">
                Our cherished classrooms, shared laughter, and unforgettable school moments are waiting. You are warmly invited to celebrate together!
              </p>
              <div className="pt-1 flex items-center justify-center space-x-3 text-[11px] font-bold text-[#594337]">
                <span>📅 {REUNION_CONFIG.defaultEventDateText}</span>
                <span>•</span>
                <span>⏰ 10:00 AM</span>
              </div>
            </div>

            {/* In-Letter Next Button */}
            {isOpen && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={handleEnterSite}
                disabled={isEntering}
                className="w-full py-2.5 px-4 rounded-[14px] clay-button-gold text-xs sm:text-sm font-black flex items-center justify-center space-x-1.5 shadow-sm"
              >
                <span>{isEntering ? "Entering..." : "Next →"}</span>
              </motion.button>
            )}
          </motion.div>

          {/* Envelope Front Pocket Body */}
          <div 
            className="absolute inset-x-0 bottom-0 h-[68%] rounded-b-[32px] rounded-t-[12px] bg-gradient-to-t from-[#E2CEB7] to-[#F0E1CE] z-20 pointer-events-none flex items-end justify-center pb-4"
            style={{
              boxShadow: 'inset 0 4px 10px rgba(255, 255, 255, 0.8), 0 8px 18px rgba(89, 67, 55, 0.12)'
            }}
          >
            <div className="flex items-center space-x-2 text-xs font-black text-[#725747]/70 uppercase tracking-widest">
              <span>★</span>
              <span>Batch 2024 - 2025 Grand Reunion</span>
              <span>★</span>
            </div>
          </div>

          {/* Envelope Top Flap (Opens Upwards with 3D RotateX) */}
          <motion.div
            initial={false}
            animate={
              isOpen
                ? { rotateX: 180, zIndex: 5 }
                : { rotateX: 0, zIndex: 30 }
            }
            transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
            style={{ transformOrigin: 'top center' }}
            className="absolute top-0 inset-x-0 h-[52%] rounded-t-[32px] rounded-b-[24px] bg-[#E2CEB7] border-b border-[#D8C1A8] flex items-center justify-center cursor-pointer preserve-3d"
            onClick={handleOpenEnvelope}
          >
            {/* Golden Wax Seal on Flap */}
            {!isOpen && (
              <motion.div 
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.95 }}
                className="w-16 h-16 rounded-full bg-gradient-to-br from-[#F2CE85] via-[#E9B95B] to-[#D99F37] flex flex-col items-center justify-center border-2 border-[#FFFFFF] shadow-lg shadow-[#E9B95B]/40"
              >
                <span className="text-xl">🎓</span>
                <span className="text-[9px] font-black tracking-wider text-[#413027]">2026</span>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Action Controls Below Envelope */}
        <div className="mt-8 text-center z-30 space-y-3">
          {!isOpen ? (
            <div className="flex flex-col items-center gap-2.5">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleOpenEnvelope}
                className="px-8 py-3.5 rounded-[20px] clay-button-gold text-sm sm:text-base font-black tracking-wide flex items-center space-x-2.5 mx-auto shadow-md"
              >
                <Sparkles className="w-4 h-4 text-[#413027]" />
                <span>OPEN INVITATION CARD</span>
              </motion.button>

              <button
                onClick={handleEnterSite}
                className="px-4 py-1.5 rounded-full clay-button text-xs text-[#927B6C] hover:text-[#594337] font-bold flex items-center space-x-1 border border-[#F0E1CE]"
              >
                <span>Next →</span>
              </button>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center gap-3"
            >
              <button
                onClick={handleEnterSite}
                disabled={isEntering}
                className="px-7 py-2.5 rounded-[16px] clay-button-gold text-sm font-black flex items-center space-x-2 shadow-md hover:scale-105 transition"
              >
                <span>{isEntering ? "Entering..." : "Next →"}</span>
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
