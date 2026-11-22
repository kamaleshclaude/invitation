import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, User, Sparkles, Check, Lock, Filter, Grid, List, Search } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useReunionData } from '../context/ReunionDataContext';
import { sound } from '../utils/soundEffects';
import type { BenchClaim } from '../types';

export const BenchMapSection: React.FC = () => {
  const { benchClaims, claimBench, currentRegistrant, settings, registrations } = useReunionData();

  const [selectedBench, setSelectedBench] = useState<number | null>(null);
  const [tagline, setTagline] = useState('');
  const [filterCategory, setFilterCategory] = useState<'all' | 'front' | 'middle' | 'last'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const totalBenches = settings.total_benches || 36;
  const benchesList = Array.from({ length: totalBenches }, (_, i) => i + 1);

  const frontCount = benchClaims.filter(b => b.row_category === 'front').length;
  const middleCount = benchClaims.filter(b => b.row_category === 'middle').length;
  const lastCount = benchClaims.filter(b => b.row_category === 'last').length;

  const handleClaim = async (benchNum: number) => {
    setErrorMsg(null);
    setSuccessNotice(null);

    if (!currentRegistrant) {
      setErrorMsg("Please RSVP / Register first above to claim your old classroom bench!");
      return;
    }

    sound.playPop();
    const res = await claimBench(benchNum, tagline);
    if (!res.success) {
      setErrorMsg(res.error || "Could not claim bench.");
    } else {
      sound.playCelebration();
      setSuccessNotice(`Bench #${benchNum} claimed successfully by ${currentRegistrant.name}!`);
      setSelectedBench(null);
      setTagline('');
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#E9B95B', '#E9B8B0', '#F6C9A8', '#594337', '#FFFFFF']
      });
      setTimeout(() => setSuccessNotice(null), 4000);
    }
  };

  const getClaimForBench = (benchNum: number): BenchClaim | undefined => {
    return benchClaims.find(b => b.bench_number === benchNum);
  };

  return (
    <section id="bench-map" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full clay-pill bg-[#FFFFFF] text-[#594337] text-xs font-bold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5 text-[#E9B95B]" />
          <span>Interactive 3D Classroom Seating</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-[#594337] tracking-tight">
          Claim Your Old Classroom Desk
        </h2>

        <p className="text-sm sm:text-base text-[#927B6C] max-w-xl mx-auto leading-relaxed">
          Front bench note-taker, middle bench peace-keeper, or last bench legend? Pick your nostalgic desk!
        </p>

        {/* Category Stats Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
              filterCategory === 'all'
                ? 'clay-button-gold text-[#413027]'
                : 'clay-surface-beige text-[#594337]'
            }`}
          >
            All Desks ({benchClaims.length}/{totalBenches})
          </button>
          <button
            onClick={() => setFilterCategory('front')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
              filterCategory === 'front'
                ? 'clay-button-gold text-[#413027]'
                : 'clay-surface-beige text-[#594337]'
            }`}
          >
            Front Row ({frontCount}/12)
          </button>
          <button
            onClick={() => setFilterCategory('middle')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
              filterCategory === 'middle'
                ? 'clay-button-gold text-[#413027]'
                : 'clay-surface-beige text-[#594337]'
            }`}
          >
            Middle Row ({middleCount}/15)
          </button>
          <button
            onClick={() => setFilterCategory('last')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition ${
              filterCategory === 'last'
                ? 'clay-button-gold text-[#413027]'
                : 'clay-surface-beige text-[#594337]'
            }`}
          >
            Last Bench Squad ({lastCount}/9)
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#E9B8B0]/40 border border-[#E9B8B0] text-center text-xs sm:text-sm font-bold text-[#594337]">
          {errorMsg}
        </div>
      )}
      {successNotice && (
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#E9B95B]/30 border border-[#E9B95B] text-center text-xs sm:text-sm font-bold text-[#594337]">
          {successNotice}
        </div>
      )}

      {/* Classroom Desk Layout */}
      <div className="clay-card p-6 sm:p-10 bg-[#FFFFFF] border-2 border-[#FFFFFF] space-y-6">
        {/* Blackboard at top of classroom */}
        <div className="p-4 rounded-2xl clay-surface-beige border-2 border-[#594337]/20 text-center space-y-1">
          <div className="text-[11px] font-black uppercase tracking-widest text-[#594337]">
            ★ CLASSROOM BLACKBOARD & TEACHER'S PODIUM ★
          </div>
          <div className="text-xs text-[#927B6C] font-kalam">
            "Class 12-A & 12-B • Silence Please! Good Morning Teacher!"
          </div>
        </div>

        {/* Desks Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3.5 sm:gap-4 pt-4">
          {benchesList.map((benchNum) => {
            const claim = getClaimForBench(benchNum);
            const isClaimed = Boolean(claim);
            const isMine = currentRegistrant && claim?.registration_id === currentRegistrant.id;
            const isSelected = selectedBench === benchNum;

            let categoryLabel = 'Middle';
            if (benchNum <= 12) categoryLabel = 'Front';
            else if (benchNum >= 28) categoryLabel = 'Last';

            if (filterCategory !== 'all' && categoryLabel.toLowerCase() !== filterCategory) {
              return null;
            }

            return (
              <motion.button
                key={benchNum}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  sound.playPop();
                  if (!isClaimed) {
                    setSelectedBench(isSelected ? null : benchNum);
                  }
                }}
                className={`p-3.5 rounded-[20px] text-center transition-all border relative flex flex-col justify-between min-h-[110px] ${
                  isMine
                    ? 'clay-surface-peach border-[#E9B95B] shadow-md'
                    : isClaimed
                    ? 'clay-surface-beige border-[#F0E1CE]'
                    : isSelected
                    ? 'clay-button-gold border-[#E9B95B] shadow-md'
                    : 'clay-surface-cream border-[#F0E1CE] hover:border-[#E9B95B]'
                }`}
              >
                <div className="flex items-center justify-between text-[11px] font-bold text-[#927B6C] w-full">
                  <span>#{benchNum}</span>
                  <span className="text-[9px] uppercase">{categoryLabel}</span>
                </div>

                <div className="my-1">
                  {isClaimed ? (
                    <div className="space-y-0.5">
                      <div className="text-xs font-black text-[#594337] line-clamp-1">
                        {claim?.student_name}
                      </div>
                      <div className="text-[10px] text-[#927B6C] font-kalam italic line-clamp-1">
                        "{claim?.tagline}"
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs font-bold text-[#E9B95B]">
                      {isSelected ? "Selected ✓" : "Available"}
                    </div>
                  )}
                </div>

                <div className="text-[10px] text-[#927B6C] font-medium">
                  {isMine ? "★ Your Desk" : isClaimed ? "Reserved" : "Click to Claim"}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Claim Drawer if a bench is selected */}
        {selectedBench && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl clay-surface-peach border border-[#E9B95B] flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            <div className="text-left space-y-1">
              <div className="text-sm font-black text-[#594337]">
                Claiming Desk #{selectedBench} ({selectedBench <= 12 ? 'Front Bench' : selectedBench >= 28 ? 'Last Bench' : 'Middle Bench'})
              </div>
              <input
                type="text"
                placeholder="Enter nostalgic tagline (e.g. Tiffin sharer, math topper)"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full sm:w-80 px-3.5 py-2 clay-input text-xs font-semibold"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSelectedBench(null)}
                className="px-4 py-2 rounded-xl clay-button text-xs font-bold text-[#927B6C]"
              >
                Cancel
              </button>
              <button
                onClick={() => handleClaim(selectedBench)}
                className="px-6 py-2.5 rounded-xl clay-button-gold text-xs font-black text-[#413027]"
              >
                CONFIRM CLAIM
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};
