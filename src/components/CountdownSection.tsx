import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Download, Ticket, Sparkles, Users, ArrowRight, MapPin, Phone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { REUNION_CONFIG } from '../config/reunionConfig';
import { useReunionData } from '../context/ReunionDataContext';
import { sound } from '../utils/soundEffects';

interface CountdownSectionProps {
  onRegisterClick?: () => void;
  onExploreClick?: () => void;
}

export const CountdownSection: React.FC<CountdownSectionProps> = ({
  onRegisterClick,
  onExploreClick
}) => {
  const { stats } = useReunionData();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isReunionDay: false,
    totalSeconds: 0
  });

  useEffect(() => {
    // 27 December 2026, 10:00 AM IST
    const targetDate = new Date(REUNION_CONFIG.eventTimestamp).getTime();

    const calculateTime = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isReunionDay: true,
          totalSeconds: 0
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isReunionDay: false,
        totalSeconds: difference
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleRegister = () => {
    sound.playPop();
    if (onRegisterClick) {
      onRegisterClick();
    } else {
      const el = document.getElementById('registration');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleExplore = () => {
    sound.playPop();
    if (onExploreClick) {
      onExploreClick();
    } else {
      const el = document.getElementById('gallery');
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const generateGoogleCalendarUrl = () => {
    const title = encodeURIComponent(`${REUNION_CONFIG.eventName} - ${REUNION_CONFIG.schoolName}`);
    const details = encodeURIComponent(`${REUNION_CONFIG.eventName} for ${REUNION_CONFIG.schoolName}. Time: ${REUNION_CONFIG.eventTimeText} (${REUNION_CONFIG.eventTimezone}). Venue: ${REUNION_CONFIG.confirmedVenueName}.`);
    const location = encodeURIComponent(`${REUNION_CONFIG.confirmedVenueName}, Karur`);
    const dates = "20261227T043000Z/20261227T083000Z";
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  };

  const timeUnits = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MINUTES", value: timeLeft.minutes },
    { label: "SECONDS", value: timeLeft.seconds },
  ];

  return (
    <section id="countdown" className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <div className="clay-card p-8 sm:p-14 bg-[#FFFFFF] border-2 border-[#FFFFFF] text-center space-y-10 relative overflow-hidden">
        {/* Decorative Golden Stars */}
        <div className="absolute top-5 left-6 text-[#E9B95B] text-2xl select-none pointer-events-none">★</div>
        <div className="absolute top-5 right-6 text-[#E9B95B] text-2xl select-none pointer-events-none">★</div>
        <div className="absolute bottom-5 left-6 text-[#E9B95B] text-2xl select-none pointer-events-none">★</div>
        <div className="absolute bottom-5 right-6 text-[#E9B95B] text-2xl select-none pointer-events-none">★</div>

        {/* Top Header Badge */}
        <div className="space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-5 py-2 rounded-full clay-pill bg-[#FFF5E8] text-[#594337] text-xs font-black uppercase tracking-wider">
            <span className="text-base">🎓</span>
            <span>{REUNION_CONFIG.schoolName}</span>
            <span className="text-[#E9B95B]">★</span>
            <span className="text-[#927B6C]">{REUNION_CONFIG.batchYear} Batch</span>
          </div>

          {/* Heading from Prompt */}
          <h1 className="text-4xl sm:text-6xl font-black text-[#594337] tracking-tight uppercase">
            {timeLeft.isReunionDay ? "TODAY IS REUNION DAY! 🎉" : "THE COUNTDOWN TO OUR MEMORIES"}
          </h1>

          {/* Supporting Text from Prompt */}
          <p className="text-base sm:text-lg text-[#927B6C] font-semibold max-w-xl mx-auto leading-relaxed">
            {timeLeft.isReunionDay 
              ? "Welcome back classmates! Let us celebrate the friendships that time could never change." 
              : "Years passed, memories stayed. It's time to meet again!"}
          </p>

          {/* Confirmed Event Information Banner */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 text-xs sm:text-sm font-bold text-[#594337]">
            <div className="px-4 py-1.5 rounded-full clay-surface-cream border border-[#F0E1CE] flex items-center space-x-1.5">
              <span>📅</span>
              <span><strong>DATE:</strong> 27 DECEMBER 2026</span>
            </div>
            <div className="px-4 py-1.5 rounded-full clay-surface-cream border border-[#F0E1CE] flex items-center space-x-1.5">
              <span>⏰</span>
              <span><strong>TIME:</strong> 10:00 AM</span>
            </div>
            <div className="px-4 py-1.5 rounded-full clay-surface-cream border border-[#F0E1CE] flex items-center space-x-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-600" />
              <span><strong>VENUE:</strong> {REUNION_CONFIG.confirmedVenueName}</span>
            </div>
            <a
              href={REUNION_CONFIG.contactPhoneTel}
              onClick={() => sound.playPop()}
              className="px-4 py-1.5 rounded-full clay-surface-peach border border-[#E9B95B] flex items-center space-x-1.5 text-[#594337] hover:scale-105 transition"
            >
              <Phone className="w-3.5 h-3.5 text-[#594337]" />
              <span><strong>DOUBTS? CALL:</strong> {REUNION_CONFIG.contactPhone}</span>
            </a>
          </div>
        </div>

        {/* 4 Large Premium 3D Clay-Style Countdown Blocks */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
          {timeUnits.map((unit) => (
            <motion.div
              key={unit.label}
              whileHover={{ scale: 1.05 }}
              className="clay-surface-cream p-6 sm:p-8 rounded-[28px] border-2 border-[#F0E1CE] flex flex-col items-center justify-center space-y-1 shadow-sm"
            >
              <div className="text-4xl sm:text-6xl font-black text-[#594337] tracking-tight font-mono">
                {String(unit.value).padStart(2, '0')}
              </div>
              <div className="text-xs sm:text-sm font-black uppercase tracking-widest text-[#927B6C]">
                {unit.label}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action Buttons: REGISTER NOW and EXPLORE OUR MEMORIES */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleRegister}
            className="w-full sm:w-auto px-9 py-4 rounded-[20px] clay-button-gold text-base sm:text-lg font-black tracking-wide flex items-center justify-center space-x-2 shadow-lg"
          >
            <Ticket className="w-5 h-5 text-[#413027]" />
            <span>REGISTER NOW</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleExplore}
            className="w-full sm:w-auto px-8 py-4 rounded-[20px] clay-button text-base font-black text-[#594337] flex items-center justify-center space-x-2 border border-[#E9B95B]/40"
          >
            <span>EXPLORE OUR MEMORIES</span>
            <ArrowRight className="w-4 h-4 text-[#927B6C]" />
          </motion.button>
        </div>

        {/* Registration Live Progress Indicator */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="px-5 py-2.5 rounded-full clay-surface-cream border border-[#F0E1CE] text-xs font-bold text-[#594337] flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <Users className="w-4 h-4 text-[#E9B95B]" />
            <span>
              <strong>{stats.totalRegistrations} / 60</strong> Registered classmates
            </span>
          </div>

          <div className="px-5 py-2.5 rounded-full clay-surface-peach text-xs font-bold text-[#594337]">
            {stats.isCapacityFull ? (
              <strong className="text-rose-700">ALL REGISTRATION SLOTS ARE FILLED!</strong>
            ) : (
              <span><strong>{stats.spotsRemaining} SPOTS REMAINING</strong></span>
            )}
          </div>
        </div>

        {/* Calendar Sync Link */}
        <div className="pt-4 flex items-center justify-center text-xs">
          <a
            href={generateGoogleCalendarUrl()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sound.playPop()}
            className="px-4 py-2 rounded-full clay-button text-[#927B6C] hover:text-[#594337] font-bold flex items-center space-x-1.5 border border-[#F0E1CE] shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 text-[#E9B95B]" />
            <span>Add 27 Dec 2026 to Google Calendar</span>
          </a>
        </div>
      </div>
    </section>
  );
};
