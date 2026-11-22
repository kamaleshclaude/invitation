import React, { useState, useEffect } from 'react';
import { OpeningScene } from './components/OpeningScene';
import { Navbar } from './components/Navbar';
import { CountdownSection } from './components/CountdownSection';
import { AboutSection } from './components/AboutSection';
import { SchoolMemoryGallery } from './components/SchoolMemoryGallery';
import { RegistrationSection } from './components/RegistrationSection';
import { MemoryCardGeneratorSection } from './components/MemoryCardGeneratorSection';
import { FoodPreferenceSection } from './components/FoodPreferenceSection';
import { BenchMapSection } from './components/BenchMapSection';
import { MessageWallSection } from './components/MessageWallSection';
import { BellGameSection } from './components/BellGameSection';
import { WhatsAppSection } from './components/WhatsAppSection';
import { SchoolEasterEggs } from './components/SchoolEasterEggs';
import { HeartCursorTrail } from './components/HeartCursorTrail';
import { Footer } from './components/Footer';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LanguageProvider } from './context/LanguageContext';
import { ReunionDataProvider, useReunionData } from './context/ReunionDataContext';

export const AppContent: React.FC = () => {
  const { settings } = useReunionData();

  // Check if visitor has already entered the site during this session
  const [hasEnteredIntro, setHasEnteredIntro] = useState<boolean>(() => {
    return sessionStorage.getItem('star_matric_entered') === 'true' || window.location.hash === '#admin';
  });

  const [isAdminOpen, setIsAdminOpen] = useState<boolean>(() => {
    return window.location.hash === '#admin';
  });

  const [prefilledStudentName, setPrefilledStudentName] = useState<string>('');

  // Listen to hash changes for #admin
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setIsAdminOpen(true);
        setHasEnteredIntro(true);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleEnterSite = () => {
    sessionStorage.setItem('star_matric_entered', 'true');
    setHasEnteredIntro(true);
  };

  const handleNavigateToSection = (id: string) => {
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenMemoryCardWithStudent = (name: string) => {
    setPrefilledStudentName(name);
    handleNavigateToSection('memory-card');
  };

  return (
    <div className="min-h-screen bg-[#FFF5E8] text-[#594337] relative selection:bg-[#E9B95B] selection:text-[#594337]">
      {/* Heart & Star Cursor Trail for desktop */}
      <HeartCursorTrail />

      {!hasEnteredIntro ? (
        /* INTERACTIVE 3D CLAY ENVELOPE OPENING SCENE */
        <OpeningScene onEnter={handleEnterSite} />
      ) : (
        /* MAIN REUNION PORTAL IN PREMIUM CLAYMORPHISM */
        <div className="flex flex-col min-h-screen">
          <Navbar 
            onOpenAdmin={() => setIsAdminOpen(true)}
            onNavigateTo={handleNavigateToSection}
          />

          <main className="flex-grow pt-16 space-y-6">
            {/* 1. Live Reunion Countdown ("THE COUNTDOWN TO OUR MEMORIES") */}
            <CountdownSection 
              onRegisterClick={() => handleNavigateToSection('register')}
              onExploreClick={() => handleNavigateToSection('gallery')}
            />

            {/* 2. About Section Nostalgic Story ("MORE THAN A REUNION. A REUNION OF MEMORIES.") */}
            <AboutSection />

            {/* 3. School Memory Gallery ("THE DAYS WE WISH WE COULD RELIVE") */}
            <SchoolMemoryGallery />

            {/* 4. Student Registration ("LET'S SEE WHO'S COMING!" - Max 60 Limit) */}
            <RegistrationSection 
              onNavigateToSection={handleNavigateToSection}
              onOpenMemoryCardWithStudent={handleOpenMemoryCardWithStudent}
            />

            {/* 5. PERSONALIZED REUNION MEMORY CARD GENERATOR (Star School ID Card Studio) */}
            {settings.card_generator_enabled !== false && (
              <MemoryCardGeneratorSection 
                initialStudentName={prefilledStudentName}
              />
            )}

            {/* 6. Feast & Biryani Counter */}
            <FoodPreferenceSection />

            {/* 7. Classroom Bench Map */}
            <BenchMapSection />

            {/* 8. Sticky Notes Memory Wall */}
            <MessageWallSection />

            {/* 9. Bell Game Mini-Challenge */}
            <BellGameSection />

            {/* 10. WhatsApp Sharing & QR Section */}
            <WhatsAppSection />
          </main>

          {/* Interactive School Objects & Easter Eggs */}
          <SchoolEasterEggs />

          {/* Footer */}
          <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

          {/* Admin Login & Admin Dashboard Modal */}
          {isAdminOpen && (
            <AdminDashboard onClose={() => {
              setIsAdminOpen(false);
              if (window.location.hash === '#admin') {
                window.history.pushState(null, '', window.location.pathname);
              }
            }} />
          )}
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <ReunionDataProvider>
        <AppContent />
      </ReunionDataProvider>
    </LanguageProvider>
  );
}
