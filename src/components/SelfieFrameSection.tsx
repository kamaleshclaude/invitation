import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Download, Share2, ZoomIn, ZoomOut, RotateCcw, Upload, Image as ImageIcon, Sparkles, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { REUNION_CONFIG } from '../config/reunionConfig';
import { sound } from '../utils/soundEffects';
import { useLanguage } from '../context/LanguageContext';
import { useReunionData } from '../context/ReunionDataContext';

type FrameStyle = 'crest' | 'chalkboard' | 'doodle' | 'gold-vip';
type AspectRatio = 'square' | 'portrait';

export const SelfieFrameSection: React.FC = () => {
  const { t } = useLanguage();
  const { addWallMessage } = useReunionData();

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [frameStyle, setFrameStyle] = useState<FrameStyle>('crest');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('square');
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [addedToWall, setAddedToWall] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imgElementRef = useRef<HTMLImageElement | null>(null);

  // Load uploaded image
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      sound.playPop();
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImageSrc(result);
        const img = new Image();
        img.onload = () => {
          imgElementRef.current = img;
          setPosition({ x: 0, y: 0 });
          setScale(1);
          drawCanvas(img, 0, 0, 1, frameStyle, aspectRatio);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Sample selfie placeholder if user wants to preview before uploading
  const handleUseSample = () => {
    sound.playPop();
    const sampleUrl = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80";
    setImageSrc(sampleUrl);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      imgElementRef.current = img;
      setPosition({ x: 0, y: 0 });
      setScale(1);
      drawCanvas(img, 0, 0, 1, frameStyle, aspectRatio);
    };
    img.src = sampleUrl;
  };

  // Redraw when parameters change
  useEffect(() => {
    if (imgElementRef.current) {
      drawCanvas(imgElementRef.current, position.x, position.y, scale, frameStyle, aspectRatio);
    }
  }, [position, scale, frameStyle, aspectRatio]);

  // Main Canvas Rendering Engine
  const drawCanvas = (
    img: HTMLImageElement,
    posX: number,
    posY: number,
    zoom: number,
    frame: FrameStyle,
    ratio: AspectRatio
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = ratio === 'square' ? 1080 : 1080;
    const height = ratio === 'square' ? 1080 : 1920;

    canvas.width = width;
    canvas.height = height;

    // 1. Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // 2. Draw user photo with pan & zoom
    ctx.save();
    // Inner photo clipping region (leave border space)
    const marginX = ratio === 'square' ? 60 : 70;
    const marginY = ratio === 'square' ? 80 : 180;
    const photoWidth = width - marginX * 2;
    const photoHeight = height - marginY * 2 - (ratio === 'square' ? 60 : 120);

    ctx.beginPath();
    ctx.roundRect(marginX, marginY, photoWidth, photoHeight, 30);
    ctx.clip();

    // Calculate aspect ratio covering
    const imgRatio = img.width / img.height;
    const boxRatio = photoWidth / photoHeight;
    let renderW = photoWidth * zoom;
    let renderH = photoHeight * zoom;

    if (imgRatio > boxRatio) {
      renderW = photoHeight * imgRatio * zoom;
    } else {
      renderH = (photoWidth / imgRatio) * zoom;
    }

    const drawX = marginX + (photoWidth - renderW) / 2 + posX;
    const drawY = marginY + (photoHeight - renderH) / 2 + posY;

    ctx.drawImage(img, drawX, drawY, renderW, renderH);
    ctx.restore();

    // 3. Render Custom Themed Border Overlay
    renderFrameOverlay(ctx, width, height, frame, ratio);
  };

  // Frame Overlay Renderer
  const renderFrameOverlay = (
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    frame: FrameStyle,
    ratio: AspectRatio
  ) => {
    ctx.save();

    if (frame === 'crest') {
      // CLASSIC SCHOOL CREST FRAME
      ctx.lineWidth = 24;
      ctx.strokeStyle = '#f59e0b';
      ctx.strokeRect(30, 30, w - 60, h - 60);

      ctx.lineWidth = 6;
      ctx.strokeStyle = '#ffffff';
      ctx.strokeRect(46, 46, w - 92, h - 92);

      // Header Banner
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(80, 20, w - 160, 90);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.strokeRect(80, 20, w - 160, 90);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 36px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(REUNION_CONFIG.schoolName.toUpperCase(), w / 2, 65);
      ctx.font = '22px Outfit, sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.fillText('OFFICIAL GRAND ALUMNI REUNION', w / 2, 95);

      // Footer Banner
      const footerY = h - 140;
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(80, footerY, w - 160, 90);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 4;
      ctx.strokeRect(80, footerY, w - 160, 90);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 36px Outfit, sans-serif';
      ctx.fillText(REUNION_CONFIG.batchName.toUpperCase(), w / 2, footerY + 45);
      ctx.font = '22px Outfit, sans-serif';
      ctx.fillStyle = '#cbd5e1';
      ctx.fillText(`${REUNION_CONFIG.eventDateText} • 10:00 AM`, w / 2, footerY + 75);

    } else if (frame === 'chalkboard') {
      // CHALKBOARD WITH CHALK DOODLES
      ctx.lineWidth = 36;
      ctx.strokeStyle = '#78350f'; // wood border
      ctx.strokeRect(20, 20, w - 40, h - 40);

      // Chalk inner line
      ctx.lineWidth = 4;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.setLineDash([12, 8]);
      ctx.strokeRect(50, 50, w - 100, h - 100);
      ctx.setLineDash([]);

      // Top Header
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 44px Kalam, cursive';
      ctx.textAlign = 'center';
      ctx.fillText(`✎ ${REUNION_CONFIG.schoolShortName} Back to School!`, w / 2, 100);

      // Chalk Doodles
      ctx.font = '32px Kalam, cursive';
      ctx.fillStyle = '#fef08a';
      ctx.fillText('E = mc²', 120, h - 100);
      ctx.fillText('a² + b² = c²', w - 160, h - 100);
      ctx.fillText(`★ ${REUNION_CONFIG.batchYear} ★`, w / 2, h - 80);

    } else if (frame === 'doodle') {
      // COLORFUL NOTEBOOK DOODLE FRAME
      ctx.lineWidth = 20;
      ctx.strokeStyle = '#ec4899';
      ctx.strokeRect(20, 20, w - 40, h - 40);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 40px Kalam, cursive';
      ctx.textAlign = 'center';
      ctx.fillText('★ Golden Days Are Back! ★', w / 2, 80);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '26px Kalam, cursive';
      ctx.fillText('Tiffin Box Gang • Last Benchers Rule!', w / 2, 120);

      ctx.fillStyle = '#f43f5e';
      ctx.font = 'bold 36px Kalam, cursive';
      ctx.fillText(`${REUNION_CONFIG.schoolShortName} • 27 Dec 2026`, w / 2, h - 70);

    } else {
      // GOLDEN VIP REUNION
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, '#f59e0b');
      grad.addColorStop(0.5, '#fef08a');
      grad.addColorStop(1, '#b45309');

      ctx.lineWidth = 30;
      ctx.strokeStyle = grad;
      ctx.strokeRect(20, 20, w - 40, h - 40);

      ctx.fillStyle = '#000000';
      ctx.fillRect(100, 30, w - 200, 80);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.strokeRect(100, 30, w - 200, 80);

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 38px Outfit, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('★ VIP ALUMNI REUNION PASS ★', w / 2, 82);

      ctx.fillStyle = '#000000';
      ctx.fillRect(100, h - 120, w - 200, 80);
      ctx.strokeRect(100, h - 120, w - 200, 80);

      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 32px Outfit, sans-serif';
      ctx.fillText(`${REUNION_CONFIG.batchName.toUpperCase()}`, w / 2, h - 72);
    }

    ctx.restore();
  };

  // Mouse Drag & Pan handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Download Output PNG
  const handleDownload = () => {
    sound.playPop();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `Star-Matric-Reunion-Selfie-${frameStyle}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    confetti({
      particleCount: 40,
      spread: 50,
      origin: { y: 0.6 }
    });
  };

  // Share to WhatsApp / Instagram
  const handleShare = async () => {
    sound.playPop();
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (navigator.share && canvas.toBlob) {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'star-matric-reunion-badge.png', { type: 'image/png' });
        try {
          await navigator.share({
            title: `${REUNION_CONFIG.schoolName} Reunion Badge`,
            text: `Proud Alumni of ${REUNION_CONFIG.schoolName}! Celebrating our reunion on ${REUNION_CONFIG.eventDateText}! 🎓✨\nJoin our WhatsApp: ${REUNION_CONFIG.whatsappGroupUrl}`,
            files: [file]
          });
        } catch {
          // fallback
          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out my Star Matric Reunion badge! Join our WhatsApp group: ${REUNION_CONFIG.whatsappGroupUrl}`)}`, '_blank');
        }
      });
    } else {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out my Star Matric Reunion badge! Join our WhatsApp group: ${REUNION_CONFIG.whatsappGroupUrl}`)}`, '_blank');
    }
  };

  // Add to Reunion Wall (opt-in)
  const handleAddToWall = async () => {
    sound.playCelebration();
    await addWallMessage(
      "Alumni Badge Creator",
      "Just created my Star Matric Reunion 2026 selfie badge! See you all on 27 Dec! 🎓📸",
      "pink"
    );
    setAddedToWall(true);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
    setTimeout(() => setAddedToWall(false), 4000);
  };

  return (
    <section id="selfie-booth" className="py-20 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-3 mb-10">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider border border-cyan-500/30">
          <Camera className="w-3.5 h-3.5" />
          <span>Part Eight: Photo Booth</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-white">
          {t('selfieBooth')}
        </h2>

        <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
          {t('selfieDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT: Canvas Interactive Preview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col items-center">
          <div className="relative w-full max-w-md aspect-square bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-700 shadow-2xl flex items-center justify-center p-2">
            {!imageSrc ? (
              <div className="text-center p-8 space-y-4">
                <div className="w-20 h-20 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto border-2 border-cyan-500/40 animate-pulse">
                  <Camera className="w-10 h-10" />
                </div>
                <h4 className="text-lg font-bold text-white">Upload Your Selfie or Photo</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Drag and reposition inside the frame. 100% private in browser — never uploaded without your permission.
                </p>
                <div className="flex flex-wrap justify-center gap-3 pt-2">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center space-x-2 shadow-lg"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Upload Photo</span>
                  </button>
                  <button
                    onClick={handleUseSample}
                    className="px-4 py-2.5 rounded-xl glass-panel hover:bg-white/10 text-slate-300 text-xs flex items-center space-x-1.5 border border-slate-700"
                  >
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <span>Use Sample</span>
                  </button>
                </div>
              </div>
            ) : (
              <canvas
                ref={canvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                className="w-full h-full object-contain cursor-grab active:cursor-grabbing rounded-2xl"
              />
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Interactive Zoom & Reset Controls */}
          {imageSrc && (
            <div className="flex items-center space-x-4 mt-4 bg-slate-900/90 px-5 py-2 rounded-full border border-slate-700 shadow-lg">
              <span className="text-xs text-slate-400 font-bold">Zoom:</span>
              <button
                onClick={() => setScale(prev => Math.max(0.5, prev - 0.1))}
                aria-label="Zoom Out"
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <input
                type="range"
                min="0.5"
                max="2.5"
                step="0.05"
                value={scale}
                onChange={(e) => setScale(parseFloat(e.target.value))}
                className="w-24 accent-cyan-400"
              />
              <button
                onClick={() => setScale(prev => Math.min(2.5, prev + 0.1))}
                aria-label="Zoom In"
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setScale(1);
                  setPosition({ x: 0, y: 0 });
                }}
                title="Reset Position"
                className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-white"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT: Frame Styles, Aspect Ratio & Export (5 cols) */}
        <div className="lg:col-span-5 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-700 space-y-6">
          {/* Frame Style Picker */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-300 mb-3">
              1. Choose Reunion Frame Style
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'crest', name: 'Official Crest', desc: 'Golden & Navy Crest' },
                { id: 'chalkboard', name: 'Chalkboard', desc: 'Green Board & Chalk' },
                { id: 'doodle', name: 'Notebook Doodle', desc: 'Fun Scribbles & Stars' },
                { id: 'gold-vip', name: 'Golden VIP', desc: 'Luxury Gold Shine' },
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => {
                    sound.playPop();
                    setFrameStyle(style.id as FrameStyle);
                  }}
                  className={`p-3.5 rounded-2xl border text-left transition ${
                    frameStyle === style.id
                      ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold text-xs sm:text-sm">{style.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio Switcher */}
          <div>
            <label className="block text-xs uppercase font-bold tracking-wider text-slate-300 mb-2">
              2. Aspect Ratio
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setAspectRatio('square')}
                className={`py-2.5 rounded-xl font-bold text-xs border transition ${
                  aspectRatio === 'square'
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                Square (1:1 Instagram)
              </button>
              <button
                onClick={() => setAspectRatio('portrait')}
                className={`py-2.5 rounded-xl font-bold text-xs border transition ${
                  aspectRatio === 'portrait'
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900 text-slate-400 border-slate-700'
                }`}
              >
                Portrait (9:16 WhatsApp Status)
              </button>
            </div>
          </div>

          {/* Change Photo Button */}
          {imageSrc && (
            <div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition"
              >
                Change or Upload New Photo
              </button>
            </div>
          )}

          {/* Actions: Download & Share */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleDownload}
              disabled={!imageSrc}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>Download Reunion Badge</span>
            </button>

            <button
              onClick={handleShare}
              disabled={!imageSrc}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Share2 className="w-4 h-4" />
              <span>Share to WhatsApp / Instagram</span>
            </button>

            {/* Optional opt-in to Wall */}
            <button
              onClick={handleAddToWall}
              disabled={!imageSrc || addedToWall}
              className="w-full py-2.5 rounded-xl glass-panel hover:bg-white/10 text-rose-300 font-semibold text-xs flex items-center justify-center space-x-2 border border-rose-500/30 transition"
            >
              {addedToWall ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-300">Added to Reunion Memory Wall!</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <span>Opt-in: Announce on Reunion Wall</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
