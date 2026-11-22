import React, { useState } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Bell } from 'lucide-react';
import { sound } from '../utils/soundEffects';

export const SchoolEasterEggs: React.FC = () => {
  const [bellRung, setBellRung] = useState(false);

  const handleRingEasterBell = () => {
    sound.playSchoolBell();
    setBellRung(true);

    confetti({
      particleCount: 70,
      spread: 80,
      origin: { y: 0.8 },
      colors: ['#E9B95B', '#E9B8B0', '#F6C9A8', '#594337', '#FFFFFF']
    });

    setTimeout(() => setBellRung(false), 2000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-center space-y-3">
      <div className="relative group">
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleRingEasterBell}
          className={`w-14 h-14 rounded-full clay-button-gold flex items-center justify-center shadow-lg border-2 border-[#FFFFFF] transition-all ${
            bellRung ? 'animate-bounce' : ''
          }`}
          title="Click to ring school bell & launch celebratory confetti!"
        >
          <Bell className={`w-7 h-7 text-[#413027] fill-[#413027] ${bellRung ? 'animate-swing' : ''}`} />
        </motion.button>

        <div className="absolute right-16 top-1/2 -translate-y-1/2 clay-card bg-[#FFFFFF] text-[#594337] text-[11px] font-bold px-3 py-1.5 rounded-xl border border-[#F0E1CE] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
          🔔 Ring the School Bell!
        </div>
      </div>
    </div>
  );
};
