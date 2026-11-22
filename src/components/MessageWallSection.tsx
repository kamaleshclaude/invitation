import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, Sparkles, AlertCircle, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useReunionData } from '../context/ReunionDataContext';
import { sound } from '../utils/soundEffects';
import type { WallMessage } from '../types';

export const MessageWallSection: React.FC = () => {
  const { wallMessages, addWallMessage, currentRegistrant } = useReunionData();

  const [authorName, setAuthorName] = useState(currentRegistrant?.name || '');
  const [messageText, setMessageText] = useState('');
  const [noteColor, setNoteColor] = useState<WallMessage['color']>('yellow');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Clay Color Palettes for Sticky Notes
  const colorMap: Record<WallMessage['color'], { bg: string; text: string; border: string }> = {
    yellow: { bg: 'clay-surface-cream', text: 'text-[#594337]', border: 'border-[#E9B95B]' },
    pink: { bg: 'clay-surface-rose', text: 'text-[#594337]', border: 'border-[#E9B8B0]' },
    cyan: { bg: 'clay-surface-beige', text: 'text-[#594337]', border: 'border-[#D2BBA0]' },
    lime: { bg: 'clay-surface-peach', text: 'text-[#594337]', border: 'border-[#F6C9A8]' },
    orange: { bg: 'clay-surface-cream', text: 'text-[#594337]', border: 'border-[#F6C9A8]' },
    purple: { bg: 'clay-surface-beige', text: 'text-[#594337]', border: 'border-[#E2CEB7]' },
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!messageText.trim()) {
      setErrorMsg("Please enter a short memory note.");
      return;
    }

    setIsSubmitting(true);
    sound.playPop();

    const res = await addWallMessage(
      authorName || currentRegistrant?.name || "Classmate",
      messageText,
      noteColor
    );

    if (!res.success) {
      setErrorMsg(res.error || "Failed to post note.");
    } else {
      setMessageText('');
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#E9B95B', '#E9B8B0', '#F6C9A8', '#594337', '#FFFFFF']
      });
    }

    setIsSubmitting(false);
  };

  const visibleMessages = wallMessages.filter(m => !m.hidden);

  return (
    <section id="message-wall" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full clay-pill bg-[#FFFFFF] text-[#594337] text-xs font-bold uppercase tracking-wider">
          <MessageSquare className="w-3.5 h-3.5 text-[#E9B95B]" />
          <span>Nostalgia Board</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-[#594337] tracking-tight">
          Class Memory Sticky Wall
        </h2>

        <p className="text-sm sm:text-base text-[#927B6C] max-w-xl mx-auto leading-relaxed">
          Pin a nostalgic memory, teacher quote, school nickname, or inside joke for everyone to read!
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Post a Note Card (4 cols) */}
        <div className="lg:col-span-4 clay-card p-6 sm:p-7 bg-[#FFFFFF] border-2 border-[#FFFFFF] space-y-4">
          <h3 className="text-sm font-black text-[#594337] uppercase tracking-wider pb-2 border-b border-[#F0E1CE]">
            Pin Your Memory Note
          </h3>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#E9B8B0]/40 border border-[#E9B8B0] text-xs font-bold text-[#594337] flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-rose-700 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handlePost} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#927B6C] mb-1">
                Your Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3.5 py-2.5 clay-input text-xs font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#927B6C] mb-1">
                Memory Note (Max 140 chars)
              </label>
              <textarea
                rows={3}
                maxLength={140}
                required
                placeholder="Remember when we hid during PT period..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="w-full px-3.5 py-2.5 clay-input text-xs font-medium resize-none"
              />
              <div className="text-[10px] text-right text-[#927B6C] mt-0.5">
                {140 - messageText.length} chars left
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#927B6C] mb-1.5">
                Note Color Palette
              </label>
              <div className="flex gap-2">
                {(['yellow', 'pink', 'cyan', 'lime'] as WallMessage['color'][]).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNoteColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition ${
                      c === 'yellow' ? 'bg-[#FFF5E8]' : c === 'pink' ? 'bg-[#E9B8B0]' : c === 'cyan' ? 'bg-[#F0E1CE]' : 'bg-[#F6C9A8]'
                    } ${noteColor === c ? 'border-[#594337] scale-110' : 'border-transparent'}`}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-[16px] clay-button-gold text-xs font-black flex items-center justify-center space-x-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5 text-[#413027]" />
              <span>{isSubmitting ? "Pinning..." : "PIN NOTE TO WALL"}</span>
            </button>
          </form>
        </div>

        {/* RIGHT: Pinned Notes Grid (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {visibleMessages.length === 0 ? (
            <div className="col-span-full p-12 text-center text-xs font-bold text-[#927B6C] clay-card bg-[#FFFFFF]">
              No notes pinned yet! Be the first classmate to leave a note.
            </div>
          ) : (
            visibleMessages.map((msg, idx) => {
              const rot = idx % 3 === 0 ? -2 : idx % 3 === 1 ? 1.5 : -1;
              const styling = colorMap[msg.color] || colorMap.yellow;

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  style={{ rotate: `${rot}deg` }}
                  className={`p-4 rounded-2xl ${styling.bg} border ${styling.border} shadow-sm relative flex flex-col justify-between min-h-[140px] select-none hover:rotate-0 hover:scale-105 transition-transform duration-200`}
                >
                  {/* Pin Circle on top */}
                  <div className="w-3 h-3 rounded-full bg-[#E9B95B] border border-[#FFFFFF] shadow-xs mx-auto -mt-1 mb-2" />

                  <p className="text-xs font-kalam text-[#594337] leading-relaxed my-1">
                    "{msg.message}"
                  </p>

                  <div className="pt-2 border-t border-[#594337]/10 flex items-center justify-between text-[10px] font-bold text-[#927B6C]">
                    <span className="text-[#594337] font-extrabold">{msg.name}</span>
                    <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};
