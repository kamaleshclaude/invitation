import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Trophy, Volume2, VolumeX, Flame, RotateCcw, Award, Play } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/soundEffects';
import { useReunionData } from '../context/ReunionDataContext';

export const BellGameSection: React.FC = () => {
  const { gameScores, submitGameScore, currentRegistrant } = useReunionData();

  const [gameState, setGameState] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [playerName, setPlayerName] = useState(currentRegistrant?.name || '');
  const [feedback, setFeedback] = useState<string | null>(null);

  const [angle, setAngle] = useState(0);
  const angleRef = useRef(0);
  const speedRef = useRef(0.04);
  const animFrameRef = useRef<number | null>(null);

  useEffect(() => {
    if (gameState !== 'playing') {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    let time = 0;
    const loop = () => {
      time += speedRef.current;
      const currentAngle = Math.sin(time) * 55;
      angleRef.current = currentAngle;
      setAngle(currentAngle);
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState]);

  const handleStartGame = () => {
    sound.playPop();
    setScore(0);
    setCombo(0);
    speedRef.current = 0.05;
    setGameState('playing');
    setFeedback(null);
  };

  const handleRingBell = () => {
    if (gameState !== 'playing') return;

    const currentAng = Math.abs(angleRef.current);
    if (currentAng <= 14) {
      sound.playSchoolBell();
      const points = 50 + combo * 10;
      setScore(prev => prev + points);
      setCombo(prev => prev + 1);
      setFeedback(`PERFECT RING! +${points}`);
      speedRef.current = Math.min(0.12, speedRef.current + 0.005);
      confetti({
        particleCount: 15,
        spread: 40,
        origin: { y: 0.6 },
        colors: ['#E9B95B', '#F6C9A8', '#FFFFFF']
      });
    } else if (currentAng <= 28) {
      sound.playPop();
      const points = 25;
      setScore(prev => prev + points);
      setFeedback(`GOOD! +${points}`);
    } else {
      sound.playPop();
      setFeedback("MISSED THE CLAPPER! Game Over!");
      setGameState('gameover');
      submitGameScore(playerName || "Student", score, combo);
    }
  };

  return (
    <section id="bell-game" className="py-20 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full clay-pill bg-[#FFFFFF] text-[#594337] text-xs font-bold uppercase tracking-wider">
          <Bell className="w-3.5 h-3.5 text-[#E9B95B]" />
          <span>Last Bell Sprint Mini-Game</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-[#594337] tracking-tight">
          Ring the 4:00 PM School Bell!
        </h2>

        <p className="text-sm sm:text-base text-[#927B6C] max-w-xl mx-auto leading-relaxed">
          Tap when the swinging bell hits the center target to ring the final school bell. Rack up combos on the leaderboard!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Game Stage (7 cols) */}
        <div className="md:col-span-7 clay-card p-6 sm:p-8 bg-[#FFFFFF] border-2 border-[#FFFFFF] text-center space-y-6">
          <div className="flex justify-between items-center text-xs font-black text-[#594337] pb-3 border-b border-[#F0E1CE]">
            <span>Player: <strong>{playerName || "Alumni"}</strong></span>
            <span className="text-[#E9B95B] text-sm">Score: {score}</span>
            <span>Combo: {combo}x</span>
          </div>

          {/* Bell Swinging Stage */}
          <div className="h-56 rounded-2xl clay-surface-cream flex flex-col items-center justify-center relative overflow-hidden border border-[#F0E1CE]">
            {/* Center target indicator */}
            <div className="absolute top-0 bottom-0 w-8 bg-[#E9B95B]/20 border-x border-[#E9B95B]/40 pointer-events-none" />

            {/* Swinging Brass Bell */}
            <motion.div
              style={{
                rotate: `${angle}deg`,
                transformOrigin: 'top center'
              }}
              className="text-6xl sm:text-7xl cursor-pointer select-none"
            >
              🔔
            </motion.div>

            {feedback && (
              <div className="absolute bottom-3 text-xs font-black text-[#594337] uppercase tracking-wider">
                {feedback}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="pt-2">
            {gameState === 'idle' && (
              <button
                onClick={handleStartGame}
                className="px-8 py-3.5 rounded-[18px] clay-button-gold text-sm font-black flex items-center justify-center space-x-2 mx-auto"
              >
                <Play className="w-4 h-4 text-[#413027]" />
                <span>START BELL GAME</span>
              </button>
            )}

            {gameState === 'playing' && (
              <button
                onClick={handleRingBell}
                className="w-full py-5 rounded-[22px] clay-button-gold text-lg font-black tracking-wide"
              >
                RING THE BELL NOW! 🔔
              </button>
            )}

            {gameState === 'gameover' && (
              <div className="space-y-3">
                <div className="text-sm font-black text-[#594337]">
                  Final Score: {score} Points (Combo: {combo})
                </div>
                <button
                  onClick={handleStartGame}
                  className="px-8 py-3 rounded-[16px] clay-button-gold text-xs font-black flex items-center justify-center space-x-1.5 mx-auto"
                >
                  <RotateCcw className="w-4 h-4 text-[#413027]" />
                  <span>PLAY AGAIN</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Leaderboard (5 cols) */}
        <div className="md:col-span-5 clay-card p-6 bg-[#FFFFFF] border-2 border-[#FFFFFF] space-y-4">
          <div className="flex items-center space-x-2 pb-2 border-b border-[#F0E1CE]">
            <Trophy className="w-4 h-4 text-[#E9B95B]" />
            <h3 className="font-black text-sm text-[#594337] uppercase tracking-wider">
              Bell Master Leaderboard
            </h3>
          </div>

          <div className="space-y-2">
            {gameScores.slice(0, 5).map((gs, i) => (
              <div
                key={gs.id || i}
                className="p-3 rounded-xl clay-surface-beige flex items-center justify-between text-xs"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-black text-[#E9B95B]">#{i + 1}</span>
                  <span className="font-bold text-[#594337]">{gs.name}</span>
                </div>
                <span className="font-black text-[#594337] font-mono">{gs.score} pts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
