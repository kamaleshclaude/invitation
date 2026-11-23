import React, { useEffect, useState, useRef, useCallback } from 'react';

interface NodeConfig {
  id: string;
  stepNumber: string;
  label: string;
  detail: string;
  isFinalStar?: boolean;
}

const SECTION_NODES: NodeConfig[] = [
  {
    id: 'invitation-hero',
    stepNumber: '01',
    label: 'Invitation',
    detail: 'Opening Letter',
  },
  {
    id: 'countdown-hero',
    stepNumber: '02',
    label: 'Reunion Home',
    detail: 'Live Countdown',
  },
  {
    id: 'gallery',
    stepNumber: '03',
    label: 'School Memories',
    detail: 'Vault Gallery',
  },
  {
    id: 'registration',
    stepNumber: '04',
    label: 'Student RSVP',
    detail: 'Class Attendance',
  },
  {
    id: 'venue-voting',
    stepNumber: '05',
    label: 'Venue Voting',
    detail: 'Biryani Gardens vs Lounge',
  },
  {
    id: 'date-voting',
    stepNumber: '06',
    label: 'Date Voting',
    detail: '27 Dec vs 25 Dec',
  },
  {
    id: 'reunion-announcement',
    stepNumber: '07',
    label: 'Reunion Details',
    detail: 'Final Announcement',
    isFinalStar: true,
  },
];

interface MeasuredNode {
  config: NodeConfig;
  x: number;
  y: number;
  targetScrollY: number;
}

interface PathSegment {
  index: number;
  fromNode: MeasuredNode;
  toNode: MeasuredNode;
  pathD: string;
  totalLength: number;
  branchD: string;
}

export const BranchingNodeNetwork: React.FC = () => {
  const [docHeight, setDocHeight] = useState<number>(0);
  const [measuredNodes, setMeasuredNodes] = useState<MeasuredNode[]>([]);
  const [segments, setSegments] = useState<PathSegment[]>([]);
  const [segmentProgresses, setSegmentProgresses] = useState<number[]>([]);
  const [cometPos, setCometPos] = useState<{ x: number; y: number; visible: boolean } | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const pathRefs = useRef<(SVGPathElement | null)[]>([]);
  const animFrameRef = useRef<number | null>(null);
  const lastScrollYRef = useRef<number>(-1);

  // Measure section positions and generate smooth organic constellation curves
  const updateLayout = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const height = document.documentElement.scrollHeight || document.body.scrollHeight;
    setDocHeight(height);
    const mobile = width < 768;
    setIsMobile(mobile);

    // Calculate constellation rail X position
    // Placed gracefully along the left edge/margin so it never covers form fields or text
    const maxContentWidth = 1152;
    const sideMargin = Math.max(24, (width - maxContentWidth) / 2);
    const baseRailX = mobile ? 22 : Math.max(34, Math.min(110, sideMargin - 32));

    const newNodes: MeasuredNode[] = [];

    SECTION_NODES.forEach((cfg, idx) => {
      const el = document.getElementById(cfg.id);
      let y = 0;
      if (el) {
        const rect = el.getBoundingClientRect();
        const absoluteTop = rect.top + window.scrollY;

        if (cfg.id === 'invitation-hero') {
          // Invitation envelope center
          y = absoluteTop + Math.min(window.innerHeight * 0.42, rect.height * 0.22);
        } else {
          // Near section header
          y = absoluteTop + 85;
        }
      } else {
        // Fallback proportional spacing
        y = (idx + 1) * (height / (SECTION_NODES.length + 1));
      }

      // Gentle organic alternating X position to create a natural constellation feel
      const xOffset = mobile
        ? (idx % 2 === 0 ? 0 : 6)
        : (idx % 2 === 0 ? 0 : (idx % 3 === 0 ? 28 : 18));
      const x = baseRailX + xOffset;

      // Target scroll position where this node is comfortably in view
      const targetScrollY = Math.max(0, y - window.innerHeight * 0.55);

      newNodes.push({
        config: cfg,
        x,
        y,
        targetScrollY,
      });
    });

    setMeasuredNodes(newNodes);

    // Build curved pathway segments between nodes
    const newSegments: PathSegment[] = [];
    for (let i = 0; i < newNodes.length - 1; i++) {
      const from = newNodes[i];
      const to = newNodes[i + 1];

      const dy = to.y - from.y;
      const dx = to.x - from.x;
      const curveDir = i % 2 === 0 ? 1 : -1;
      const cpDist = mobile ? 18 : 36;

      const cp1x = from.x + dx * 0.2 + curveDir * cpDist;
      const cp1y = from.y + dy * 0.35;
      const cp2x = to.x - dx * 0.2 - curveDir * cpDist;
      const cp2y = from.y + dy * 0.72;

      const pathD = `M ${from.x} ${from.y} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${to.x} ${to.y}`;

      // Horizontal branch reaching into the section title
      const branchReach = mobile ? 22 : 48;
      const branchD = `M ${from.x} ${from.y} L ${from.x + branchReach} ${from.y}`;

      newSegments.push({
        index: i,
        fromNode: from,
        toNode: to,
        pathD,
        totalLength: 1000, // will be measured via ref
        branchD,
      });
    }

    setSegments(newSegments);
  }, []);

  // Recalculate lengths once path DOM nodes are mounted
  useEffect(() => {
    if (segments.length === 0) return;

    let updated = false;
    const updatedSegments = segments.map((seg, idx) => {
      const pathEl = pathRefs.current[idx];
      if (pathEl) {
        try {
          const len = pathEl.getTotalLength();
          if (Math.abs(len - seg.totalLength) > 1) {
            updated = true;
            return { ...seg, totalLength: len };
          }
        } catch {
          // ignore
        }
      }
      return seg;
    });

    if (updated) {
      setSegments(updatedSegments);
    }
  }, [segments]);

  // Recalculate on load, resize, and DOM changes
  useEffect(() => {
    updateLayout();

    const handleResize = () => {
      updateLayout();
    };

    window.addEventListener('resize', handleResize, { passive: true });

    // Observe body height changes (images loading, accordion expands, etc.)
    const resizeObserver = new ResizeObserver(() => {
      updateLayout();
    });
    if (document.body) {
      resizeObserver.observe(document.body);
    }

    // Delayed re-check after images and fonts settle
    const timer = setTimeout(updateLayout, 1200);

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [updateLayout]);

  // Precise scroll-synchronized progressive line drawing
  useEffect(() => {
    if (measuredNodes.length === 0 || segments.length === 0) return;

    const onScroll = () => {
      const scrollY = window.scrollY;
      if (Math.abs(scrollY - lastScrollYRef.current) < 0.5) return;
      lastScrollYRef.current = scrollY;

      const progresses: number[] = [];
      let activeComet: { x: number; y: number; visible: boolean } | null = null;

      segments.forEach((seg, i) => {
        const fromTarget = seg.fromNode.targetScrollY;
        const toTarget = seg.toNode.targetScrollY;

        let prog = 0;
        if (toTarget > fromTarget) {
          if (scrollY <= fromTarget) {
            prog = 0;
          } else if (scrollY >= toTarget) {
            prog = 1;
          } else {
            prog = (scrollY - fromTarget) / (toTarget - fromTarget);
          }
        } else {
          prog = scrollY >= fromTarget ? 1 : 0;
        }

        // Clamp between 0 and 1
        prog = Math.max(0, Math.min(1, prog));
        progresses.push(prog);

        // Find the single actively growing segment for the travelling spark/comet
        if (prog > 0.01 && prog < 0.99 && !activeComet) {
          const pathEl = pathRefs.current[i];
          if (pathEl) {
            try {
              const point = pathEl.getPointAtLength(seg.totalLength * prog);
              activeComet = { x: point.x, y: point.y, visible: true };
            } catch {
              // ignore
            }
          }
        }
      });

      setSegmentProgresses(progresses);
      setCometPos(activeComet);
    };

    const handleScrollThrottled = () => {
      if (animFrameRef.current !== null) return;
      animFrameRef.current = requestAnimationFrame(() => {
        onScroll();
        animFrameRef.current = null;
      });
    };

    window.addEventListener('scroll', handleScrollThrottled, { passive: true });
    // Initial calculation
    onScroll();

    return () => {
      window.removeEventListener('scroll', handleScrollThrottled);
      if (animFrameRef.current !== null) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [measuredNodes, segments]);

  const handleNodeClick = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  if (measuredNodes.length === 0) return null;

  return (
    <div
      className="absolute top-0 left-0 w-full pointer-events-none z-10 overflow-visible"
      style={{ height: docHeight || '100%' }}
      aria-hidden="true"
    >
      <svg
        className="absolute top-0 left-0 w-full h-full overflow-visible"
        style={{ height: docHeight || '100%' }}
      >
        <defs>
          {/* Luminous Warm Golden Gradient for constellation lines */}
          <linearGradient id="constellationGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="50%" stopColor="#E9B95B" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#F6C9A8" stopOpacity="0.9" />
          </linearGradient>

          {/* Golden Core Radial Glow for Nodes */}
          <radialGradient id="nodeActiveGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="40%" stopColor="#E9B95B" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#E9B95B" stopOpacity="0" />
          </radialGradient>

          {/* Soft Bloom Filter */}
          <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Intense Bloom Filter for Active Node & Comet */}
          <filter id="intenseGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5.5" result="blur1" />
            <feGaussianBlur stdDeviation="2" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Star Shape for Grand Finale Node 07 */}
          <polygon
            id="starShape"
            points="0,-10 3,-3 10,-3 4.5,1.5 6.5,8 0,4 -6.5,8 -4.5,1.5 -10,-3 -3,-3"
          />
        </defs>

        {/* 1. FAINT BLUEPRINT BACKGROUND PATHWAY (Subtle guide lines) */}
        {segments.map((seg, i) => (
          <path
            key={`blueprint-${i}`}
            d={seg.pathD}
            fill="none"
            stroke="rgba(233, 185, 91, 0.16)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="transition-opacity duration-500"
          />
        ))}

        {/* 2. PROGRESSIVE CONNECTED CONSTELLATION PATHWAYS (Drawn precisely by scroll) */}
        {segments.map((seg, i) => {
          const prog = segmentProgresses[i] || 0;
          const strokeDashoffset = seg.totalLength * (1 - prog);

          return (
            <g key={`segment-${i}`}>
              {/* Outer soft glow line */}
              <path
                d={seg.pathD}
                fill="none"
                stroke="#E9B95B"
                strokeWidth="4"
                strokeOpacity={prog > 0.01 ? 0.35 : 0}
                strokeDasharray={seg.totalLength}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                filter="url(#softGlow)"
              />

              {/* Main sharp illuminated golden-white line */}
              <path
                ref={(el) => (pathRefs.current[i] = el)}
                d={seg.pathD}
                fill="none"
                stroke="url(#constellationGradient)"
                strokeWidth="2.5"
                strokeOpacity={prog > 0.01 ? 0.95 : 0}
                strokeDasharray={seg.totalLength}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />

              {/* Horizontal branch toward section title */}
              <path
                d={seg.branchD}
                fill="none"
                stroke="#E9B95B"
                strokeWidth="1.5"
                strokeOpacity={prog > 0.1 ? 0.6 : 0.15}
                strokeDasharray="2 3"
              />
            </g>
          );
        })}

        {/* 3. CINEMATIC TRAVELLING COMET / SPARK PARTICLE (Moves along the active branch) */}
        {cometPos && cometPos.visible && (
          <g transform={`translate(${cometPos.x}, ${cometPos.y})`}>
            {/* Comet outer halo */}
            <circle
              r="12"
              fill="rgba(233, 185, 91, 0.4)"
              filter="url(#intenseGlow)"
            />
            {/* Comet bright core */}
            <circle
              r="4"
              fill="#FFFFFF"
              stroke="#E9B95B"
              strokeWidth="1.5"
              filter="url(#softGlow)"
            />
          </g>
        )}

        {/* 4. CONSTELLATION NODES (Representing each website section) */}
        {measuredNodes.map((node, idx) => {
          // Node is active if its section is the latest reached
          // Node 0 is always active if user scrolled at all
          const isVisited =
            idx === 0
              ? true
              : (segmentProgresses[idx - 1] || 0) >= 0.95;

          const isCurrentlyActive =
            idx === 0
              ? (segmentProgresses[0] || 0) < 0.95
              : isVisited && (idx === measuredNodes.length - 1 || (segmentProgresses[idx] || 0) < 0.95);

          return (
            <g
              key={`node-${node.config.id}`}
              transform={`translate(${node.x}, ${node.y})`}
              className="transition-all duration-300"
            >
              {/* Special Node 07: Glowing Grand Reunion Star */}
              {node.config.isFinalStar ? (
                <g>
                  {/* Star Outer Bloom */}
                  <circle
                    r={isVisited ? 24 : 12}
                    fill={isVisited ? 'rgba(233, 185, 91, 0.35)' : 'rgba(233, 185, 91, 0.1)'}
                    filter="url(#intenseGlow)"
                    className={isCurrentlyActive ? 'animate-pulse' : ''}
                  />
                  {/* Outer Pulsing Star Ring */}
                  {isCurrentlyActive && (
                    <circle
                      r="18"
                      fill="none"
                      stroke="#E9B95B"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      className="animate-spin"
                      style={{ transformOrigin: 'center', animationDuration: '8s' }}
                    />
                  )}
                  {/* Star Shape */}
                  <use
                    href="#starShape"
                    transform={isVisited ? 'scale(1.3)' : 'scale(0.9)'}
                    fill={isVisited ? '#FFFFFF' : 'rgba(240, 225, 206, 0.7)'}
                    stroke="#E9B95B"
                    strokeWidth="1.5"
                    filter={isVisited ? 'url(#intenseGlow)' : undefined}
                  />
                </g>
              ) : (
                /* Standard Section Nodes (01 to 06) */
                <g>
                  {/* Outer Glowing Halo */}
                  <circle
                    r={isCurrentlyActive ? 20 : isVisited ? 14 : 7}
                    fill={
                      isCurrentlyActive
                        ? 'rgba(233, 185, 91, 0.32)'
                        : isVisited
                        ? 'rgba(233, 185, 91, 0.18)'
                        : 'rgba(240, 225, 206, 0.12)'
                    }
                    filter={isVisited ? 'url(#softGlow)' : undefined}
                  />

                  {/* Pulsing ring for the currently active node */}
                  {isCurrentlyActive && (
                    <circle
                      r="13"
                      fill="none"
                      stroke="#E9B95B"
                      strokeWidth="1.5"
                      strokeOpacity="0.8"
                      className="animate-ping"
                      style={{ transformOrigin: 'center', animationDuration: '2.5s' }}
                    />
                  )}

                  {/* Middle Ring */}
                  <circle
                    r={isCurrentlyActive ? 8.5 : isVisited ? 6.5 : 4.5}
                    fill={isCurrentlyActive ? '#FFFFFF' : isVisited ? '#594337' : '#F0E1CE'}
                    stroke="#E9B95B"
                    strokeWidth={isCurrentlyActive ? 2.5 : isVisited ? 2 : 1.2}
                    filter={isCurrentlyActive ? 'url(#softGlow)' : undefined}
                  />

                  {/* Inner Bright Center Core */}
                  <circle
                    r={isCurrentlyActive ? 4.5 : isVisited ? 3 : 2}
                    fill={isCurrentlyActive ? '#594337' : isVisited ? '#FFF5E8' : '#FFFFFF'}
                  />
                </g>
              )}

              {/* Node Topic Badge / Label (Interactive on desktop and tablet) */}
              {!isMobile && (
                <g
                  transform="translate(18, -12)"
                  className="pointer-events-auto cursor-pointer select-none group"
                  onClick={() => handleNodeClick(node.config.id)}
                >
                  {/* Badge Background Pill */}
                  <rect
                    x="0"
                    y="0"
                    width={node.config.isFinalStar ? 135 : 120}
                    height="25"
                    rx="12.5"
                    fill={isCurrentlyActive ? '#594337' : isVisited ? '#FFFFFF' : 'rgba(255, 245, 232, 0.85)'}
                    stroke={isCurrentlyActive ? '#E9B95B' : isVisited ? '#E9B95B' : '#F0E1CE'}
                    strokeWidth={isCurrentlyActive ? '1.5' : '1'}
                    className="shadow-sm transition-all duration-300 group-hover:scale-105"
                  />

                  {/* Topic Step & Title */}
                  <text
                    x="10"
                    y="16"
                    fontSize="10"
                    fontWeight="800"
                    fontFamily="system-ui, -apple-system, sans-serif"
                    fill={isCurrentlyActive ? '#FFF5E8' : isVisited ? '#594337' : '#927B6C'}
                    letterSpacing="0.03em"
                  >
                    {node.config.stepNumber} • {node.config.label}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
