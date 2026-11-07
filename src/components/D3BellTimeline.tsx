import * as d3 from 'd3';
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Filter,
  Info,
  Maximize2,
  Play,
  RotateCcw,
  SkipForward,
  Sparkles,
  Volume2,
  XCircle,
  Zap,
} from 'lucide-react';
import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import {
  BellLog,
  HolidayItem,
  ScheduleCategory,
  ScheduleItem,
  SchoolSettings,
} from '../types';

export type TimelineEventStatus = 'completed' | 'next' | 'pending' | 'skipped';

export interface TimelineBellItem extends ScheduleItem {
  minutesOfDay: number; // e.g. 7 * 60 + 0 = 420
  status: TimelineEventStatus;
  statusReason?: string;
  isNext: boolean;
}

interface D3BellTimelineProps {
  todaySchedules: ScheduleItem[];
  currentTimeHHMMSS: string;
  nextBellItem: ScheduleItem | null;
  skipNextBell: boolean;
  currentHoliday: HolidayItem | null;
  isPaused: boolean;
  isActive: boolean;
  settings: SchoolSettings;
  logs?: BellLog[];
  getSoundName: (soundId: string) => string;
  onTriggerItem: (item: ScheduleItem) => void;
  onTriggerManualBell?: (soundId?: string, label?: string, category?: ScheduleCategory) => void;
}

// Category color mappings
const CATEGORY_COLORS: Record<ScheduleCategory, { stroke: string; fill: string; bg: string; text: string; label: string }> = {
  masuk: { stroke: '#10b981', fill: '#059669', bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Masuk' },
  upacara: { stroke: '#ef4444', fill: '#dc2626', bg: 'bg-rose-500/20', text: 'text-rose-400', label: 'Upacara' },
  pelajaran: { stroke: '#3b82f6', fill: '#2563eb', bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'Pelajaran' },
  istirahat: { stroke: '#f59e0b', fill: '#d97706', bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Istirahat' },
  sholat: { stroke: '#06b6d4', fill: '#0891b2', bg: 'bg-cyan-500/20', text: 'text-cyan-400', label: 'Ibadah' },
  pulang: { stroke: '#8b5cf6', fill: '#7c3aed', bg: 'bg-purple-500/20', text: 'text-purple-400', label: 'Pulang' },
  khusus: { stroke: '#ec4899', fill: '#db2777', bg: 'bg-pink-500/20', text: 'text-pink-400', label: 'Khusus' },
};

function parseTimeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':').map(Number);
  const h = parts[0] || 0;
  const m = parts[1] || 0;
  const s = parts[2] || 0;
  return h * 60 + m + s / 60;
}

function formatMinutesToHHMM(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60) % 24;
  const m = Math.floor(totalMinutes % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const D3BellTimeline: React.FC<D3BellTimelineProps> = ({
  todaySchedules,
  currentTimeHHMMSS,
  nextBellItem,
  skipNextBell,
  currentHoliday,
  isPaused,
  isActive,
  settings,
  logs = [],
  getSoundName,
  onTriggerItem,
  onTriggerManualBell,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const uniqueGradientId = useId().replace(/:/g, '');

  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending' | 'skipped'>('all');
  const [selectedItem, setSelectedItem] = useState<TimelineBellItem | null>(null);
  const [hoveredItem, setHoveredItem] = useState<TimelineBellItem | null>(null);
  const [viewWindow, setViewWindow] = useState<'day' | 'focused'>('day');

  // Parse current time
  const currentMinutes = useMemo(() => {
    return parseTimeToMinutes(currentTimeHHMMSS);
  }, [currentTimeHHMMSS]);

  // Compute enriched timeline items with status
  const timelineItems: TimelineBellItem[] = useMemo(() => {
    if (!todaySchedules || todaySchedules.length === 0) return [];

    return todaySchedules.map((item) => {
      const minutes = parseTimeToMinutes(item.time);
      const isNext = Boolean(nextBellItem && nextBellItem.id === item.id);

      let status: TimelineEventStatus = 'pending';
      let statusReason = '';

      if (!item.enabled) {
        status = 'skipped';
        statusReason = 'Jadwal Dinonaktifkan';
      } else if (currentHoliday) {
        status = 'skipped';
        statusReason = `Hari Libur: ${currentHoliday.name}`;
      } else if (isNext && skipNextBell) {
        status = 'skipped';
        statusReason = 'Dilewati oleh Operator';
      } else if (currentMinutes > minutes + 0.1) {
        // Bell has passed
        status = 'completed';
        statusReason = 'Telah Berbunyi';
      } else if (isNext) {
        status = 'next';
        statusReason = isPaused ? 'Tertunda (Sistem Di-jeda)' : 'Akan Berbunyi Berikutnya';
      } else {
        status = 'pending';
        statusReason = isPaused ? 'Menunggu (Sistem Di-jeda)' : 'Menunggu Giliran';
      }

      return {
        ...item,
        minutesOfDay: minutes,
        status,
        statusReason,
        isNext,
      };
    }).sort((a, b) => a.minutesOfDay - b.minutesOfDay);
  }, [todaySchedules, nextBellItem, skipNextBell, currentHoliday, isPaused, currentMinutes]);

  // Summary counts
  const summaryCounts = useMemo(() => {
    let completed = 0;
    let pending = 0;
    let skipped = 0;
    let nextCount = 0;

    timelineItems.forEach((item) => {
      if (item.status === 'completed') completed++;
      else if (item.status === 'skipped') skipped++;
      else if (item.status === 'next') {
        nextCount++;
        pending++;
      } else pending++;
    });

    return {
      total: timelineItems.length,
      completed,
      pending,
      skipped,
      nextCount,
    };
  }, [timelineItems]);

  // Determine time scale range
  const { minDomain, maxDomain } = useMemo(() => {
    if (timelineItems.length === 0) {
      return { minDomain: 6 * 60, maxDomain: 17 * 60 }; // 06:00 to 17:00
    }

    if (viewWindow === 'focused') {
      // Focused window around current time ± 90 minutes
      const focusMin = Math.max(0, currentMinutes - 75);
      const focusMax = Math.min(24 * 60, currentMinutes + 90);
      return { minDomain: focusMin, maxDomain: focusMax };
    }

    // Default: full school day (from earliest item - 30m to latest item + 30m, at least 06:30 - 16:30)
    const firstItemMin = timelineItems[0].minutesOfDay;
    const lastItemMin = timelineItems[timelineItems.length - 1].minutesOfDay;

    const min = Math.min(6.5 * 60, Math.floor((firstItemMin - 30) / 30) * 30);
    const max = Math.max(16.5 * 60, Math.ceil((lastItemMin + 30) / 30) * 30);
    return { minDomain: Math.max(0, min), maxDomain: Math.min(24 * 60, max) };
  }, [timelineItems, viewWindow, currentMinutes]);

  // D3 Render Effect
  useEffect(() => {
    const svgEl = svgRef.current;
    const container = containerRef.current;
    if (!svgEl || !container) return;

    const width = container.clientWidth || 900;
    const height = 280;
    const margin = { top: 40, right: 40, bottom: 50, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const axisY = innerHeight * 0.58; // baseline for the horizontal rail

    const svg = d3.select(svgEl);
    svg.selectAll('*').remove();

    svg
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('width', '100%')
      .attr('height', height);

    // Defs & Gradients
    const defs = svg.append('defs');

    // Glow filter for next bell
    const filter = defs.append('filter').attr('id', `glow-${uniqueGradientId}`).attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
    filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'coloredBlur');
    const feMerge = filter.append('feMerge');
    feMerge.append('feMergeNode').attr('in', 'coloredBlur');
    feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Progress bar linear gradient
    const progressGrad = defs.append('linearGradient')
      .attr('id', `progress-grad-${uniqueGradientId}`)
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '100%')
      .attr('y2', '0%');
    progressGrad.append('stop').attr('offset', '0%').attr('stop-color', '#10b981').attr('stop-opacity', 0.9);
    progressGrad.append('stop').attr('offset', '100%').attr('stop-color', '#3b82f6').attr('stop-opacity', 0.9);

    // Main drawing group
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale: minute of day -> pixel x
    const xScale = d3.scaleLinear()
      .domain([minDomain, maxDomain])
      .range([0, innerWidth])
      .clamp(true);

    // Background track rail
    g.append('rect')
      .attr('x', 0)
      .attr('y', axisY - 4)
      .attr('width', innerWidth)
      .attr('height', 8)
      .attr('rx', 4)
      .attr('fill', '#1e293b');

    // Elapsed track rail (from 0 to current time)
    const currentX = xScale(currentMinutes);
    if (currentX > 0) {
      g.append('rect')
        .attr('x', 0)
        .attr('y', axisY - 4)
        .attr('width', Math.min(innerWidth, currentX))
        .attr('height', 8)
        .attr('rx', 4)
        .attr('fill', `url(#progress-grad-${uniqueGradientId})`)
        .attr('opacity', 0.7);
    }

    // Time Axis Ticks (Every 30 or 60 mins depending on width)
    const stepMinutes = innerWidth < 600 ? 60 : 30;
    const tickValues: number[] = [];
    const firstTick = Math.ceil(minDomain / stepMinutes) * stepMinutes;
    for (let t = firstTick; t <= maxDomain; t += stepMinutes) {
      tickValues.push(t);
    }

    // Grid lines & axis labels
    const axisGroup = g.append('g').attr('class', 'axis-group');

    tickValues.forEach((tickMin) => {
      const tx = xScale(tickMin);
      const isHour = tickMin % 60 === 0;

      // Vertical subtle gridline
      axisGroup.append('line')
        .attr('x1', tx)
        .attr('y1', 10)
        .attr('x2', tx)
        .attr('y2', innerHeight + 15)
        .attr('stroke', isHour ? '#334155' : '#1e293b')
        .attr('stroke-width', isHour ? 1 : 0.8)
        .attr('stroke-dasharray', isHour ? 'none' : '2,3');

      // Tick mark on track
      axisGroup.append('line')
        .attr('x1', tx)
        .attr('y1', axisY - 6)
        .attr('x2', tx)
        .attr('y2', axisY + 6)
        .attr('stroke', isHour ? '#64748b' : '#475569')
        .attr('stroke-width', isHour ? 1.5 : 1);

      // Label
      if (isHour || innerWidth >= 700) {
        axisGroup.append('text')
          .attr('x', tx)
          .attr('y', innerHeight + 32)
          .attr('text-anchor', 'middle')
          .attr('font-size', isHour ? '11px' : '9.5px')
          .attr('font-family', 'ui-monospace, monospace')
          .attr('fill', isHour ? '#94a3b8' : '#64748b')
          .attr('font-weight', isHour ? '600' : '400')
          .text(formatMinutesToHHMM(tickMin));
      }
    });

    // Helper: Smart vertical staggering of bell node flags so consecutive nodes don't overlap
    // Alternating between Tier 0 (upper: -65px), Tier 1 (mid upper: -35px), Tier 2 (lower: +45px)
    const nodeCoords: Array<{
      item: TimelineBellItem;
      cx: number;
      stemEndY: number;
      pillY: number;
      isUpper: boolean;
    }> = [];

    let prevX = -999;
    let altIndex = 0;

    timelineItems.forEach((item, idx) => {
      const cx = xScale(item.minutesOfDay);
      const diffX = cx - prevX;

      // If items are closer than 45px, stagger them higher/lower
      if (diffX < 45) {
        altIndex = (altIndex + 1) % 3;
      } else {
        altIndex = idx % 2;
      }
      prevX = cx;

      let stemEndY: number;
      let isUpper = true;

      if (altIndex === 0) {
        stemEndY = axisY - 55;
        isUpper = true;
      } else if (altIndex === 1) {
        stemEndY = axisY - 28;
        isUpper = true;
      } else {
        stemEndY = axisY + 45;
        isUpper = false;
      }

      nodeCoords.push({
        item,
        cx,
        stemEndY,
        pillY: isUpper ? stemEndY - 14 : stemEndY + 14,
        isUpper,
      });
    });

    // Render Event Nodes
    const nodesGroup = g.append('g').attr('class', 'nodes-group');

    nodeCoords.forEach(({ item, cx, stemEndY, pillY, isUpper }) => {
      const isFilteredOut = filterStatus !== 'all' && (
        (filterStatus === 'completed' && item.status !== 'completed') ||
        (filterStatus === 'pending' && item.status !== 'pending' && item.status !== 'next') ||
        (filterStatus === 'skipped' && item.status !== 'skipped')
      );

      const isHovered = hoveredItem?.id === item.id;
      const isSelected = selectedItem?.id === item.id;
      const categoryColor = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.pelajaran;

      // Status Visual Tone
      let strokeColor = categoryColor.stroke;
      let nodeFill = '#0f172a';
      let strokeDash = 'none';
      let opacity = isFilteredOut ? 0.25 : 1;

      if (item.status === 'completed') {
        strokeColor = '#10b981';
        nodeFill = '#064e3b';
      } else if (item.status === 'skipped') {
        strokeColor = '#64748b';
        nodeFill = '#1e293b';
        strokeDash = '3,3';
      } else if (item.status === 'next') {
        strokeColor = '#f59e0b';
        nodeFill = '#78350f';
      }

      const itemG = nodesGroup.append('g')
        .attr('class', 'event-node')
        .attr('cursor', 'pointer')
        .attr('opacity', opacity)
        .on('click', () => {
          setSelectedItem(item);
        })
        .on('mouseenter', () => {
          setHoveredItem(item);
        })
        .on('mouseleave', () => {
          setHoveredItem((prev) => (prev?.id === item.id ? null : prev));
        });

      // Connecting Stem Line
      itemG.append('line')
        .attr('x1', cx)
        .attr('y1', axisY)
        .attr('x2', cx)
        .attr('y2', stemEndY)
        .attr('stroke', strokeColor)
        .attr('stroke-width', isHovered || isSelected || item.isNext ? 2.5 : 1.5)
        .attr('stroke-dasharray', strokeDash)
        .attr('opacity', 0.85);

      // On-rail small anchor dot
      itemG.append('circle')
        .attr('cx', cx)
        .attr('cy', axisY)
        .attr('r', item.isNext ? 5 : 3.5)
        .attr('fill', strokeColor)
        .attr('stroke', '#0f172a')
        .attr('stroke-width', 1.5);

      // If next bell: animated pulsing halo ring
      if (item.status === 'next' && !isFilteredOut) {
        const pulseRing = itemG.append('circle')
          .attr('cx', cx)
          .attr('cy', stemEndY)
          .attr('r', 16)
          .attr('fill', 'none')
          .attr('stroke', '#f59e0b')
          .attr('stroke-width', 2)
          .attr('opacity', 0.8)
          .attr('filter', `url(#glow-${uniqueGradientId})`);

        // Gentle CSS animation class applied
        pulseRing.attr('class', 'animate-ping');
      }

      // Main Node Circle
      const radius = item.isNext ? 14 : isHovered || isSelected ? 13 : 11;

      itemG.append('circle')
        .attr('cx', cx)
        .attr('cy', stemEndY)
        .attr('r', radius)
        .attr('fill', nodeFill)
        .attr('stroke', strokeColor)
        .attr('stroke-width', item.isNext ? 2.5 : 2)
        .attr('filter', item.isNext ? `url(#glow-${uniqueGradientId})` : undefined);

      // Node Inner Icon / Glyph
      if (item.status === 'completed') {
        // Checkmark symbol
        itemG.append('path')
          .attr('d', `M ${cx - 4} ${stemEndY} L ${cx - 1} ${stemEndY + 3} L ${cx + 4} ${stemEndY - 3}`)
          .attr('stroke', '#34d399')
          .attr('stroke-width', 1.8)
          .attr('fill', 'none')
          .attr('stroke-linecap', 'round')
          .attr('stroke-linejoin', 'round');
      } else if (item.status === 'skipped') {
        // Skip dash
        itemG.append('line')
          .attr('x1', cx - 3.5)
          .attr('y1', stemEndY)
          .attr('x2', cx + 3.5)
          .attr('y2', stemEndY)
          .attr('stroke', '#94a3b8')
          .attr('stroke-width', 1.8)
          .attr('stroke-linecap', 'round');
      } else if (item.status === 'next') {
        // Bell bell dot
        itemG.append('circle')
          .attr('cx', cx)
          .attr('cy', stemEndY)
          .attr('r', 4)
          .attr('fill', '#fde68a');
      } else {
        // Small pending center dot
        itemG.append('circle')
          .attr('cx', cx)
          .attr('cy', stemEndY)
          .attr('r', 3)
          .attr('fill', strokeColor);
      }

      // Time Text Label above or below node
      itemG.append('text')
        .attr('x', cx)
        .attr('y', isUpper ? stemEndY - 16 : stemEndY + 22)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-weight', item.isNext || isHovered ? '700' : '600')
        .attr('fill', item.isNext ? '#fbbf24' : item.status === 'completed' ? '#a7f3d0' : item.status === 'skipped' ? '#94a3b8' : '#e2e8f0')
        .text(item.time);
    });

    // Current Time Indicator (Glowing Vertical Rule + Badge)
    if (currentMinutes >= minDomain && currentMinutes <= maxDomain) {
      const nowG = g.append('g').attr('class', 'current-time-indicator').attr('pointer-events', 'none');

      // Vertical Red/Amber Line
      nowG.append('line')
        .attr('x1', currentX)
        .attr('y1', 5)
        .attr('x2', currentX)
        .attr('y2', innerHeight + 16)
        .attr('stroke', '#f43f5e')
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '3,3');

      // Center glowing marker on rail
      nowG.append('circle')
        .attr('cx', currentX)
        .attr('cy', axisY)
        .attr('r', 7)
        .attr('fill', '#f43f5e')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .attr('filter', `url(#glow-${uniqueGradientId})`);

      // Current Time Header Tag
      const badgeW = 68;
      const badgeH = 20;
      const badgeX = Math.max(0, Math.min(innerWidth - badgeW, currentX - badgeW / 2));

      nowG.append('rect')
        .attr('x', badgeX)
        .attr('y', 0)
        .attr('width', badgeW)
        .attr('height', badgeH)
        .attr('rx', 6)
        .attr('fill', '#f43f5e')
        .attr('stroke', '#fb7185')
        .attr('stroke-width', 1);

      nowG.append('text')
        .attr('x', badgeX + badgeW / 2)
        .attr('y', 13.5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '9.5px')
        .attr('font-family', 'ui-monospace, monospace')
        .attr('font-weight', '700')
        .attr('fill', '#ffffff')
        .text(currentTimeHHMMSS.slice(0, 5));
    }

  }, [
    timelineItems,
    currentMinutes,
    minDomain,
    maxDomain,
    filterStatus,
    hoveredItem,
    selectedItem,
    currentTimeHHMMSS,
    uniqueGradientId,
  ]);

  // Handle Resize smoothly
  useEffect(() => {
    const handleResize = () => {
      // Re-trigger render
      setHoveredItem((prev) => (prev ? { ...prev } : null));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 relative overflow-hidden">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-blue-400" />
            <h3 className="text-base sm:text-lg font-bold text-white">
              Visual Timeline Jadwal Bel Hari Ini
            </h3>
            <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-full">
              D3 Engine
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Garis waktu interaktif sepanjang hari sekolah dengan visualisasi status bel yang telah berbunyi, akan datang, maupun dilewati.
          </p>
        </div>

        {/* View Switcher & Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Zoom view modes */}
          <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setViewWindow('day')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                viewWindow === 'day'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Jam
            </button>
            <button
              onClick={() => setViewWindow('focused')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                viewWindow === 'focused'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Fokus ±75 menit dari waktu saat ini"
            >
              Fokus Waktu Ini
            </button>
          </div>

          {nextBellItem && (
            <button
              onClick={() => {
                const item = timelineItems.find((i) => i.id === nextBellItem.id);
                if (item) setSelectedItem(item);
              }}
              className="px-3 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span>Lihat Bel Berikut ({nextBellItem.time})</span>
            </button>
          )}
        </div>
      </div>

      {/* Summary KPI Counters & Filter Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl p-3">
        {/* Metric Badges */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Total:</span>
            <span className="font-bold font-mono text-white">{summaryCounts.total}</span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1.5 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Selesai:</span>
            <span className="font-bold font-mono text-emerald-300">{summaryCounts.completed}</span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1.5 text-blue-400">
            <Bell className="w-3.5 h-3.5 text-blue-400" />
            <span>Menunggu:</span>
            <span className="font-bold font-mono text-blue-300">{summaryCounts.pending}</span>
          </div>

          <span className="text-slate-700">|</span>

          <div className="flex items-center gap-1.5 text-slate-400">
            <SkipForward className="w-3.5 h-3.5 text-slate-400" />
            <span>Dilewati:</span>
            <span className="font-bold font-mono text-slate-300">{summaryCounts.skipped}</span>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1 text-xs">
          <span className="text-slate-500 text-[11px] mr-1 hidden sm:inline">Filter:</span>
          {(['all', 'completed', 'pending', 'skipped'] as const).map((mode) => {
            const labels = {
              all: 'Semua',
              completed: 'Selesai',
              pending: 'Menunggu',
              skipped: 'Dilewati',
            };
            const isActive = filterStatus === mode;
            return (
              <button
                key={mode}
                onClick={() => setFilterStatus(mode)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {labels[mode]}
              </button>
            );
          })}
        </div>
      </div>

      {/* D3 SVG Canvas Area */}
      <div
        ref={containerRef}
        className="w-full bg-slate-950 border border-slate-800/80 rounded-2xl p-2 relative overflow-x-auto select-none"
      >
        {timelineItems.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center text-slate-500 text-xs">
            <AlertCircle className="w-6 h-6 mb-1 text-slate-600" />
            <span>Tidak ada kegiatan bel yang terjadwal untuk hari ini.</span>
          </div>
        ) : (
          <svg
            ref={svgRef}
            className="w-full block"
            style={{ minWidth: viewWindow === 'focused' ? '500px' : '650px' }}
          />
        )}
      </div>

      {/* Legend & Instructions */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 pt-1">
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-400" />
            <span>Selesai (Sudah Berbunyi)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-400 animate-pulse" />
            <span>Berikutnya (Akan Datang)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-blue-400" />
            <span>Menunggu Giliran</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-600 border border-slate-500 border-dashed" />
            <span>Dilewati / Nonaktif</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Garis Merah: Waktu Sekarang ({currentTimeHHMMSS})</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-500">
          💡 Klik salah satu titik pada timeline untuk melihat detail & putar bel.
        </div>
      </div>

      {/* Selected Bell Modal / Inspector Drawer */}
      {selectedItem && (
        <div className="bg-slate-950 border border-blue-500/40 rounded-2xl p-4 sm:p-5 shadow-2xl animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shadow-md ${
                  selectedItem.status === 'completed'
                    ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                    : selectedItem.status === 'next'
                    ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40'
                    : selectedItem.status === 'skipped'
                    ? 'bg-slate-800 text-slate-400 border border-slate-700'
                    : 'bg-blue-600/30 text-blue-400 border border-blue-500/40'
                }`}
              >
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-white">{selectedItem.label}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    CATEGORY_COLORS[selectedItem.category]?.bg || 'bg-blue-500/20'
                  } ${CATEGORY_COLORS[selectedItem.category]?.text || 'text-blue-300'}`}>
                    {CATEGORY_COLORS[selectedItem.category]?.label || selectedItem.category}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                  <span className="font-mono-digital font-bold text-amber-400 text-sm">
                    {selectedItem.time}
                  </span>
                  <span>·</span>
                  <span className="text-slate-300">
                    Status: <strong className={
                      selectedItem.status === 'completed' ? 'text-emerald-400' :
                      selectedItem.status === 'next' ? 'text-amber-400' :
                      selectedItem.status === 'skipped' ? 'text-slate-400' : 'text-blue-400'
                    }>{selectedItem.statusReason}</strong>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onTriggerItem(selectedItem)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95 cursor-pointer"
                title="Putar bel kegiatan ini sekarang sebagai uji coba"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Bunyikan Sekarang</span>
              </button>

              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors cursor-pointer"
                title="Tutup inspeksi"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80">
              <div className="text-slate-400 text-[11px] mb-1 flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-blue-400" />
                <span>Suara Bel Terpilih:</span>
              </div>
              <div className="text-white font-semibold">{getSoundName(selectedItem.soundId)}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Durasi nada: {selectedItem.duration || 6} detik</div>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 sm:col-span-2">
              <div className="text-slate-400 text-[11px] mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Narasi 4 Bahasa Terprogram:</span>
              </div>
              <div className="space-y-1 text-slate-300 text-[11px]">
                {selectedItem.speechText && (
                  <div>🇮🇩 <span className="text-white">&ldquo;{selectedItem.speechText}&rdquo;</span></div>
                )}
                {selectedItem.speechTextEn && (
                  <div>🇬🇧 <span className="text-slate-300">&ldquo;{selectedItem.speechTextEn}&rdquo;</span></div>
                )}
                {selectedItem.speechTextAr && (
                  <div dir="rtl" className="text-right font-sans">🇸🇦 <span className="text-slate-300">&ldquo;{selectedItem.speechTextAr}&rdquo;</span></div>
                )}
                {selectedItem.speechTextZh && (
                  <div>🇨🇳 <span className="text-slate-300">&ldquo;{selectedItem.speechTextZh}&rdquo;</span></div>
                )}
                {!selectedItem.speechText && !selectedItem.speechTextEn && (
                  <span className="text-slate-500 italic">Hanya membunyikan nada lonceng (tanpa narasi suara).</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
