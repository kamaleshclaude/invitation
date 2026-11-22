import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { 
  CheckCircle, 
  Sparkles, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Users, 
  Share2, 
  MessageCircle, 
  ArrowRight, 
  Camera, 
  BookOpen,
  Ticket,
  AlertCircle,
  X
} from 'lucide-react';
import { REUNION_CONFIG } from '../config/reunionConfig';
import { useReunionData } from '../context/ReunionDataContext';
import { sound } from '../utils/soundEffects';
import type { AttendanceStatus, Registration } from '../types';

interface RegistrationSectionProps {
  onNavigateToSection?: (sectionId: string) => void;
  onOpenMemoryCardWithStudent?: (studentName: string) => void;
}

export const RegistrationSection: React.FC<RegistrationSectionProps> = ({ 
  onNavigateToSection,
  onOpenMemoryCardWithStudent
}) => {
  const { addRegistration, stats } = useReunionData();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    batch: 'XII - A',
    guests: 0,
    attendance_status: 'Yes' as AttendanceStatus
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successReg, setSuccessReg] = useState<Registration | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (stats.isCapacityFull) {
      setErrorMsg("ALL REGISTRATION SLOTS ARE FILLED! Maximum capacity of 60 students has been reached.");
      return;
    }

    if (!formData.name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (cleanPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await addRegistration({
        name: formData.name.trim(),
        phone: cleanPhone,
        email: formData.email.trim() || undefined,
        batch: formData.batch.trim() || "XII - A",
        guests: Number(formData.guests) || 0,
        attendance_status: formData.attendance_status
      });

      if (!res.success) {
        setErrorMsg(res.error || "Registration failed. Please check your details.");
        setIsSubmitting(false);
        return;
      }

      // Success celebration sound & confetti
      sound.playCelebration();
      setSuccessReg(res.data || null);

      confetti({
        particleCount: 85,
        spread: 75,
        origin: { y: 0.6 },
        colors: ['#E9B95B', '#E9B8B0', '#F6C9A8', '#594337', '#FFFFFF']
      });

      // If registered with photo, store name in localStorage for ID card auto-sync
      localStorage.setItem('star_matric_last_registered_student', formData.name.trim());
      if (formData.photo_url) {
        localStorage.setItem('star_matric_last_registered_photo', formData.photo_url);
      }
      localStorage.setItem('star_matric_last_registered_batch', formData.batch.trim());

    } catch (err) {
      setErrorMsg("An unexpected network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShareWhatsApp = () => {
    sound.playPop();
    const siteUrl = window.location.origin;
    const msg = `Hey classmate! I just registered for the ${REUNION_CONFIG.schoolName} Reunion on 27 December 2026. Only 60 spots available! Register here: ${siteUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const capacityPercent = Math.min(100, Math.round((stats.totalRegistrations / 60) * 100));

  return (
    <section id="registration" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10">
      {/* Header from Prompt */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full clay-pill bg-[#FFFFFF] text-[#594337] text-xs font-bold uppercase tracking-wider">
          <Ticket className="w-3.5 h-3.5 text-[#E9B95B]" />
          <span>Classmate Attendance RSVP</span>
        </div>

        {/* Heading from Prompt */}
        <h2 className="text-3xl sm:text-5xl font-black text-[#594337] tracking-tight uppercase">
          LET'S SEE WHO'S COMING!
        </h2>

        {/* Supporting text from Prompt */}
        <p className="text-sm sm:text-base text-[#927B6C] max-w-xl mx-auto leading-relaxed font-semibold">
          Every registration brings us one step closer to seeing our school family together again.
        </p>

        {/* 60-Student Capacity Meter from Prompt */}
        <div className="max-w-md mx-auto pt-3">
          <div className="clay-surface-cream p-4 rounded-2xl border border-[#F0E1CE]">
            <div className="flex justify-between items-center text-xs font-black text-[#594337] mb-2">
              <span className="flex items-center space-x-1.5">
                <span>Registered classmates:</span>
                <strong className="text-[#E9B95B]">{stats.totalRegistrations} / 60</strong>
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                stats.isCapacityFull ? 'bg-rose-500 text-white' : 'bg-[#E9B95B]/30 text-[#594337]'
              }`}>
                {stats.isCapacityFull ? 'ALL SLOTS FILLED' : `${stats.spotsRemaining} SPOTS REMAINING`}
              </span>
            </div>

            {/* Clay Progress Bar */}
            <div className="w-full h-3.5 rounded-full bg-[#F0E1CE] overflow-hidden p-0.5 shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-700 ${
                  stats.isCapacityFull 
                    ? 'bg-rose-500' 
                    : 'bg-gradient-to-r from-[#E9B95B] to-[#D99F37]'
                }`}
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!successReg ? (
          /* ================= CLAY REGISTRATION FORM ================= */
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="clay-card p-6 sm:p-10 bg-[#FFFFFF] border-2 border-[#FFFFFF] relative"
          >
            {/* Event Summary Banner */}
            <div className="mb-8 p-4 rounded-2xl clay-surface-cream border border-[#F0E1CE] grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-[#594337]">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#E9B95B] flex-shrink-0" />
                <span><strong>School:</strong> {REUNION_CONFIG.schoolShortName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-[#E9B8B0] flex-shrink-0" />
                <span><strong>Date:</strong> 27 December 2026</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-[#E9B95B] flex-shrink-0" />
                <span><strong>Time:</strong> 10:00 AM IST</span>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-[#E9B8B0]/40 border border-[#E9B8B0] text-[#594337] text-xs sm:text-sm font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {stats.isCapacityFull ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto text-2xl font-black">
                  ✕
                </div>
                <h3 className="text-2xl font-black text-rose-800 uppercase">
                  ALL REGISTRATION SLOTS ARE FILLED!
                </h3>
                <p className="text-sm text-[#927B6C] max-w-md mx-auto">
                  All 60 student registration slots have been filled. If you are a classmate needing assistance, please reach out to the reunion committee on WhatsApp.
                </p>
                <a
                  href={REUNION_CONFIG.whatsappGroupUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-6 py-3 rounded-[18px] clay-button-gold text-sm font-black"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Contact Organizer on WhatsApp</span>
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs uppercase font-extrabold tracking-wider text-[#594337] mb-2">
                      Full Name <span className="text-[#E9B8B0]">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#927B6C] absolute left-4 top-3.5" />
                      <input
                        type="text"
                        required
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 clay-input text-sm font-semibold"
                      />
                    </div>
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block text-xs uppercase font-extrabold tracking-wider text-[#594337] mb-2">
                      Mobile Number (WhatsApp) <span className="text-[#E9B8B0]">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#927B6C] absolute left-4 top-3.5" />
                      <input
                        type="tel"
                        required
                        placeholder="10-digit mobile number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 clay-input text-sm font-semibold"
                      />
                    </div>
                    <span className="text-[10px] text-[#927B6C] mt-1 block font-medium">
                      One registration per number • Confidential
                    </span>
                  </div>

                  {/* Standard / Class / Section */}
                  <div>
                    <label className="block text-xs uppercase font-extrabold tracking-wider text-[#594337] mb-2">
                      Standard / Class / Section <span className="text-[#E9B8B0]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. XII - A / XII - B / Commerce"
                      value={formData.batch}
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                      className="w-full px-4 py-3 clay-input text-sm font-semibold"
                    />
                    <span className="text-[10px] text-[#927B6C] mt-1 block">
                      Printed on your Official STAR School ID Card
                    </span>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs uppercase font-extrabold tracking-wider text-[#594337] mb-2">
                      Email Address <span className="text-[#927B6C] font-normal">(Optional)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#927B6C] absolute left-4 top-3.5" />
                      <input
                        type="email"
                        placeholder="student@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 clay-input text-sm font-semibold"
                      />
                    </div>
                  </div>

                  {/* Number of Guests */}
                  <div>
                    <label className="block text-xs uppercase font-extrabold tracking-wider text-[#594337] mb-2">
                      Number of Guests (Family / Spouse)
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-[#927B6C] absolute left-4 top-3.5" />
                      <select
                        value={formData.guests}
                        onChange={(e) => setFormData({ ...formData, guests: parseInt(e.target.value, 10) })}
                        className="w-full pl-11 pr-4 py-3 clay-input text-sm font-semibold bg-[#FFFDF9]"
                      >
                        <option value={0}>0 (Just me)</option>
                        <option value={1}>+1 Guest</option>
                        <option value={2}>+2 Guests</option>
                        <option value={3}>+3 Guests</option>
                      </select>
                    </div>
                  </div>

                  {/* Attendance Confirmation */}
                  <div>
                    <label className="block text-xs uppercase font-extrabold tracking-wider text-[#594337] mb-2">
                      Will you attend? <span className="text-[#E9B8B0]">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Yes', 'Maybe', 'No'] as AttendanceStatus[]).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setFormData({ ...formData, attendance_status: status })}
                          className={`py-3 rounded-xl text-xs font-black transition border ${
                            formData.attendance_status === status
                              ? 'clay-button-gold text-[#413027] border-[#E9B95B] shadow-sm'
                              : 'clay-button text-[#927B6C] border-[#F0E1CE]'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 text-center">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={isSubmitting || stats.isCapacityFull}
                    className="w-full sm:w-auto px-10 py-4 rounded-[20px] clay-button-gold text-base font-black tracking-wide flex items-center justify-center space-x-2 shadow-lg mx-auto disabled:opacity-50"
                  >
                    <span>{isSubmitting ? "Securing Slot..." : "CONFIRM REGISTRATION"}</span>
                    <ArrowRight className="w-5 h-5 text-[#413027]" />
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        ) : (
          /* ================= CLAY SUCCESS POPUP & MEMORY CARD ACCESS ================= */
          <motion.div
            key="success"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-6"
          >
            {/* Puffy Clay VIP Pass */}
            <div className="clay-card p-8 sm:p-10 bg-gradient-to-br from-[#FFF5E8] to-[#F0E1CE] border-2 border-[#E9B95B] relative overflow-hidden">
              <div className="absolute top-4 right-4 text-3xl text-[#E9B95B]">★</div>
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-widest text-[#E9B95B]">
                  <span>🎓</span>
                  <span>Registered Classmate Confirmed • #{stats.totalRegistrations} of 60</span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-black text-[#594337]">
                  Welcome, {successReg.name}!
                </h3>

                <p className="text-xs sm:text-sm font-semibold text-[#927B6C]">
                  Standard: {successReg.batch} • Attendance: {successReg.attendance_status}
                </p>

                <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#F0E1CE] text-[#594337] text-xs sm:text-sm leading-relaxed space-y-1">
                  <div>"Your registration slot has been reserved for the <strong>{REUNION_CONFIG.schoolName}</strong> reunion on 27 December 2026 at <strong>{REUNION_CONFIG.confirmedVenueName}</strong>."</div>
                  <div className="text-[11px] text-[#927B6C] font-semibold">Have questions or travel doubts? Call helpline: <strong className="text-[#594337]">{REUNION_CONFIG.contactPhone}</strong></div>
                </div>
              </div>

              {/* PRIMARY ACTION: CREATE MEMORY CARD */}
              <div className="mt-6 pt-4 border-t border-[#F0E1CE] flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={() => {
                    if (onOpenMemoryCardWithStudent) {
                      onOpenMemoryCardWithStudent(successReg.name);
                    } else {
                      onNavigateToSection?.('memory-card');
                    }
                  }}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-[18px] clay-button-gold text-sm font-black flex items-center justify-center space-x-2"
                >
                  <Camera className="w-4 h-4 text-[#413027]" />
                  <span>GENERATE MY STAR SCHOOL ID CARD</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={handleShareWhatsApp}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-[18px] clay-button text-sm font-bold text-[#594337] flex items-center justify-center space-x-2 border border-[#E9B95B]"
                >
                  <Share2 className="w-4 h-4 text-[#E9B95B]" />
                  <span>Share on WhatsApp</span>
                </button>
              </div>
            </div>

            {/* Quick Link to Gallery */}
            <div className="clay-card p-6 bg-[#FFFFFF] border border-[#F0E1CE] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-[#E9B95B]" />
                <span className="text-xs sm:text-sm font-bold text-[#594337]">
                  Want to relive our school memories while you wait?
                </span>
              </div>
              <button
                onClick={() => onNavigateToSection?.('gallery')}
                className="px-4 py-2 rounded-xl clay-button text-xs font-bold text-[#594337]"
              >
                View Memory Photos →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
