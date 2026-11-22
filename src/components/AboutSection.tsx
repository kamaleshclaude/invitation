import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, BookOpen, GraduationCap, Users } from 'lucide-react';
import { REUNION_CONFIG } from '../config/reunionConfig';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <div className="clay-card p-8 sm:p-14 bg-[#FFFFFF] border-2 border-[#FFFFFF] relative overflow-hidden space-y-10">
        {/* Subtle decorative stars */}
        <div className="absolute top-6 left-8 text-[#E9B95B] text-2xl select-none pointer-events-none">★</div>
        <div className="absolute top-6 right-8 text-[#E9B95B] text-2xl select-none pointer-events-none">★</div>
        <div className="absolute bottom-6 right-8 text-[#E9B95B] text-2xl select-none pointer-events-none">★</div>

        {/* Section Pill Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full clay-pill bg-[#FFF5E8] text-[#594337] text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5 text-[#E9B95B]" />
            <span>Our Nostalgic Journey</span>
          </div>

          {/* Heading from Prompt */}
          <h2 className="text-3xl sm:text-5xl font-black text-[#594337] tracking-tight uppercase max-w-3xl mx-auto">
            MORE THAN A REUNION. A REUNION OF MEMORIES.
          </h2>
        </div>

        {/* Description Body from Prompt */}
        <div className="max-w-3xl mx-auto text-center space-y-6 text-[#594337] leading-relaxed text-base sm:text-lg">
          <p className="font-semibold text-[#725747]">
            We walked through the same school corridors, shared the same classrooms, laughed together, learned together, and created memories that time could never erase.
          </p>

          <div className="flex items-center justify-center space-x-3 text-[#E9B8B0]">
            <span className="w-12 h-0.5 bg-[#F0E1CE]" />
            <Heart className="w-5 h-5 text-[#E9B8B0] fill-current" />
            <span className="w-12 h-0.5 bg-[#F0E1CE]" />
          </div>

          <p className="text-xl sm:text-2xl font-bold font-kalam text-[#594337]">
            Years may have passed, but the friendships remain.
          </p>

          <p className="text-[#927B6C] text-sm sm:text-base leading-relaxed">
            <strong>School Friends Reunion 2026</strong> is our chance to reconnect, remember the beautiful days, meet our classmates again, and create new memories together.
          </p>
        </div>

        {/* Centerpiece: Official Batch 2024 - 2025 Group Photo */}
        <div className="max-w-4xl mx-auto clay-card p-4 sm:p-6 bg-[#FFFFFF] border-2 border-[#E9B95B]/40 rounded-[28px] space-y-4">
          <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-[#F0E1CE] shadow-inner">
            <img 
              src={REUNION_CONFIG.officialGroupPhotoUrl} 
              alt="Star Matric Hr. Sec. School Batch 2024 - 2025 Group Photo"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 px-3.5 py-1.5 rounded-full bg-[#594337]/90 text-[#FFF5E8] text-xs font-black backdrop-blur-sm border border-[#E9B95B]/40 shadow-sm">
              🎓 Official Batch Group Photo • 2024 - 2025
            </div>
          </div>
          <div className="text-center space-y-1">
            <h4 className="text-base sm:text-lg font-black text-[#594337]">
              STAR MATRIC HR. SEC. SCHOOL • BATCH 2024 - 2025
            </h4>
            <p className="text-xs text-[#927B6C] font-semibold">
              Reuniting 60 classmates and our respected teachers under one roof
            </p>
          </div>
        </div>

        {/* Nostalgic Pillars: 3 Clay Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          <div className="clay-surface-cream p-6 rounded-[24px] border border-[#F0E1CE] text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#FFFFFF] text-[#E9B95B] flex items-center justify-center mx-auto shadow-sm text-xl">
              🏫
            </div>
            <h3 className="font-black text-sm uppercase tracking-wide text-[#594337]">
              {REUNION_CONFIG.schoolShortName}
            </h3>
            <p className="text-xs text-[#927B6C]">
              The classrooms, morning assemblies, and campus grounds that shaped our childhood.
            </p>
          </div>

          <div className="clay-surface-cream p-6 rounded-[24px] border border-[#F0E1CE] text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#FFFFFF] text-[#E9B8B0] flex items-center justify-center mx-auto shadow-sm text-xl">
              🤝
            </div>
            <h3 className="font-black text-sm uppercase tracking-wide text-[#594337]">
              Lifelong Bonds
            </h3>
            <p className="text-xs text-[#927B6C]">
              From shared lunch tiffins to bench scribbles, true school friendships never graduate.
            </p>
          </div>

          <div className="clay-surface-cream p-6 rounded-[24px] border border-[#F0E1CE] text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-[#FFFFFF] text-[#E9B95B] flex items-center justify-center mx-auto shadow-sm text-xl">
              ✨
            </div>
            <h3 className="font-black text-sm uppercase tracking-wide text-[#594337]">
              Batch 2024 - 2025
            </h3>
            <p className="text-xs text-[#927B6C]">
              Reuniting 60 classmates for one grand day of celebration, laughter, and keepsakes.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
