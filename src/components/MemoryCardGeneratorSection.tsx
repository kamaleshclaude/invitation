import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  Upload, 
  Download, 
  Share2, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  User, 
  Trash2, 
  RefreshCw,
  Image as ImageIcon,
  Check,
  AlertCircle,
  GraduationCap,
  Eye,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { REUNION_CONFIG } from '../config/reunionConfig';
import { useReunionData } from '../context/ReunionDataContext';
import { sound } from '../utils/soundEffects';

export type CardTemplate = 'idcard' | 'classic' | 'golden' | 'vintage';

interface MemoryCardGeneratorProps {
  initialStudentName?: string;
}

export const MemoryCardGeneratorSection: React.FC<MemoryCardGeneratorProps> = ({ initialStudentName }) => {
  const { 
    currentRegistrant, 
    registrations, 
    recordCardGenerated 
  } = useReunionData();

  // Student Name & Standard State
  const [studentName, setStudentName] = useState<string>(() => {
    if (initialStudentName) return initialStudentName;
    if (currentRegistrant?.name) return currentRegistrant.name;
    const stored = localStorage.getItem('star_matric_last_registered_student');
    if (stored) {
      const lower = stored.toLowerCase();
      if (lower.includes('krithik') || lower.includes('karthik') || lower.includes('priya') || lower.includes('senthil') || lower.includes('anand')) {
        try { localStorage.removeItem('star_matric_last_registered_student'); } catch {}
        return "";
      }
      return stored;
    }
    return registrations[0]?.name || "";
  });

  const [studentBatch, setStudentBatch] = useState<string>(() => {
    if (currentRegistrant?.batch) return currentRegistrant.batch;
    const stored = localStorage.getItem('star_matric_last_registered_batch');
    if (stored) return stored;
    return registrations[0]?.batch || "XII - A";
  });

  // Purge any lingering example names on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('star_matric_last_registered_student');
      if (stored && stored.toLowerCase().includes('krithik')) {
        localStorage.removeItem('star_matric_last_registered_student');
        setStudentName("");
      }
    } catch {}
  }, []);

  // Photo & Canvas State
  const [photoSrc, setPhotoSrc] = useState<string | null>(null);
  const [photoImg, setPhotoImg] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [panX, setPanX] = useState<number>(0);
  const [panY, setPanY] = useState<number>(0);
  const [template, setTemplate] = useState<CardTemplate>('idcard');
  const [hasConsent, setHasConsent] = useState<boolean>(true);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [downloadedCardUrl, setDownloadedCardUrl] = useState<string | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const idCardTemplateImgRef = useRef<HTMLImageElement | null>(null);

  // Preload master blank ID card template image
  useEffect(() => {
    const idImg = new Image();
    idImg.crossOrigin = "anonymous";
    idImg.onload = () => {
      idCardTemplateImgRef.current = idImg;
      if (previewCanvasRef.current) {
        renderCardToCanvas(previewCanvasRef.current, false);
      }
    };
    idImg.src = "/star-id-card-template.jpg";
  }, []);

  // Sync initial student name & standard if passed or registered
  useEffect(() => {
    if (initialStudentName) {
      setStudentName(initialStudentName);
      const matched = registrations.find(r => r.name.toLowerCase() === initialStudentName.toLowerCase());
      if (matched?.batch) setStudentBatch(matched.batch);
      if (matched?.photo_url) loadPhotoFromUrl(matched.photo_url);
    } else if (currentRegistrant?.name) {
      setStudentName(currentRegistrant.name);
      if (currentRegistrant.batch) setStudentBatch(currentRegistrant.batch);
      if (currentRegistrant.photo_url) loadPhotoFromUrl(currentRegistrant.photo_url);
    }
  }, [initialStudentName, currentRegistrant, registrations]);

  // Load photo by URL
  const loadPhotoFromUrl = (url: string) => {
    sound.playPop();
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setPhotoImg(img);
      setPhotoSrc(url);
      setPanX(0);
      setPanY(0);
      setZoom(1);
    };
    img.onerror = () => {
      const fallbackUrl = "/memories/classroom-teacher-teaching.jpg";
      const fb = new Image();
      fb.crossOrigin = "anonymous";
      fb.onload = () => {
        setPhotoImg(fb);
        setPhotoSrc(fallbackUrl);
      };
      fb.src = fallbackUrl;
    };
    img.src = url;
  };

  // Automatically load default classroom memory if no photo set
  useEffect(() => {
    if (!photoImg && !photoSrc) {
      const storedPhoto = localStorage.getItem('star_matric_last_registered_photo');
      if (storedPhoto) {
        loadPhotoFromUrl(storedPhoto);
      } else {
        loadPhotoFromUrl("/memories/classroom-teacher-teaching.jpg");
      }
    }
  }, []);

  // Handle File Upload
  const handleFileUpload = (file: File) => {
    setUploadError(null);

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setUploadError("Please upload a valid image file (JPG, JPEG, PNG, or WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Photograph must be under 10MB.");
      return;
    }

    sound.playPop();
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      const img = new Image();
      img.onload = () => {
        setPhotoImg(img);
        setPhotoSrc(dataUrl);
        setPanX(0);
        setPanY(0);
        setZoom(1);
      };
      img.src = dataUrl;
    };
    reader.onerror = () => {
      setUploadError("Failed to read the image file. Please try another.");
    };
    reader.readAsDataURL(file);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemovePhoto = () => {
    sound.playPop();
    setPhotoSrc(null);
    setPhotoImg(null);
    setPanX(0);
    setPanY(0);
    setZoom(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleResetAdjustments = () => {
    sound.playPop();
    setZoom(1);
    setPanX(0);
    setPanY(0);
  };

  // Canvas Mouse Pan Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!photoImg) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !photoImg) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // DRAW CANVAS ENGINE
  const renderCardToCanvas = useCallback((canvas: HTMLCanvasElement, forExport: boolean = false) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // ==========================================
    // 1. EXACT STAR SCHOOL ID CARD MASTER TEMPLATE
    // ==========================================
    if (template === 'idcard') {
      const width = 776;
      const height = 1024;
      canvas.width = width;
      canvas.height = height;

      // Draw original ID card template as master background
      if (idCardTemplateImgRef.current && idCardTemplateImgRef.current.complete) {
        ctx.drawImage(idCardTemplateImgRef.current, 0, 0, width, height);
      } else {
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#FFFFFF');
        bgGrad.addColorStop(0.5, '#FFF7D6');
        bgGrad.addColorStop(1, '#FFEB85');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);
      }

      // Exact Photo Frame Coordinates from blank ID template:
      // Inner Portrait Frame: x: 254, y: 310, w: 268, h: 302
      const frameX = 254;
      const frameY = 310;
      const frameW = 268;
      const frameH = 302;

      ctx.save();
      ctx.beginPath();
      ctx.rect(frameX, frameY, frameW, frameH);
      ctx.clip();

      if (photoImg) {
        const scale = zoom;
        const naturalAspect = photoImg.naturalWidth / photoImg.naturalHeight;
        const frameAspect = frameW / frameH;

        let renderW: number;
        let renderH: number;

        if (naturalAspect > frameAspect) {
          renderH = frameH * scale;
          renderW = renderH * naturalAspect;
        } else {
          renderW = frameW * scale;
          renderH = renderW / naturalAspect;
        }

        const renderX = frameX + (frameW - renderW) / 2 + panX;
        const renderY = frameY + (frameH - renderH) / 2 + panY;

        ctx.drawImage(photoImg, renderX, renderY, renderW, renderH);
      } else {
        ctx.fillStyle = '#EBEBEB';
        ctx.fillRect(frameX, frameY, frameW, frameH);
        ctx.fillStyle = '#777777';
        ctx.font = 'bold 18px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Upload Photo', frameX + frameW / 2, frameY + frameH / 2);
      }
      ctx.restore();

      // Sharp Red Frame Border (Matching original template)
      ctx.strokeStyle = '#D41414';
      ctx.lineWidth = 4;
      ctx.strokeRect(251, 307, 274, 308);

      // Student Name on "Name :" line
      ctx.fillStyle = '#1A1A1A';
      ctx.font = '900 24px Outfit, sans-serif';
      ctx.textAlign = 'left';
      const cleanName = studentName.trim();
      if (cleanName) {
        ctx.fillText(cleanName.toUpperCase(), 285, 663);
      }

      // Student Standard on "Section :" line
      ctx.fillStyle = '#1A1A1A';
      ctx.font = '800 23px Outfit, sans-serif';
      ctx.textAlign = 'left';
      const cleanBatch = studentBatch.trim();
      if (cleanBatch) {
        ctx.fillText(cleanBatch.toUpperCase(), 300, 733);
      }

      return;
    }

    // ==========================================
    // 2. KEEPSAKE REUNION CARDS (1080 x 1350 px)
    // ==========================================
    const width = 1080;
    const height = 1350;
    canvas.width = width;
    canvas.height = height;

    if (template === 'golden') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#FFF9F0');
      grad.addColorStop(0.5, '#F0E1CE');
      grad.addColorStop(1, '#E8D4BE');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#E9B95B';
      ctx.lineWidth = 14;
      ctx.strokeRect(28, 28, width - 56, height - 56);

      ctx.strokeStyle = '#D99F37';
      ctx.lineWidth = 2;
      ctx.strokeRect(40, 40, width - 80, height - 80);

    } else if (template === 'vintage') {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#FCF5EC');
      grad.addColorStop(1, '#EFE3D3');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#594337';
      ctx.lineWidth = 6;
      ctx.strokeRect(32, 32, width - 64, height - 64);

      ctx.strokeStyle = '#E9B8B0';
      ctx.lineWidth = 3;
      ctx.strokeRect(44, 44, width - 88, height - 88);

    } else {
      // Classic Keepsake
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#FFFFFF');
      grad.addColorStop(0.4, '#FFF5E8');
      grad.addColorStop(1, '#F0E1CE');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = '#E9B95B';
      ctx.lineWidth = 8;
      ctx.strokeRect(30, 30, width - 60, height - 60);

      ctx.strokeStyle = '#F6C9A8';
      ctx.lineWidth = 3;
      ctx.strokeRect(42, 42, width - 84, height - 84);
    }

    // Top Heading
    ctx.textAlign = 'center';
    ctx.fillStyle = '#927B6C';
    ctx.font = '700 22px Outfit, sans-serif';
    ctx.fillText("★ OFFICIAL REUNION KEEPSAKE ★", width / 2, 95);

    ctx.fillStyle = '#594337';
    ctx.font = '900 46px Outfit, sans-serif';
    ctx.fillText(REUNION_CONFIG.schoolName.toUpperCase(), width / 2, 155);

    ctx.fillStyle = '#E9B95B';
    ctx.font = '800 30px Outfit, sans-serif';
    ctx.fillText("SCHOOL FRIENDS REUNION 2026", width / 2, 200);

    // Photo Box
    const frameX = 165;
    const frameY = 240;
    const frameWidth = 750;
    const frameHeight = 620;
    const borderRadius = 28;

    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(frameX, frameY, frameWidth, frameHeight, borderRadius);
    ctx.fill();

    ctx.strokeStyle = template === 'golden' ? '#E9B95B' : '#F0E1CE';
    ctx.lineWidth = 8;
    ctx.stroke();

    const photoInnerX = frameX + 14;
    const photoInnerY = frameY + 14;
    const photoInnerWidth = frameWidth - 28;
    const photoInnerHeight = frameHeight - 28;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(photoInnerX, photoInnerY, photoInnerWidth, photoInnerHeight, borderRadius - 8);
    ctx.clip();

    if (photoImg) {
      const scale = zoom;
      const naturalAspect = photoImg.naturalWidth / photoImg.naturalHeight;
      const frameAspect = photoInnerWidth / photoInnerHeight;

      let renderW: number;
      let renderH: number;

      if (naturalAspect > frameAspect) {
        renderH = photoInnerHeight * scale;
        renderW = renderH * naturalAspect;
      } else {
        renderW = photoInnerWidth * scale;
        renderH = renderW / naturalAspect;
      }

      const renderX = photoInnerX + (photoInnerWidth - renderW) / 2 + panX;
      const renderY = photoInnerY + (photoInnerHeight - renderH) / 2 + panY;

      ctx.drawImage(photoImg, renderX, renderY, renderW, renderH);
    } else {
      ctx.fillStyle = '#F0E1CE';
      ctx.fillRect(photoInnerX, photoInnerY, photoInnerWidth, photoInnerHeight);
    }
    ctx.restore();

    // Student Badge Box
    const badgeY = frameY + frameHeight + 35;
    ctx.fillStyle = '#594337';
    ctx.font = '900 52px Outfit, sans-serif';
    ctx.fillText((studentName || "Classmate").toUpperCase(), width / 2, badgeY + 45);

    ctx.fillStyle = '#927B6C';
    ctx.font = '700 24px Outfit, sans-serif';
    ctx.fillText(`Class of ${REUNION_CONFIG.batchYear} • Standard: ${studentBatch}`, width / 2, badgeY + 85);

    // Event Info
    ctx.fillStyle = '#413027';
    ctx.font = '800 22px Outfit, sans-serif';
    ctx.fillText("📅 27 December 2026 • 10:00 AM (IST)", width / 2, badgeY + 140);
    ctx.fillText(`📍 ${REUNION_CONFIG.schoolName}, Karur`, width / 2, badgeY + 175);

    // Footer
    ctx.fillStyle = '#927B6C';
    ctx.font = '500 16px Outfit, sans-serif';
    ctx.fillText(`Official Keepsake Pass • ${REUNION_CONFIG.schoolName}`, width / 2, 1310);

  }, [template, studentName, studentBatch, photoImg, zoom, panX, panY]);

  // Live Preview Canvas redraw
  useEffect(() => {
    const previewCanvas = previewCanvasRef.current;
    if (previewCanvas) {
      renderCardToCanvas(previewCanvas, false);
    }
  }, [renderCardToCanvas]);

  // HIGH-QUALITY PNG EXPORT
  const handleDownloadPNG = async () => {
    if (!hasConsent) {
      setUploadError("Please check the consent box to confirm processing your photo.");
      return;
    }

    setIsExporting(true);
    sound.playCelebration();

    try {
      const exportCanvas = document.createElement('canvas');
      renderCardToCanvas(exportCanvas, true);

      const dataUrl = exportCanvas.toDataURL('image/png');
      setDownloadedCardUrl(dataUrl);

      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#E9B95B', '#E9B8B0', '#F6C9A8', '#594337']
      });

      const cleanName = (studentName || "Alumni").replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = template === 'idcard' 
        ? `Star_Matric_ID_Card_${cleanName}.png`
        : `School_Friends_Reunion_2026_${cleanName}.png`;

      exportCanvas.toBlob((blob) => {
        if (!blob) {
          setIsExporting(false);
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Record tracking in context
        recordCardGenerated(studentName || "Classmate", template);
        setIsExporting(false);
      }, 'image/png');

    } catch (err) {
      setIsExporting(false);
      setUploadError("Failed to render card for download. Please try again.");
    }
  };

  // WhatsApp Web Share API Level 2 or Link Fallback
  const handleShareWhatsApp = async () => {
    sound.playPop();

    if (navigator.share) {
      try {
        const exportCanvas = document.createElement('canvas');
        renderCardToCanvas(exportCanvas, true);

        exportCanvas.toBlob(async (blob) => {
          if (blob && navigator.canShare) {
            const cleanName = (studentName || "Alumni").replace(/[^a-zA-Z0-9_-]/g, '_');
            const filename = `Star_Matric_Reunion_${cleanName}.png`;
            const file = new File([blob], filename, { type: 'image/png' });

            if (navigator.canShare({ files: [file] })) {
              try {
                await navigator.share({
                  files: [file],
                  title: `${REUNION_CONFIG.schoolName} Reunion Keepsake`,
                  text: `Here is my personalized School Friends Reunion card! Join the reunion here: ${window.location.origin}`
                });
                return;
              } catch (e) {
                // Cancelled or unsupported file share
              }
            }
          }
          openWhatsAppTextShare();
        }, 'image/png');
        return;
      } catch (err) {
        // Fallback
      }
    }

    openWhatsAppTextShare();
  };

  const openWhatsAppTextShare = () => {
    const siteUrl = window.location.origin;
    const shareText = `Check out my personalized keepsake memory card for our School Friends Reunion 2026 (${REUNION_CONFIG.schoolName})!\n\nGenerate your own STAR ID card and register here: ${siteUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <section id="memory-card" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* 1. Header from Prompt */}
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full clay-pill bg-[#FFFFFF] text-[#594337] text-xs font-bold uppercase tracking-wider">
          <Camera className="w-3.5 h-3.5 text-[#E9B95B]" />
          <span>Dynamic Keepsake Studio</span>
        </div>

        {/* Heading from Prompt */}
        <h2 className="text-3xl sm:text-5xl font-black text-[#594337] tracking-tight uppercase">
          TAKE A PIECE OF OUR MEMORIES WITH YOU
        </h2>

        {/* Supporting text from Prompt */}
        <p className="text-sm sm:text-base text-[#927B6C] max-w-2xl mx-auto leading-relaxed font-semibold">
          Your school memories deserve to be remembered. Create your personalized reunion keepsake and download it.
        </p>
      </div>

      {/* 2. Main Studio Form Container (Single Column Focused) */}
      <div className="max-w-xl mx-auto space-y-6">
          
          {/* Card 1: Student Information */}
          <div className="clay-card p-6 bg-[#FFFFFF] border-2 border-[#FFFFFF] space-y-4">
            <div className="flex items-center space-x-2 pb-2 border-b border-[#F0E1CE]">
              <User className="w-4 h-4 text-[#E9B95B]" />
              <h3 className="font-black text-sm text-[#594337] uppercase tracking-wider">
                1. Student Details on ID Card
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#927B6C] mb-1.5">
                Student Full Name:
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter student full name"
                className="w-full px-4 py-3 clay-input text-sm font-bold text-[#594337]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#927B6C] mb-1.5">
                Standard / Section:
              </label>
              <input
                type="text"
                value={studentBatch}
                onChange={(e) => setStudentBatch(e.target.value)}
                placeholder="e.g. XII - A"
                className="w-full px-4 py-3 clay-input text-sm font-bold text-[#594337]"
              />
            </div>

            {/* Quick prefill from registered classmates */}
            {registrations.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-[#927B6C] mb-1">
                  Or select from registered classmates:
                </label>
                <select
                  onChange={(e) => {
                    const selected = registrations.find(r => r.name === e.target.value);
                    if (selected) {
                      setStudentName(selected.name);
                      if (selected.batch) setStudentBatch(selected.batch);
                      if (selected.photo_url) loadPhotoFromUrl(selected.photo_url);
                    }
                  }}
                  className="w-full px-3 py-2 clay-input text-xs font-bold text-[#594337] bg-[#FFFDF9]"
                  defaultValue=""
                >
                  <option value="" disabled>Choose registered name...</option>
                  {registrations.map(r => (
                    <option key={r.id} value={r.name}>{r.name} ({r.batch})</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Card 2: Photo Upload & Positioning */}
          <div className="clay-card p-6 bg-[#FFFFFF] border-2 border-[#FFFFFF] space-y-5">
            <div className="flex items-center justify-between pb-2 border-b border-[#F0E1CE]">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-[#E9B95B]" />
                <h3 className="font-black text-sm text-[#594337] uppercase tracking-wider">
                  2. Upload Your Photograph
                </h3>
              </div>
              {photoSrc && (
                <button
                  onClick={handleRemovePhoto}
                  className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            {/* Drag & Drop Area */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="p-6 rounded-2xl clay-surface-cream border-2 border-dashed border-[#E9B95B] hover:border-[#D99F37] cursor-pointer text-center space-y-2 transition-all group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png, image/jpeg, image/jpg, image/webp"
                className="hidden"
                onChange={onFileInputChange}
              />
              <div className="w-12 h-12 rounded-full bg-[#FFFFFF] text-[#E9B95B] group-hover:scale-110 flex items-center justify-center mx-auto shadow-sm transition">
                <Upload className="w-6 h-6" />
              </div>
              <div className="text-xs sm:text-sm font-black text-[#594337]">
                {photoSrc ? "Click or drag to replace photo" : "Click to select or drag photo here"}
              </div>
              <div className="text-[11px] text-[#927B6C]">
                Supports JPG, JPEG, PNG, WebP (Max 10MB)
              </div>
            </div>

            {/* Quick Batch Photo Selection Chips */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#927B6C]">
                Or test with school memory photos:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => loadPhotoFromUrl("/memories/classroom-teacher-teaching.jpg")}
                  className={`p-2 rounded-xl text-left font-bold transition flex items-center space-x-2 border ${
                    photoSrc === "/memories/classroom-teacher-teaching.jpg"
                      ? "bg-[#FFF5E8] border-[#E9B95B] text-[#594337] shadow-sm"
                      : "bg-[#FFFFFF] border-[#F0E1CE] text-[#927B6C] hover:bg-[#FFFDF9]"
                  }`}
                >
                  <span>👨‍🏫</span>
                  <span className="truncate">Our Teacher</span>
                </button>
                <button
                  type="button"
                  onClick={() => loadPhotoFromUrl("/memories/teacher-student-science-lab.jpg")}
                  className={`p-2 rounded-xl text-left font-bold transition flex items-center space-x-2 border ${
                    photoSrc === "/memories/teacher-student-science-lab.jpg"
                      ? "bg-[#FFF5E8] border-[#E9B95B] text-[#594337] shadow-sm"
                      : "bg-[#FFFFFF] border-[#F0E1CE] text-[#927B6C] hover:bg-[#FFFDF9]"
                  }`}
                >
                  <span>🔬</span>
                  <span className="truncate">Science Lab</span>
                </button>
                <button
                  type="button"
                  onClick={() => loadPhotoFromUrl("/memories/school-computer-lab.jpg")}
                  className={`p-2 rounded-xl text-left font-bold transition flex items-center space-x-2 border ${
                    photoSrc === "/memories/school-computer-lab.jpg"
                      ? "bg-[#FFF5E8] border-[#E9B95B] text-[#594337] shadow-sm"
                      : "bg-[#FFFFFF] border-[#F0E1CE] text-[#927B6C] hover:bg-[#FFFDF9]"
                  }`}
                >
                  <span>💻</span>
                  <span className="truncate">Computer Lab</span>
                </button>
                <button
                  type="button"
                  onClick={() => loadPhotoFromUrl("/memories/star-matric-batch-official.jpg")}
                  className={`p-2 rounded-xl text-left font-bold transition flex items-center space-x-2 border ${
                    photoSrc === "/memories/star-matric-batch-official.jpg"
                      ? "bg-[#FFF5E8] border-[#E9B95B] text-[#594337] shadow-sm"
                      : "bg-[#FFFFFF] border-[#F0E1CE] text-[#927B6C] hover:bg-[#FFFDF9]"
                  }`}
                >
                  <span>🎓</span>
                  <span className="truncate">Official Batch</span>
                </button>
              </div>
            </div>

            {uploadError && (
              <div className="p-3 rounded-xl bg-[#E9B8B0]/40 border border-[#E9B8B0] text-xs font-bold text-[#594337] flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-700 flex-shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Photo Adjustments (Zoom & Pan) */}
            {photoSrc && (
              <div className="space-y-4 pt-2 border-t border-[#F0E1CE]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#594337] uppercase">
                    Photo Adjustments
                  </span>
                  <button
                    onClick={handleResetAdjustments}
                    className="text-xs font-bold text-[#927B6C] hover:text-[#594337] flex items-center space-x-1"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>
                </div>

                {/* Zoom Slider */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-[#927B6C]">
                    <span className="flex items-center space-x-1">
                      <ZoomOut className="w-3.5 h-3.5" />
                      <span>Zoom:</span>
                    </span>
                    <span>{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full accent-[#E9B95B] cursor-pointer"
                  />
                </div>

                {/* Pan Instructions */}
                <div className="p-2.5 rounded-xl clay-surface-beige text-[11px] font-semibold text-[#594337] text-center">
                  💡 Drag the photo directly on the preview card on the right to position it!
                </div>
              </div>
            )}
          </div>

          {/* Card 3: Official STAR School ID Card Badge */}
          <div className="clay-card p-4 sm:p-5 bg-[#FFFFFF] border-2 border-[#FFFFFF] flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF5E8] border border-[#F0E1CE] text-[#E9B95B] flex items-center justify-center flex-shrink-0 text-xl shadow-sm">
              🎓
            </div>
            <div>
              <div className="text-xs font-black uppercase text-[#594337] tracking-wider flex items-center space-x-1.5">
                <span>Official STAR School ID Card</span>
                <span className="text-[#E9B95B]">★</span>
              </div>
              <div className="text-[11px] text-[#927B6C] font-semibold mt-0.5">
                Official ID card artwork with school crest, Karur address & signature
              </div>
            </div>
          </div>

          {/* Consent Checkbox */}
          <div className="clay-surface-cream p-4 rounded-2xl border border-[#F0E1CE] flex items-start space-x-2.5">
            <input
              type="checkbox"
              id="photoConsent"
              checked={hasConsent}
              onChange={(e) => setHasConsent(e.target.checked)}
              className="mt-1 accent-[#E9B95B] rounded"
            />
            <label htmlFor="photoConsent" className="text-xs text-[#927B6C] leading-relaxed cursor-pointer select-none">
              I consent to processing my photograph purely within my browser to render my personalized reunion ID card.
            </label>
          </div>

          {/* ACTION BUTTONS (Download & Share) */}
          <div className="space-y-3 pt-2">
            <button
              onClick={handleDownloadPNG}
              disabled={isExporting}
              className="w-full py-4 px-6 rounded-[20px] clay-button-gold text-base font-black flex items-center justify-center space-x-2.5 shadow-md disabled:opacity-50 hover:scale-[1.02] transition"
            >
              {isExporting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin text-[#413027]" />
                  <span>Generating & Downloading ID Card...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 text-[#413027]" />
                  <span>DOWNLOAD STAR SCHOOL ID CARD</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="w-full py-3.5 px-6 rounded-[20px] clay-button text-sm font-black text-[#594337] flex items-center justify-center space-x-2 border border-[#E9B95B]"
            >
              <Share2 className="w-4 h-4 text-[#E9B95B]" />
              <span>Share on WhatsApp</span>
            </button>
          </div>

          {/* DOWNLOADED CARD DISPLAY & VIEW ("seen is enough") */}
          <AnimatePresence>
            {downloadedCardUrl && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="clay-card p-6 sm:p-8 bg-[#FFFFFF] border-2 border-[#E9B95B] rounded-[28px] text-center space-y-5 shadow-xl"
              >
                <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>ID Card Downloaded Successfully!</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-black text-[#594337]">
                    Official STAR School ID Card
                  </h3>
                  <p className="text-xs text-[#927B6C] font-semibold">
                    Saved directly to your device downloads folder
                  </p>
                </div>

                {/* Rendered Card Image Display */}
                <div className="relative inline-block mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-[#FFF5E8] max-w-[280px]">
                  <img
                    src={downloadedCardUrl}
                    alt="Your Generated STAR School ID Card"
                    className="w-full h-auto block rounded-xl cursor-pointer hover:opacity-95 transition"
                    onClick={() => setIsViewModalOpen(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsViewModalOpen(true)}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-[#594337]/90 text-[#FFF5E8] text-[11px] font-black flex items-center space-x-1 shadow-md hover:scale-105 transition"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#E9B95B]" />
                    <span>View Full Size</span>
                  </button>
                </div>

                {/* Quick Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleDownloadPNG}
                    className="w-full sm:w-auto px-6 py-3 rounded-[16px] clay-button-gold text-xs font-black flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4 text-[#413027]" />
                    <span>Download Again</span>
                  </button>

                  <button
                    onClick={handleShareWhatsApp}
                    className="w-full sm:w-auto px-6 py-3 rounded-[16px] clay-button text-xs font-bold text-[#594337] flex items-center justify-center space-x-2 border border-[#E9B95B]"
                  >
                    <Share2 className="w-4 h-4 text-[#E9B95B]" />
                    <span>Share on WhatsApp</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Full Size Modal Lightbox */}
        <AnimatePresence>
          {isViewModalOpen && downloadedCardUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsViewModalOpen(false)}
              className="fixed inset-0 z-50 bg-[#594337]/80 backdrop-blur-md flex items-center justify-center p-4 select-none"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="relative max-w-md w-full bg-[#FFFFFF] p-5 rounded-[28px] shadow-2xl text-center space-y-4"
              >
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full clay-button text-[#594337] hover:text-rose-600 shadow"
                >
                  <X className="w-5 h-5" />
                </button>

                <h4 className="text-base font-black text-[#594337]">
                  STAR School ID Card (Official Keepsake)
                </h4>

                <div className="rounded-2xl overflow-hidden shadow-inner max-h-[75vh] flex items-center justify-center bg-[#FFF5E8]">
                  <img
                    src={downloadedCardUrl}
                    alt="STAR School ID Card"
                    className="max-h-[70vh] w-auto object-contain rounded-xl"
                  />
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={handleDownloadPNG}
                    className="px-6 py-2.5 rounded-[16px] clay-button-gold text-xs font-black flex items-center space-x-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PNG</span>
                  </button>
                  <button
                    onClick={() => setIsViewModalOpen(false)}
                    className="px-5 py-2.5 rounded-[16px] clay-button text-xs font-bold text-[#927B6C]"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    );
};
