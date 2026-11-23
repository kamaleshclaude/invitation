import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Navigation, 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  Calendar as CalendarIcon, 
  ThumbsUp, 
  BarChart3, 
  Share2,
  Crown,
  Trophy,
  ArrowRight
} from 'lucide-react';
import { REUNION_CONFIG } from '../config/reunionConfig';
import type { VenueInfo, DateOptionInfo } from '../config/reunionConfig';
import { useReunionData } from '../context/ReunionDataContext';
import { useLanguage } from '../context/LanguageContext';
import { sound } from '../utils/soundEffects';

export const VotePollSection: React.FC = () => {
  const { 
    venueVotes, 
    dateVotes, 
    castVenueVote, 
    castDateVote, 
    extraPollVotes, 
    castExtraPollVote, 
    hasUserVoted, 
    settings,
    stats 
  } = useReunionData();
  const { t } = useLanguage();

  const [voteError, setVoteError] = useState<string | null>(null);
  const [voteSuccess, setVoteSuccess] = useState<string | null>(null);

  const venues: VenueInfo[] = (REUNION_CONFIG.venues ? [REUNION_CONFIG.venues.venue1, REUNION_CONFIG.venues.venue2] : []).filter(Boolean);
  const dateOptions: DateOptionInfo[] = REUNION_CONFIG.dateOptions || [];

  const totalVenueVotes = stats.totalVenueVotes;
  const totalDateVotes = stats.totalDateVotes;

  // Determine Leading Venue & Leading Date
  const leadingVenueId = (venueVotes['venue-vellu'] || 0) >= (venueVotes['venue-habbebi'] || 0)
    ? 'venue-vellu'
    : 'venue-habbebi';

  const leadingDateId = (dateVotes['date-dec-27'] || 0) >= (dateVotes['date-dec-25'] || 0)
    ? 'date-dec-27'
    : 'date-dec-25';

  const handleVoteVenue = async (venueId: string) => {
    sound.playPop();
    setVoteError(null);
    setVoteSuccess(null);
    const res = await castVenueVote(venueId, 'user-device');
    if (!res.success) {
      setVoteError(res.error || 'Vote could not be submitted');
    } else {
      setVoteSuccess('Your venue vote has been recorded successfully! ★');
    }
  };

  const handleVoteDate = async (dateId: string) => {
    sound.playPop();
    setVoteError(null);
    setVoteSuccess(null);
    const res = await castDateVote(dateId, 'user-device');
    if (!res.success) {
      setVoteError(res.error || 'Vote could not be submitted');
    } else {
      setVoteSuccess('Your date vote has been recorded successfully! ★');
    }
  };

  const isVenueLocked = Boolean(settings.locked_venue_id);
  const isDateLocked = Boolean(settings.locked_date_id);
  const isFinalAnnouncementReady = isVenueLocked || isDateLocked;

  const confirmedVenue = settings.locked_venue_id === 'venue-vellu'
    ? REUNION_CONFIG.venues?.venue1
    : settings.locked_venue_id === 'venue-habbebi'
    ? REUNION_CONFIG.venues?.venue2
    : null;

  const confirmedDate = settings.locked_date_id === 'date-dec-25'
    ? "Friday, 25 December 2026"
    : settings.locked_date_id === 'date-dec-27'
    ? "Sunday, 27 December 2026"
    : null;

  return (
    <section id="venue-poll" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
      
      {/* Notifications */}
      {voteError && (
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#E9B8B0]/40 border border-[#E9B8B0] text-[#594337] text-center text-xs sm:text-sm font-bold">
          {voteError}
        </div>
      )}
      {voteSuccess && (
        <div className="max-w-md mx-auto p-4 rounded-2xl bg-[#E9B95B]/30 border border-[#E9B95B] text-[#594337] text-center text-xs sm:text-sm font-bold">
          {voteSuccess}
        </div>
      )}

      {/* ================= 1. VENUE VOTING (Node 05) ================= */}
      <div id="venue-voting" className="space-y-8 scroll-mt-24">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full clay-pill bg-[#FFFFFF] text-[#594337] text-xs font-bold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-[#E9B95B]" />
            <span>Phase 1 • Venue Selection</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-black text-[#594337]">
            Vote for Reunion Venue
          </h3>

          <p className="text-xs sm:text-sm text-[#927B6C] max-w-xl mx-auto">
            Choose between authentic open-lawn biryani feast or air-conditioned luxury grand lounge.
          </p>

          {isVenueLocked && (
            <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full clay-surface-peach text-xs font-black text-[#594337]">
              <Lock className="w-3.5 h-3.5 text-rose-700" />
              <span>Venue poll has been locked by organizer</span>
            </div>
          )}
        </div>

        {/* Venue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {venues.map((venue) => {
            const count = venueVotes[venue.id] || 0;
            const percentage = totalVenueVotes > 0 ? Math.round((count / totalVenueVotes) * 100) : 50;
            const hasVotedThis = hasUserVoted('venue_poll');
            const isLeading = leadingVenueId === venue.id && count > 0;

            return (
              <motion.div
                key={venue.id}
                whileHover={{ y: -4 }}
                className="clay-card p-6 bg-[#FFFFFF] border-2 border-[#FFFFFF] flex flex-col justify-between space-y-5"
              >
                <div>
                  {/* Image container */}
                  <div className="relative h-56 rounded-2xl overflow-hidden bg-[#F0E1CE] mb-4">
                    <img
                      src={venue.image}
                      alt={venue.name}
                      className="w-full h-full object-cover"
                    />
                    {isLeading && (
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#E9B95B] text-[#413027] text-xs font-black flex items-center space-x-1 shadow-md">
                        <Crown className="w-3.5 h-3.5" />
                        <span>Leading Choice</span>
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-xl bg-[#594337]/80 backdrop-blur-sm text-white">
                      <h4 className="font-black text-base leading-snug">{venue.name}</h4>
                      <p className="text-[11px] text-[#F0E1CE] line-clamp-1">{venue.address}</p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-[#927B6C] leading-relaxed mb-4">
                    {venue.description}
                  </p>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {venue.features.map((feat, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-0.5 rounded-full clay-surface-beige text-[11px] font-bold text-[#594337]"
                      >
                        • {feat}
                      </span>
                    ))}
                  </div>

                  {/* Live Progress Bar */}
                  <div className="pt-2">
                    <div className="flex justify-between text-xs font-bold text-[#594337] mb-1.5">
                      <span>Live Votes: {count}</span>
                      <span className="font-black text-[#E9B95B]">{percentage}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#F0E1CE] overflow-hidden p-0.5 shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full bg-gradient-to-r from-[#E9B95B] to-[#D99F37]"
                      />
                    </div>
                  </div>

                  {/* Embedded Google Map */}
                  <div className="mt-4 rounded-xl overflow-hidden border border-[#F0E1CE] h-40 bg-[#F0E1CE]">
                    <iframe
                      title={`${venue.name} Map`}
                      src={venue.embedMapUrl}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 grid grid-cols-2 gap-3">
                  <button
                    disabled={hasVotedThis || isVenueLocked}
                    onClick={() => handleVoteVenue(venue.id)}
                    className={`py-3 px-4 rounded-[16px] font-black text-xs sm:text-sm flex items-center justify-center space-x-1.5 transition ${
                      hasVotedThis
                        ? 'clay-surface-beige text-[#927B6C] cursor-not-allowed'
                        : isVenueLocked
                        ? 'clay-surface-beige text-[#927B6C] cursor-not-allowed'
                        : 'clay-button-gold text-[#413027]'
                    }`}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span>{hasVotedThis ? "Vote Recorded" : isVenueLocked ? "Locked" : "Vote This Venue"}</span>
                  </button>

                  <a
                    href={venue.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-4 rounded-[16px] clay-button text-xs sm:text-sm font-bold text-[#594337] flex items-center justify-center space-x-1.5"
                  >
                    <Navigation className="w-4 h-4 text-[#E9B8B0]" />
                    <span>Directions</span>
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ================= 2. DATE VOTING (Node 06) ================= */}
      <div id="date-voting" className="space-y-8 pt-4 scroll-mt-24">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full clay-pill bg-[#FFFFFF] text-[#594337] text-xs font-bold uppercase tracking-wider">
            <CalendarIcon className="w-3.5 h-3.5 text-[#E9B8B0]" />
            <span>Phase 2 • Date Preference</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-black text-[#594337]">
            Vote for Reunion Date
          </h3>

          <p className="text-xs sm:text-sm text-[#927B6C] max-w-xl mx-auto">
            Which date works best for your schedule and family? Select your preferred holiday date:
          </p>

          {isDateLocked && (
            <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full clay-surface-peach text-xs font-black text-[#594337]">
              <Lock className="w-3.5 h-3.5 text-rose-700" />
              <span>Reunion date has been confirmed and locked</span>
            </div>
          )}
        </div>

        {/* Date Calendar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {dateOptions.map((dateOpt) => {
            const count = dateVotes[dateOpt.id] || 0;
            const percentage = totalDateVotes > 0 ? Math.round((count / totalDateVotes) * 100) : 50;
            const hasVotedThis = hasUserVoted('date_poll');
            const isLeading = leadingDateId === dateOpt.id && count > 0;

            return (
              <motion.div
                key={dateOpt.id}
                whileHover={{ y: -4 }}
                className="clay-card p-6 sm:p-8 bg-[#FFFFFF] border-2 border-[#FFFFFF] flex flex-col justify-between space-y-6"
              >
                <div>
                  {/* Calendar Top Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#F0E1CE]">
                    <div className="flex items-center space-x-2">
                      <span className="text-xl">📅</span>
                      <span className="text-xs font-black uppercase tracking-wider text-[#927B6C]">
                        {dateOpt.month} {dateOpt.year}
                      </span>
                    </div>
                    {isLeading && (
                      <span className="px-2.5 py-0.5 rounded-full bg-[#E9B95B]/30 text-[#594337] text-[11px] font-black">
                        ★ Leading Choice
                      </span>
                    )}
                  </div>

                  {/* Calendar Large Number Display */}
                  <div className="my-6 text-center">
                    <div className="inline-block p-6 rounded-[28px] clay-surface-cream border-2 border-[#E9B95B]/50 min-w-[140px]">
                      <div className="text-5xl sm:text-6xl font-black text-[#594337] tracking-tight">
                        {dateOpt.dateNumber}
                      </div>
                      <div className="text-xs font-extrabold text-[#E9B8B0] uppercase tracking-widest mt-1">
                        {dateOpt.month}
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="text-center space-y-1.5">
                    <h4 className="text-lg font-black text-[#594337]">
                      {dateOpt.dayOfWeek}
                    </h4>
                    <p className="text-xs text-[#927B6C] leading-relaxed max-w-xs mx-auto">
                      {dateOpt.description}
                    </p>
                    <div className="text-xs font-bold text-[#E9B95B] pt-1">
                      Time Slot: {dateOpt.timeSlot}
                    </div>
                  </div>

                  {/* Live Results Bar */}
                  <div className="pt-6">
                    <div className="flex justify-between text-xs font-bold text-[#594337] mb-1.5">
                      <span>Votes: {count} classmates</span>
                      <span className="font-black text-[#E9B95B]">{percentage}%</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#F0E1CE] overflow-hidden p-0.5 shadow-inner">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.8 }}
                        className="h-full rounded-full bg-gradient-to-r from-[#E9B8B0] to-[#E9B95B]"
                      />
                    </div>
                  </div>
                </div>

                {/* Vote CTA */}
                <button
                  disabled={hasVotedThis || isDateLocked}
                  onClick={() => handleVoteDate(dateOpt.id)}
                  className={`w-full py-3.5 px-4 rounded-[18px] font-black text-xs sm:text-sm flex items-center justify-center space-x-2 transition ${
                    hasVotedThis
                      ? 'clay-surface-beige text-[#927B6C] cursor-not-allowed'
                      : isDateLocked
                      ? 'clay-surface-beige text-[#927B6C] cursor-not-allowed'
                      : 'clay-button-gold text-[#413027]'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{hasVotedThis ? "Date Vote Recorded" : isDateLocked ? "Locked" : `Vote for Dec ${dateOpt.dateNumber}`}</span>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ================= 3. FINAL REUNION ANNOUNCEMENT (Node 07) ================= */}
      <div id="reunion-announcement" className="clay-card p-6 sm:p-10 bg-gradient-to-br from-[#FFF5E8] via-[#FFFFFF] to-[#F0E1CE] border-2 border-[#E9B95B] relative overflow-hidden scroll-mt-24">
        <div className="absolute top-3 right-4 text-2xl text-[#E9B95B] select-none">★</div>
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1 rounded-full clay-pill bg-[#FFFFFF] text-[#594337] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#E9B95B]" />
            <span>Reunion Headquarters Announcement</span>
          </div>

          <h3 className="text-2xl sm:text-4xl font-black text-[#594337] tracking-tight">
            {isFinalAnnouncementReady ? "Official Confirmed Reunion Details" : "Final Reunion Announcement"}
          </h3>

          {isFinalAnnouncementReady ? (
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#F0E1CE] shadow-sm space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                <div className="p-4 rounded-xl clay-surface-beige">
                  <div className="text-[11px] font-black uppercase tracking-wider text-[#927B6C] flex items-center space-x-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-[#E9B95B]" />
                    <span>Confirmed Date</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-[#594337] mt-1">
                    {confirmedDate || "Sunday, 27 December 2026"}
                  </div>
                  <div className="text-xs text-[#927B6C] mt-0.5">Time: {REUNION_CONFIG.eventTimeText}</div>
                </div>

                <div className="p-4 rounded-xl clay-surface-beige">
                  <div className="text-[11px] font-black uppercase tracking-wider text-[#927B6C] flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#E9B8B0]" />
                    <span>Confirmed Venue</span>
                  </div>
                  <div className="text-base sm:text-lg font-black text-[#594337] mt-1">
                    {confirmedVenue ? confirmedVenue.name : "Dindigul Vellu Biriyani Gardens"}
                  </div>
                  <div className="text-xs text-[#927B6C] mt-0.5">{confirmedVenue?.address || "Selected by alumni vote & committee"}</div>
                </div>
              </div>

              {settings.announcement_notes && (
                <p className="text-xs sm:text-sm text-[#594337] italic font-kalam">
                  "{settings.announcement_notes}"
                </p>
              )}

              <a
                href={REUNION_CONFIG.whatsappGroupUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-[16px] clay-button-gold text-xs sm:text-sm font-black"
              >
                <span>Share Confirmed Details on WhatsApp</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="p-6 rounded-2xl clay-surface-cream text-center space-y-2 border border-[#F0E1CE]">
              <p className="text-base sm:text-lg font-black text-[#594337]">
                "Reunion details confirmed: 27 December 2026 at Dindigul Vellu Biriyani Gardens!"
              </p>
              <p className="text-xs sm:text-sm text-[#927B6C] max-w-lg mx-auto">
                Voting polls are active below for additional preferences. All registered students will receive official STAR ID badges on reunion day!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ================= 4. VOTING RESULTS SECTION (PHASE 9) ================= */}
      <div className="clay-card p-6 sm:p-10 bg-[#FFFFFF] border-2 border-[#FFFFFF] space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between pb-4 border-b border-[#F0E1CE] gap-2">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-[#E9B95B]" />
            <h4 className="text-xl font-black text-[#594337]">
              Live Voting Results Breakdown
            </h4>
          </div>
          <span className="text-xs font-bold text-[#927B6C]">
            Total Votes: {totalVenueVotes + totalDateVotes} ballots cast
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Venue Results Table/Chart */}
          <div className="space-y-4 p-5 rounded-2xl clay-surface-beige">
            <h5 className="font-extrabold text-sm text-[#594337] flex items-center justify-between">
              <span>Venue Poll Results</span>
              <span className="text-xs text-[#927B6C]">{totalVenueVotes} total votes</span>
            </h5>

            {venues.map((v) => {
              const votes = venueVotes[v.id] || 0;
              const pct = totalVenueVotes > 0 ? Math.round((votes / totalVenueVotes) * 100) : 0;
              return (
                <div key={v.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[#594337]">
                    <span>{v.name}</span>
                    <span>{votes} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#FFFFFF] overflow-hidden p-0.5">
                    <div 
                      className="h-full rounded-full bg-[#E9B95B]" 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Date Results Table/Chart */}
          <div className="space-y-4 p-5 rounded-2xl clay-surface-beige">
            <h5 className="font-extrabold text-sm text-[#594337] flex items-center justify-between">
              <span>Date Poll Results</span>
              <span className="text-xs text-[#927B6C]">{totalDateVotes} total votes</span>
            </h5>

            {dateOptions.map((d) => {
              const votes = dateVotes[d.id] || 0;
              const pct = totalDateVotes > 0 ? Math.round((votes / totalDateVotes) * 100) : 0;
              return (
                <div key={d.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-[#594337]">
                    <span>{d.fullDateText}</span>
                    <span>{votes} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-[#FFFFFF] overflow-hidden p-0.5">
                    <div 
                      className="h-full rounded-full bg-[#E9B8B0]" 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </section>
  );
};
