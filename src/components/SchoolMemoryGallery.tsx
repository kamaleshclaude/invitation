import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Sparkles, X, ChevronLeft, ChevronRight, ZoomIn, Heart } from 'lucide-react';
import { REUNION_CONFIG } from '../config/reunionConfig';
import type { MemoryPhoto } from '../config/reunionConfig';
import { sound } from '../utils/soundEffects';

export const SchoolMemoryGallery: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'group' | 'tour' | 'campus'>('all');
  const [selectedPhoto, setSelectedPhoto] = useState<MemoryPhoto | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  
  const allPhotos = REUNION_CONFIG.defaultMemoryPhotos;
  
  const filteredPhotos = selectedCategory === 'all' 
    ? allPhotos 
    : allPhotos.filter(p => p.category === selectedCategory);

  const handleOpenPhoto = (photo: MemoryPhoto, index: number) => {
    sound.playPop();
    setSelectedPhoto(photo);
    setSelectedIndex(index);
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playPop();
    const nextIdx = (selectedIndex + 1) % filteredPhotos.length;
    setSelectedIndex(nextIdx);
    setSelectedPhoto(filteredPhotos[nextIdx]);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playPop();
    const prevIdx = (selectedIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setSelectedIndex(prevIdx);
    setSelectedPhoto(filteredPhotos[prevIdx]);
  };

  // Keyboard navigation (Arrow keys & Escape)
  useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === 'Escape') {
        setSelectedPhoto(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, selectedIndex, filteredPhotos]);

  return (
    <section id="gallery" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full clay-pill bg-[#FFFFFF] text-[#594337] text-xs font-bold uppercase tracking-wider">
          <Camera className="w-3.5 h-3.5 text-[#E9B95B]" />
          <span>School Memories Vault</span>
        </div>

        {/* Heading from Prompt */}
        <h2 className="text-3xl sm:text-5xl font-black text-[#594337] tracking-tight uppercase">
          THE DAYS WE WISH WE COULD RELIVE
        </h2>

        {/* Supporting text from Prompt */}
        <p className="text-sm sm:text-base text-[#927B6C] max-w-2xl mx-auto leading-relaxed font-semibold">
          From classroom lessons to playground laughter, every corner of our school holds a story worth remembering.
        </p>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
          {[
            { id: 'all', label: 'All Memories', count: allPhotos.length, icon: Sparkles },
            { id: 'group', label: 'Official Group Photo', count: allPhotos.filter(p => p.category === 'group').length, icon: Camera },
            { id: 'tour', label: 'School Tour Diaries', count: allPhotos.filter(p => p.category === 'tour').length, icon: Heart },
            { id: 'campus', label: 'Campus & Classrooms', count: allPhotos.filter(p => p.category === 'campus').length, icon: Camera },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                sound.playPop();
                setSelectedCategory(cat.id as any);
              }}
              className={`px-4 py-2 rounded-full text-xs font-black transition-all ${
                selectedCategory === cat.id
                  ? 'clay-button-gold text-[#413027] shadow-sm'
                  : 'clay-button text-[#927B6C] hover:text-[#594337]'
              }`}
            >
              <span>{cat.label}</span>
              <span className="ml-1.5 opacity-70 font-mono">({cat.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Clay Polaroid Editorial Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 sm:gap-9">
        {filteredPhotos.map((photo, index) => {
          const rotation = photo.rotation || (index % 2 === 0 ? -1.8 : 2.0);
          const isGroupPhoto = photo.category === 'group';
          const isTourPhoto = photo.category === 'tour';

          return (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ delay: index * 0.05 }}
              style={{ rotate: `${rotation}deg` }}
              onClick={() => handleOpenPhoto(photo, index)}
              className={`clay-polaroid cursor-pointer group select-none ${
                isGroupPhoto ? 'sm:col-span-2 lg:col-span-2' : ''
              }`}
            >
              {/* Photo Image Frame */}
              <div className={`relative rounded-xl overflow-hidden mb-4 bg-[#F0E1CE] ${
                isGroupPhoto ? 'aspect-[16/9]' : 'aspect-[4/3]'
              }`}>
                <img
                  src={photo.url}
                  alt={photo.caption}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1000&q=80";
                  }}
                />
                
                {/* Vintage tape overlay on top */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-5 bg-[#F8F1E7]/80 backdrop-blur-sm rounded-sm shadow-sm border-x border-[#E2CEB7] pointer-events-none opacity-80" />

                {/* Badge Tag */}
                <div className={`absolute bottom-2.5 right-2.5 px-3 py-1 rounded-full text-[11px] font-black tracking-wider backdrop-blur-sm shadow-md border ${
                  isGroupPhoto
                    ? 'bg-[#E9B95B] text-[#413027] border-[#FFF5E8]'
                    : isTourPhoto
                    ? 'bg-[#E9B8B0] text-[#594337] border-[#FFFFFF]'
                    : 'bg-[#594337]/90 text-[#FFF5E8] border-[#E9B95B]/30'
                }`}>
                  {isGroupPhoto ? '🎓 BATCH GROUP PHOTO' : isTourPhoto ? '🚌 SCHOOL TOUR' : `★ Photo ${index + 1}`}
                </div>

                {/* Hover Zoom Icon */}
                <div className="absolute inset-0 bg-[#594337]/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#FFFFFF]/90 text-[#594337] flex items-center justify-center shadow-lg">
                    <ZoomIn className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Exact Caption */}
              <div className="px-1 text-center space-y-1">
                <h3 className="font-black text-base text-[#594337] group-hover:text-[#413027] transition font-sans line-clamp-1">
                  "{photo.caption}"
                </h3>
                {photo.year && (
                  <p className="text-xs text-[#927B6C] font-semibold">
                    {photo.year}
                  </p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Lightbox Modal with Full View and Prev/Next Navigation */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPhoto(null)}
            className="fixed inset-0 z-50 bg-[#594337]/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-4xl w-full clay-card p-4 sm:p-6 bg-[#FFFFFF] rounded-[28px] overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute top-4 right-4 z-10 clay-button p-2.5 rounded-full bg-[#FFFFFF] text-[#594337] hover:text-rose-600 shadow-md"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Image Frame with Full Visibility */}
              <div className="relative rounded-2xl overflow-hidden bg-[#1A120D] mb-4 min-h-[320px] max-h-[70vh] flex items-center justify-center">
                <img
                  src={selectedPhoto.url}
                  alt={selectedPhoto.caption}
                  className="w-full max-h-[68vh] object-contain"
                />

                {/* Prev Navigation arrow */}
                <button
                  onClick={(e) => handlePrev(e)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 clay-button p-2.5 rounded-full bg-[#FFFFFF]/90 text-[#594337] shadow-lg hover:scale-105 transition"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                {/* Next Navigation arrow */}
                <button
                  onClick={(e) => handleNext(e)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 clay-button p-2.5 rounded-full bg-[#FFFFFF]/90 text-[#594337] shadow-lg hover:scale-105 transition"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Caption */}
              <div className="text-center space-y-1 px-2">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-base sm:text-lg font-black text-[#594337]">
                    "{selectedPhoto.caption}"
                  </span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#FFF5E8] text-[#E9B95B] font-bold border border-[#F0E1CE]">
                    {selectedIndex + 1} / {filteredPhotos.length}
                  </span>
                </div>
                <p className="text-xs text-[#927B6C]">
                  {selectedPhoto.year} • {REUNION_CONFIG.schoolName}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
