import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'ta';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    welcome: "Welcome Back",
    schoolSubtitle: "Grand Reunion Celebration",
    enterReunion: "Enter the Reunion",
    skipIntro: "Skip Intro",
    eventDate: "Sunday, 27 December 2026",
    eventTime: "10:00 AM to 2:00 PM",
    daysLeft: "Days Left",
    hoursLeft: "Hours",
    minutesLeft: "Minutes",
    secondsLeft: "Seconds",
    registeredCount: "classmates have registered",
    registerNow: "Register pannunga, kalakkalam!",
    registerButton: "Register Now",
    joinWhatsApp: "Join Reunion WhatsApp Group",
    whatsappDesc: "Stay connected with classmates, share old memories, and get live reunion updates!",
    copyLink: "Copy Link",
    linkCopied: "WhatsApp group link copied!",
    voteVenue: "Where Should We Celebrate?",
    voteDesc: "Cast your vote for our reunion venue. Results are live!",
    lockedVenueNotice: "Venue finalized by reunion committee! See you there!",
    getDirections: "Get Directions",
    biryaniWaiting: "Biryani waiting!",
    foodPrefTitle: "Biryani & Feast Preferences",
    foodPrefSubtitle: "Help us order the exact feast quantities! Veg or spicy non-veg?",
    selfieBooth: "Reunion Selfie Frame",
    selfieDesc: "Create your batch photo badge and share on WhatsApp status!",
    messageWall: "Classroom Memory Wall",
    messageWallDesc: "Leave a nostalgic note or school memory for your friends!",
    bellGame: "Bell adichaachu, odu!",
    bellGameTitle: "Fill the Bell Mini-Game",
    bellGameDesc: "Time your tap when the bell clapper hits the sweet spot!",
    benchMap: "Bench-ku vaanga!",
    benchMapTitle: "3D Classroom Bench Map",
    benchMapDesc: "Claim your old classroom bench and see where your besties sit!",
    adminDashboard: "Admin Dashboard",
    addToCalendar: "Add to Calendar",
    shareSite: "Share this site",
    todayIsTheDay: "Today is the day! Welcome to Star Matric Reunion!",
    myOldBench: "Claim My Old Bench",
    alreadyClaimed: "Already Claimed",
    frontBenchers: "Front Benchers",
    lastBenchers: "Last Benchers",
    middleBenchers: "Middle Benchers",
  },
  ta: {
    welcome: "மீண்டும் சந்திப்போம்!",
    schoolSubtitle: "பள்ளி நினைவுகள் - மாபெரும் சந்திப்பு",
    enterReunion: "சந்திப்பில் நுழையுங்கள்",
    skipIntro: "நேரடியாக செல்ல",
    eventDate: "ஞாயிறு, 27 டிசம்பர் 2026",
    eventTime: "காலை 10:00 முதல் மதியம் 2:00 வரை",
    daysLeft: "நாட்கள் மீதம்",
    hoursLeft: "மணி",
    minutesLeft: "நிமிடம்",
    secondsLeft: "நொடிகள்",
    registeredCount: "பழைய தோழர்கள் பதிவு செய்துள்ளனர்",
    registerNow: "ரிஜிஸ்டர் பண்ணுங்க, கலக்கலாம்!",
    registerButton: "பதிவு செய்க",
    joinWhatsApp: "வாட்ஸ்அப் குழுவில் இணைக",
    whatsappDesc: "பழைய நண்பர்களுடன் பேச, புகைப்படங்கள் பகிர உடனே வாட்ஸ்அப் குழுவில் இணைக!",
    copyLink: "இணைப்பை நகலெடு",
    linkCopied: "வாட்ஸ்அப் இணைப்பு நகலெடுக்கப்பட்டது!",
    voteVenue: "எங்கே கொண்டாடலாம்? (Venue Vote)",
    voteDesc: "எங்கள் சந்திப்பு நடக்கும் இடத்தை தேர்வு செய்யுங்கள். நேரலை முடிவுகள்!",
    lockedVenueNotice: "இடம் இறுதி செய்யப்பட்டு பூட்டப்பட்டது! அனைவரும் வருக!",
    getDirections: "வழித்தடம் பார்க்க",
    biryaniWaiting: "பிரியாணி வெயிட்டிங்!",
    foodPrefTitle: "பிரியாணி & விருந்து விருப்பங்கள்",
    foodPrefSubtitle: "அசைவ பிரியாணியா அல்லது சைவமா? உங்கள் கார அளவு என்ன?",
    selfieBooth: "ரீயூனியன் செல்ஃபி ஃப்ரேம்",
    selfieDesc: "உங்கள் புகைப்படத்துடன் பள்ளி பேட்ஜ் உருவாக்கி வாட்ஸ்அப் ஸ்டேட்டஸில் வையுங்கள்!",
    messageWall: "வகுப்பறை நினைவுகள் சுவர்",
    messageWallDesc: "நண்பர்களுக்கான உங்கள் அன்பான செய்தியையும் பள்ளிக் கால நினைவுகளையும் எழுதுங்கள்!",
    bellGame: "பெல் அடிச்சாச்சு, ஓடு!",
    bellGameTitle: "பள்ளி மணி அடிக்கும் விளையாட்டு",
    bellGameDesc: "சரியான நேரத்தில் தட்டி மணியை ஒலிக்க விடுங்கள்!",
    benchMap: "பெஞ்சுக்கு வாங்க!",
    benchMapTitle: "3D வகுப்பறை பெஞ்ச் மேப்",
    benchMapDesc: "உங்கள் பழைய பெஞ்சை தேர்வு செய்து உங்கள் நண்பர்கள் எங்கே அமர்ந்துள்ளனர் என பாருங்கள்!",
    adminDashboard: "நிர்வாகி பக்கம்",
    addToCalendar: "கேலெண்டரில் சேர்க்க",
    shareSite: "நண்பர்களுக்கு பகிர்க",
    todayIsTheDay: "இன்றுதான் அந்த நாள்! ஸ்டார் மெட்ரிக் சந்திப்பிற்கு நல்வரவு!",
    myOldBench: "என் பழைய பெஞ்ச்",
    alreadyClaimed: "ஏற்கனவே பதிவு செய்யப்பட்டது",
    frontBenchers: "முதல் பெஞ்ச் மாணவர்கள்",
    lastBenchers: "கடைசி பெஞ்ச் கில்லாடிகள்",
    middleBenchers: "நடு பெஞ்ச் நண்பர்கள்",
  }
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  toggleLang: () => {},
  t: (key: string) => key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    return (localStorage.getItem('star_matric_lang') as Language) || 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('star_matric_lang', newLang);
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'ta' : 'en');
  };

  const t = (key: string): string => {
    return translations[lang][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
