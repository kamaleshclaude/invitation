import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  Share2, 
  Volume2, 
  VolumeX, 
  Languages, 
  Menu, 
  X, 
  ShieldCheck, 
  Ticket, 
  Sparkles,
  Camera, 
  MessageSquare,
  Award,
  MapPin,
  Calendar,
  Image as ImageIcon
} from 'lucide-react';
import { REUNION_CONFIG } from '../config/reunionConfig';
import { useLanguage } from '../context/LanguageContext';
import { sound } from '../utils/soundEffects';

interface NavbarProps {
  onOpenAdmin: () => void;
  onNavigateTo: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmin, onNavigateTo }) => {
  const { lang, toggleLang, t } = useLanguage();
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      const currentScroll = window.scrollY;
      if (totalScroll > 0) {
        setScrollProgress((currentScroll / totalScroll) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handleShareSite = () => {
    sound.playPop();
    const siteUrl = window.location.origin;
    const shareText = `School Friends Reunion 2026 • ${REUNION_CONFIG.schoolName}!\n"Some Memories Never Graduate." Register, vote for venue & date, and generate your personal keepsake memory card: ${siteUrl}`;

    if (navigator.share) {
      navigator.share({
        title: `${REUNION_CONFIG.schoolName} Reunion 2026`,
        text: shareText,
        url: siteUrl
      }).catch(() => {
        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
      });
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  const navLinks = [
    { id: 'countdown', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'gallery', label: 'Memories' },
    { id: 'registration', label: 'Registration' },
    { id: 'memory-card', label: 'Memory Card' },
  ];

  return (
    <>
      {/* Scroll Progress Bar at very top */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-[#F0E1CE] z-50">
        <div
          className="h-full bg-gradient-to-r from-[#E9B95B] via-[#E9B8B0] to-[#E9B95B] transition-all duration-150"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <header className="fixed top-1 left-0 right-0 z-40 px-3 sm:px-6 py-2.5">
        <nav className="max-w-7xl mx-auto clay-card px-4 sm:px-6 py-2.5 bg-[#FFFFFF]/95 backdrop-blur-md border border-[#FFFFFF] flex items-center justify-between">
          {/* Brand Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center space-x-2.5 text-left group"
          >
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#F2CE85] to-[#E9B95B] flex items-center justify-center shadow-md shadow-[#E9B95B]/30 group-hover:scale-105 transition">
              <span className="text-lg">🎓</span>
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-sm sm:text-base font-black text-[#594337] tracking-tight">
                  Star Matric
                </span>
                <span className="text-xs text-[#E9B95B]">★</span>
                <span className="text-xs font-extrabold text-[#927B6C] bg-[#FFF5E8] px-2 py-0.5 rounded-full border border-[#F0E1CE]">
                  2026
                </span>
              </div>
              <p className="text-[10px] text-[#927B6C] hidden sm:block">
                School Friends Reunion
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => onNavigateTo(link.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  link.id === 'memory-card'
                    ? 'bg-[#FFF5E8] text-[#594337] border border-[#E9B95B] hover:bg-[#E9B95B]/20 font-black'
                    : 'text-[#594337] hover:text-[#413027] hover:bg-[#F0E1CE]/50'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {/* RSVP CTA Pill Button */}
            <button
              onClick={() => onNavigateTo('register')}
              className="clay-button-gold px-3.5 py-1.5 rounded-full text-xs font-black text-[#413027] shadow-sm flex items-center space-x-1.5"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>RSVP</span>
            </button>

            {/* Share Button */}
            <button
              onClick={handleShareSite}
              aria-label="Share reunion website"
              className="clay-button p-2 rounded-full bg-[#FFFFFF] text-[#594337] hover:text-[#E9B95B]"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            {/* Audio Toggle */}
            <button
              onClick={handleToggleSound}
              aria-label={isMuted ? "Unmute sound" : "Mute sound"}
              className="clay-button p-2 rounded-full bg-[#FFFFFF] text-[#594337] hover:text-[#E9B95B]"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>

            {/* Admin Shield Lock */}
            <button
              onClick={onOpenAdmin}
              aria-label="Admin Dashboard"
              title="Organizer Admin Portal"
              className="clay-button p-2 rounded-full bg-[#FFFFFF] text-[#927B6C] hover:text-[#594337]"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden clay-button p-2 rounded-full bg-[#FFFFFF] text-[#594337]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-3 top-16 z-50 clay-card p-5 bg-[#FFFFFF] border-2 border-[#F0E1CE] shadow-2xl lg:hidden max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#F0E1CE] mb-3">
              <span className="text-xs font-black uppercase tracking-wider text-[#927B6C]">
                Reunion Navigation
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-full text-[#927B6C] hover:text-[#594337]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => {
                    onNavigateTo(link.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`p-3 rounded-2xl text-left text-xs font-bold transition flex items-center space-x-2 ${
                    link.id === 'memory-card'
                      ? 'bg-[#FFF5E8] text-[#594337] border border-[#E9B95B] col-span-2 font-black'
                      : 'bg-[#F0E1CE]/50 text-[#594337] hover:bg-[#F0E1CE]'
                  }`}
                >
                  <span>{link.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-[#F0E1CE] flex items-center justify-between">
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="text-xs font-bold text-[#927B6C] hover:text-[#594337] flex items-center space-x-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Admin Portal</span>
              </button>

              <button
                onClick={toggleLang}
                className="text-xs font-bold text-[#594337] px-3 py-1 rounded-full bg-[#FFF5E8] border border-[#F0E1CE]"
              >
                {lang === 'en' ? 'தமிழ்' : 'English'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
