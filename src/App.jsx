import { useState, useEffect, useRef, useCallback } from "react";

// ── Font injection ────────────────────────────────────────────────────────────
const injectFonts = () => {
  if (document.getElementById("zing-bb-fonts")) return;
  const l = document.createElement("link");
  l.id = "zing-bb-fonts";
  l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap";
  document.head.appendChild(l);
};

// ── Data ──────────────────────────────────────────────────────────────────────
const TASKS = {
  quick: [
    { id: 1,  name: "Bathroom Refresh",      time: "15 min", popular: true  },
    { id: 2,  name: "Floors Reset",          time: "20 min"                 },
    { id: 3,  name: "Vacuum + Rugs",         time: "20 min", popular: true  },
    { id: 4,  name: "Kitchen Reset",         time: "15 min"                 },
    { id: 5,  name: "Countertops + Sink",    time: "10 min"                 },
    { id: 6,  name: "Laundry Fold",          time: "20 min"                 },
    { id: 7,  name: "Bed Make + Tidy",       time: "10 min", popular: true  },
    { id: 8,  name: "Trash + Recycling",     time: "5 min"                  },
    { id: 9,  name: "Mirror + Glass",        time: "10 min"                 },
    { id: 10, name: "Entryway Reset",        time: "10 min"                 },
  ],
  full: [
    { id: 11, name: "Full Bathroom Clean",   time: "45 min", popular: true  },
    { id: 12, name: "Full Kitchen Clean",    time: "45 min"                 },
    { id: 13, name: "Surface Dusting",       time: "30 min"                 },
    { id: 14, name: "Bedroom Refresh",       time: "30 min"                 },
    { id: 15, name: "Living Room Reset",     time: "35 min"                 },
    { id: 16, name: "Linen Change",          time: "20 min"                 },
    { id: 17, name: "Balcony Sweep",         time: "15 min"                 },
  ],
  bundles: [
    { id: 18, name: "Studio Refresh",        time: "1.5 hrs", popular: true },
    { id: 19, name: "1 Bed Clean",           time: "2 hrs"                  },
    { id: 20, name: "2 Bed Clean",           time: "3 hrs",  popular: true  },
    { id: 21, name: "Move-In Reset",         time: "3.5 hrs"                },
    { id: 22, name: "Guest-Ready Reset",     time: "2 hrs"                  },
    { id: 23, name: "Weekly Home Reset",     time: "2 hrs",  popular: true  },
  ],
};

const LOTTERY_NAMES = [
  "Sarah","Jordan","Mia","Alex","Priya",
  "Ben","Chloe","Marcus","Nina","Daniel",
  "Olivia","Sam","Lauren","Ethan",
];

// Blackbird-style "card" colors — each task type gets a distinct card feel
const CARD_PALETTES = [
  { bg: "#1a1a1a", text: "#ffffff", accent: "#6ee7b7" },
  { bg: "#f5f0e8", text: "#111111", accent: "#111111" },
  { bg: "#dde8e0", text: "#1a3028", accent: "#1a3028" },
  { bg: "#e8e0d5", text: "#2a1f14", accent: "#2a1f14" },
  { bg: "#111111", text: "#ffffff", accent: "#a3e635" },
  { bg: "#e5e5e5", text: "#111111", accent: "#111111" },
];

// ── Countdown hook ────────────────────────────────────────────────────────────
const useCountdown = (initial) => {
  const [s, setS] = useState(initial);
  useEffect(() => {
    const t = setInterval(() => setS(p => Math.max(0, p - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  return `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;
};

// ── Wheel canvas ──────────────────────────────────────────────────────────────
const WHEEL_COLORS = [
  "#111","#e5e5e5","#2a2a2a","#d0d0d0",
  "#1a1a1a","#c8c8c8","#333","#bababa",
  "#222","#e0e0e0","#3a3a3a","#d8d8d8",
  "#0d0d0d","#cfcfcf",
];

const SpinWheel = ({ names }) => {
  const canvasRef = useRef(null);
  const rotRef = useRef(0);
  const rafRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const size = canvas.width;
    const cx = size / 2, cy = size / 2, r = size / 2 - 6;
    const n = names.length;
    const slice = (2 * Math.PI) / n;

    ctx.clearRect(0, 0, size, size);

    names.forEach((name, i) => {
      const start = rotRef.current + i * slice;
      const end = start + slice;
      const isLight = i % 2 === 1;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, start, end);
      ctx.closePath();
      ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
      ctx.fill();

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(start + slice / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = isLight ? "#111" : "#fff";
      ctx.font = `600 10.5px Inter, sans-serif`;
      ctx.letterSpacing = "0.02em";
      ctx.fillText(name.toUpperCase(), r - 10, 4);
      ctx.restore();
    });

    // Outer ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 3;
    ctx.stroke();

    // Center disc
    ctx.beginPath();
    ctx.arc(cx, cy, 26, 0, 2 * Math.PI);
    ctx.fillStyle = "#111";
    ctx.fill();

    // Z mark
    ctx.fillStyle = "#fff";
    ctx.font = `800 16px Inter, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Z", cx, cy + 1);
  }, [names]);

  useEffect(() => {
    const animate = () => {
      rotRef.current += 0.003;
      draw();
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [draw]);

  return <canvas ref={canvasRef} width={270} height={270} style={{ display: "block" }} />;
};

// ── Styles ────────────────────────────────────────────────────────────────────
const Styles = () => (
  <style>{`
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }

    body { background: #e8e8e8; font-family: 'Inter', -apple-system, sans-serif; }

    .z-root {
      max-width: 390px; min-height: 100svh;
      margin: 0 auto;
      background: #f0efed;
      position: relative;
      display: flex; flex-direction: column;
      overflow: hidden;
    }

    .z-scroll {
      flex: 1; overflow-y: auto;
      padding-bottom: 88px;
    }

    /* ── TAB BAR ── */
    .z-tabbar {
      position: fixed; bottom: 0; left: 50%; transform: translateX(-50%);
      width: 100%; max-width: 390px;
      background: rgba(240,239,237,0.94);
      backdrop-filter: blur(20px);
      border-top: 1px solid rgba(0,0,0,0.08);
      display: flex; align-items: center;
      padding: 10px 0 24px;
      z-index: 100;
    }
    .z-tab {
      flex: 1; display: flex; flex-direction: column; align-items: center;
      gap: 4px; cursor: pointer; padding: 4px 0;
      transition: opacity 0.15s;
    }
    .z-tab:active { opacity: 0.6; }
    .z-tab-label {
      font-size: 10px; font-weight: 600;
      letter-spacing: 0.04em;
      color: #999;
      text-transform: uppercase;
      transition: color 0.15s;
    }
    .z-tab.active .z-tab-label { color: #111; }
    .z-tab-center {
      width: 52px; height: 52px; border-radius: 50%;
      background: #111;
      display: flex; align-items: center; justify-content: center;
      margin-top: -14px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.25);
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
      flex-shrink: 0;
    }
    .z-tab-center:active { transform: scale(0.93); }

    /* ── HOME HEADER ── */
    .z-home-top {
      display: flex; align-items: center; justify-content: space-between;
      padding: 56px 20px 0;
    }
    .z-avatar {
      width: 40px; height: 40px; border-radius: 50%;
      background: #d0d0d0;
      display: flex; align-items: center; justify-content: center;
      font-size: 14px; font-weight: 700; color: #555;
      cursor: pointer;
    }
    .z-notif {
      width: 40px; height: 40px; border-radius: 50%;
      background: #e8e8e6;
      display: flex; align-items: center; justify-content: center;
      cursor: pointer;
    }

    .z-metric {
      text-align: center; padding: 28px 20px 8px;
    }
    .z-metric-num {
      font-size: 72px; font-weight: 800; letter-spacing: -0.04em;
      color: #111; line-height: 1;
    }
    .z-metric-label {
      font-size: 11px; font-weight: 600; letter-spacing: 0.1em;
      text-transform: uppercase; color: #999; margin-top: 6px;
    }
    .z-metric-badge {
      display: inline-flex; align-items: center; gap: 5px;
      background: #e5e5e5; border-radius: 999px;
      padding: 5px 12px; margin-top: 10px;
      font-size: 12px; font-weight: 600; color: #555;
    }
    .z-metric-badge-dot {
      width: 6px; height: 6px; border-radius: 50%;
      background: #111;
    }

    /* ── CARDS ── */
    .z-card {
      margin: 0 16px 12px;
      background: #e8e8e6;
      border-radius: 20px;
      overflow: hidden;
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .z-card:active { transform: scale(0.985); }

    .z-progress-card {
      margin: 16px 16px 12px;
      background: #e8e8e6;
      border-radius: 20px;
      padding: 18px 20px;
    }
    .z-progress-title {
      font-size: 15px; font-weight: 700; color: #111;
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 16px;
    }
    .z-progress-rows { display: flex; gap: 20px; }
    .z-progress-item { display: flex; align-items: center; gap: 12px; }
    .z-ring-wrap { position: relative; width: 44px; height: 44px; flex-shrink: 0; }
    .z-ring-label {
      font-size: 13px; font-weight: 700; color: #111;
    }
    .z-ring-sub { font-size: 11px; color: #999; margin-top: 2px; font-weight: 500; }

    /* ── SEG CONTROL ── */
    .z-seg {
      display: flex; margin: 4px 16px 12px;
      background: #e2e2e0; border-radius: 12px; padding: 3px;
    }
    .z-seg-btn {
      flex: 1; padding: 9px 4px;
      border: none; background: transparent; border-radius: 10px;
      font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600;
      color: #999; cursor: pointer; letter-spacing: 0.01em;
      transition: all 0.18s ease;
    }
    .z-seg-btn.active {
      background: #111; color: #fff;
    }

    /* ── TASK LIST ── */
    .z-task-list { padding: 0 16px; display: flex; flex-direction: column; gap: 2px; }
    .z-task-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 16px 18px;
      background: #e8e8e6; border-radius: 14px;
      cursor: pointer;
      transition: all 0.18s ease;
      border: 1.5px solid transparent;
    }
    .z-task-row:active { transform: scale(0.985); }
    .z-task-row.selected {
      background: #111; border-color: #111;
    }
    .z-task-row-left { display: flex; align-items: center; gap: 14px; }
    .z-task-row-check {
      width: 22px; height: 22px; border-radius: 50%;
      border: 1.5px solid #ccc;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.18s cubic-bezier(0.34,1.56,0.64,1);
      flex-shrink: 0;
    }
    .z-task-row.selected .z-task-row-check {
      background: #fff; border-color: #fff;
    }
    .z-task-name {
      font-size: 14px; font-weight: 600; color: #111;
      transition: color 0.15s;
    }
    .z-task-row.selected .z-task-name { color: #fff; }
    .z-task-right { display: flex; align-items: center; gap: 8px; }
    .z-task-time {
      font-size: 11px; font-weight: 600; letter-spacing: 0.04em;
      text-transform: uppercase; color: #999;
      transition: color 0.15s;
    }
    .z-task-row.selected .z-task-time { color: rgba(255,255,255,0.5); }
    .z-popular {
      font-size: 9px; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase;
      background: #111; color: #fff;
      padding: 3px 7px; border-radius: 999px;
    }
    .z-task-row.selected .z-popular { background: #fff; color: #111; }

    /* ── CTA BAR ── */
    .z-cta {
      margin: 16px 16px 0;
      background: #111; border-radius: 999px;
      padding: 18px 28px;
      display: flex; align-items: center; justify-content: space-between;
      cursor: pointer;
      transition: opacity 0.15s;
    }
    .z-cta:active { opacity: 0.85; }
    .z-cta-left { display: flex; flex-direction: column; }
    .z-cta-title { font-size: 16px; font-weight: 700; color: #fff; }
    .z-cta-sub { font-size: 12px; color: rgba(255,255,255,0.5); margin-top: 2px; }
    .z-cta-arrow {
      width: 36px; height: 36px; border-radius: 50%;
      background: rgba(255,255,255,0.12);
      display: flex; align-items: center; justify-content: center;
    }

    /* ── LOTTERY ── */
    .z-lottery-top {
      padding: 56px 20px 24px;
      background: #111;
    }
    .z-lottery-eyebrow {
      font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
      text-transform: uppercase; color: rgba(255,255,255,0.4);
      margin-bottom: 8px;
    }
    .z-lottery-title {
      font-size: 40px; font-weight: 800; letter-spacing: -0.03em;
      color: #fff; line-height: 1.05; margin-bottom: 10px;
    }
    .z-lottery-desc {
      font-size: 14px; color: rgba(255,255,255,0.55);
      line-height: 1.6; max-width: 300px;
    }
    .z-lottery-body {
      background: #f0efed; border-radius: 24px 24px 0 0;
      margin-top: -1px; min-height: 100%;
    }

    .z-countdown-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 20px 20px 0;
    }
    .z-countdown-label {
      font-size: 11px; font-weight: 700; letter-spacing: 0.1em;
      text-transform: uppercase; color: #999;
    }
    .z-countdown-num {
      font-size: 32px; font-weight: 800; letter-spacing: -0.03em; color: #111;
    }

    .z-wheel-area {
      display: flex; flex-direction: column; align-items: center;
      padding: 16px 0 8px; position: relative;
    }
    .z-wheel-pointer {
      position: absolute; top: 8px; left: 50%;
      transform: translateX(-50%);
      width: 0; height: 0;
      border-left: 8px solid transparent;
      border-right: 8px solid transparent;
      border-top: 16px solid #111;
    }
    .z-entrants {
      font-size: 11px; font-weight: 700; letter-spacing: 0.08em;
      text-transform: uppercase; color: #999;
      text-align: center; margin-bottom: 16px;
    }

    .z-enter-card {
      margin: 0 16px 16px;
      background: #e8e8e6;
      border-radius: 20px; padding: 20px;
    }
    .z-enter-card-title {
      font-size: 16px; font-weight: 700; color: #111; margin-bottom: 4px;
    }
    .z-enter-card-sub {
      font-size: 13px; color: #888; line-height: 1.5; margin-bottom: 14px;
    }
    .z-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; }
    .z-chip {
      font-size: 11px; font-weight: 700; letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 5px 11px; border-radius: 999px;
      background: #111; color: #fff;
    }
    .z-input {
      width: 100%; padding: 14px 16px;
      background: #fff; border: 1.5px solid #ddd;
      border-radius: 12px;
      font-family: 'Inter', sans-serif; font-size: 15px; color: #111;
      outline: none; margin-bottom: 10px;
      transition: border-color 0.15s;
    }
    .z-input:focus { border-color: #111; }
    .z-pill-btn {
      width: 100%; padding: 16px;
      background: #111; color: #fff;
      border: none; border-radius: 999px;
      font-family: 'Inter', sans-serif; font-size: 15px; font-weight: 700;
      cursor: pointer; letter-spacing: 0.01em;
      transition: opacity 0.15s;
    }
    .z-pill-btn:active { opacity: 0.8; }
    .z-pill-btn:disabled { background: #ccc; cursor: default; }
    .z-pill-btn.outline {
      background: transparent; border: 1.5px solid #ddd; color: #111;
    }
    .z-entered-row {
      display: flex; align-items: center; gap: 10px;
      padding: 14px 16px; background: #111; border-radius: 12px;
    }
    .z-entered-dot { width: 8px; height: 8px; border-radius: 50%; background: #6ee7b7; flex-shrink: 0; }
    .z-entered-text { font-size: 14px; font-weight: 600; color: #fff; }

    /* ── PROFILE ── */
    .z-profile-top {
      padding: 56px 20px 28px;
      display: flex; flex-direction: column; align-items: center;
      background: #f0efed;
    }
    .z-profile-avatar {
      width: 80px; height: 80px; border-radius: 50%;
      background: #d5d5d3;
      display: flex; align-items: center; justify-content: center;
      font-size: 28px; font-weight: 800; color: #888;
      margin-bottom: 14px;
    }
    .z-profile-name {
      font-size: 26px; font-weight: 800; letter-spacing: -0.02em;
      color: #111; margin-bottom: 4px;
    }
    .z-profile-unit {
      font-size: 12px; font-weight: 600; letter-spacing: 0.06em;
      text-transform: uppercase; color: #999;
    }

    .z-section-label {
      font-size: 10px; font-weight: 700; letter-spacing: 0.12em;
      text-transform: uppercase; color: #999;
      padding: 20px 20px 8px;
    }
    .z-list-card {
      margin: 0 16px; background: #e8e8e6; border-radius: 20px; overflow: hidden;
      margin-bottom: 2px;
    }
    .z-list-row {
      display: flex; align-items: center; padding: 15px 18px;
      border-bottom: 1px solid rgba(0,0,0,0.05); gap: 14px;
    }
    .z-list-row:last-child { border-bottom: none; }
    .z-row-icon {
      width: 32px; height: 32px; border-radius: 8px;
      background: #d5d5d3;
      display: flex; align-items: center; justify-content: center;
      font-size: 15px; flex-shrink: 0;
    }
    .z-row-body { flex: 1; }
    .z-row-label { font-size: 11px; color: #999; font-weight: 500; margin-bottom: 1px; }
    .z-row-value { font-size: 14px; font-weight: 600; color: #111; }
    .z-row-end { font-size: 18px; color: #ccc; }

    /* Toggle */
    .z-toggle {
      width: 46px; height: 26px; border-radius: 999px;
      background: #111; position: relative; cursor: pointer;
      transition: background 0.2s;
    }
    .z-toggle.off { background: #d0d0d0; }
    .z-toggle-dot {
      position: absolute; top: 3px; right: 3px;
      width: 20px; height: 20px; border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.2);
      transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
    }
    .z-toggle.off .z-toggle-dot { transform: translateX(-20px); }

    /* History */
    .z-hist-row {
      display: flex; align-items: center; gap: 14px;
      padding: 14px 18px; border-bottom: 1px solid rgba(0,0,0,0.05);
    }
    .z-hist-row:last-child { border-bottom: none; }
    .z-hist-art {
      width: 44px; height: 44px; border-radius: 10px;
      background: #d0d0d0; flex-shrink: 0;
      display: flex; align-items: center; justify-content: center;
      font-size: 18px;
    }
    .z-hist-info { flex: 1; }
    .z-hist-name { font-size: 13px; font-weight: 700; color: #111; }
    .z-hist-meta { font-size: 11px; color: #999; margin-top: 2px; }
    .z-hist-right { text-align: right; }
    .z-hist-badge {
      font-size: 10px; font-weight: 700; letter-spacing: 0.05em;
      text-transform: uppercase;
      padding: 3px 9px; border-radius: 999px;
      background: #111; color: #fff;
    }

    /* animations */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .fu  { animation: fadeUp 0.4s cubic-bezier(0.22,1,0.36,1) both; }
    .fu1 { animation-delay: 0.04s; }
    .fu2 { animation-delay: 0.09s; }
    .fu3 { animation-delay: 0.14s; }
    .fu4 { animation-delay: 0.19s; }
    .fu5 { animation-delay: 0.24s; }
    .page { animation: fadeUp 0.3s cubic-bezier(0.22,1,0.36,1) both; }
  `}</style>
);

// ── Ring SVG ──────────────────────────────────────────────────────────────────
const Ring = ({ pct, size = 44 }) => {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#d5d5d3" strokeWidth="3.5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#111" strokeWidth="3.5"
        strokeDasharray={`${circ * pct} ${circ}`} strokeLinecap="round" />
    </svg>
  );
};

// ── Toggle ────────────────────────────────────────────────────────────────────
const Toggle = ({ def = true }) => {
  const [on, setOn] = useState(def);
  return <div className={`z-toggle${on ? "" : " off"}`} onClick={() => setOn(!on)}><div className="z-toggle-dot" /></div>;
};

// ── Home Tab ──────────────────────────────────────────────────────────────────
const HomeTab = ({ setTab }) => {
  const [seg, setSeg] = useState("quick");
  const [selected, setSelected] = useState(new Set());
  const toggle = (id) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const data = TASKS[seg];

  return (
    <div className="page">
      {/* Top row */}
      <div className="z-home-top">
        <div className="z-avatar">J</div>
        <div className="z-notif">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </div>
      </div>

      {/* Metric */}
      <div className="z-metric fu fu1">
        <div className="z-metric-num">0</div>
        <div className="z-metric-label">Cleans Booked</div>
        <div className="z-metric-badge">
          <div className="z-metric-badge-dot" />
          Book your first clean
        </div>
      </div>

      {/* Progress card */}
      <div className="z-progress-card fu fu2">
        <div className="z-progress-title">
          <span>Member Progress</span>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
        </div>
        <div className="z-progress-rows">
          <div className="z-progress-item">
            <div className="z-ring-wrap"><Ring pct={0.4} /></div>
            <div>
              <div className="z-ring-label">2 / 5</div>
              <div className="z-ring-sub">Cleans</div>
            </div>
          </div>
          <div className="z-progress-item">
            <div className="z-ring-wrap"><Ring pct={0.15} /></div>
            <div>
              <div className="z-ring-label">1 / 7</div>
              <div className="z-ring-sub">This month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lottery nudge card */}
      <div className="z-card fu fu3" onClick={() => setTab("lottery")}
        style={{ background: "#111", padding: "20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>Live Now</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>Cleaning Lottery</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>A free hour just opened up. Enter →</div>
        </div>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "rgba(255,255,255,0.1)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24
        }}>🎰</div>
      </div>

      {/* Seg control */}
      <div className="z-seg fu fu4">
        {[["quick","Quick"],["full","Full Cleans"],["bundles","Bundles"]].map(([k,l]) => (
          <button key={k} className={`z-seg-btn${seg===k?" active":""}`} onClick={() => setSeg(k)}>{l}</button>
        ))}
      </div>

      {/* Task list */}
      <div className="z-task-list fu fu5">
        {data.map(t => (
          <div key={t.id} className={`z-task-row${selected.has(t.id)?" selected":""}`} onClick={() => toggle(t.id)}>
            <div className="z-task-row-left">
              <div className="z-task-row-check">
                {selected.has(t.id) && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l2.5 2.5L9 1" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="z-task-name">{t.name}</div>
            </div>
            <div className="z-task-right">
              {t.popular && <span className="z-popular">Popular</span>}
              <span className="z-task-time">{t.time}</span>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      {selected.size > 0 && (
        <div className="z-cta fu" onClick={() => alert(`Booked ${selected.size} task${selected.size>1?"s":""}. Nice.`)}>
          <div className="z-cta-left">
            <div className="z-cta-title">Book {selected.size} task{selected.size>1?"s":""}</div>
            <div className="z-cta-sub">Tap to schedule</div>
          </div>
          <div className="z-cta-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </div>
        </div>
      )}

      <div style={{ height: 8 }} />
    </div>
  );
};

// ── Lottery Tab ───────────────────────────────────────────────────────────────
const LotteryTab = () => {
  const [names, setNames] = useState([...LOTTERY_NAMES]);
  const [input, setInput] = useState("");
  const [entered, setEntered] = useState(false);
  const [myName, setMyName] = useState("");
  const cd = useCountdown(8 * 60 + 42);

  const handleEnter = () => {
    const n = input.trim();
    if (!n) return;
    setNames(p => [...p, n]);
    setMyName(n);
    setEntered(true);
    setInput("");
  };

  return (
    <div className="page">
      {/* Dark header */}
      <div className="z-lottery-top">
        <div className="z-lottery-eyebrow">Zing · Building 7</div>
        <div className="z-lottery-title">Cleaning<br/>Lottery.</div>
        <div className="z-lottery-desc">
          A free hour opened in our cleaner's schedule — 1:00 to 2:00 PM.
          One resident wins a free task.
        </div>
      </div>

      {/* Light body */}
      <div className="z-lottery-body">
        {/* Countdown */}
        <div className="z-countdown-row">
          <div className="z-countdown-label">Drawing in</div>
          <div className="z-countdown-num">{cd}</div>
        </div>

        {/* Wheel */}
        <div className="z-wheel-area">
          <div className="z-wheel-pointer" />
          <SpinWheel names={names} />
        </div>

        <div className="z-entrants">{names.length} residents entered</div>

        {/* Available tasks */}
        <div className="z-chips" style={{ padding: "0 16px", marginBottom: 12 }}>
          {["Bathroom","Floors","Vacuum","Laundry"].map(t => (
            <span key={t} className="z-chip">{t}</span>
          ))}
        </div>

        {/* Enter card */}
        <div className="z-enter-card">
          <div className="z-enter-card-title">Enter the lottery</div>
          <div className="z-enter-card-sub">
            Winner picked when the timer hits zero. We'll text you if you win.
          </div>

          {!entered ? (
            <>
              <input
                className="z-input"
                placeholder="Your first name"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleEnter()}
              />
              <button className="z-pill-btn" onClick={handleEnter} disabled={!input.trim()}>
                Enter Now
              </button>
            </>
          ) : (
            <div className="z-entered-row">
              <div className="z-entered-dot" />
              <div className="z-entered-text">You're in, {myName}. Good luck.</div>
            </div>
          )}
        </div>

        <div style={{ padding: "0 16px 8px" }}>
          <div style={{ fontSize: 11, color: "#aaa", textAlign: "center", fontWeight: 500 }}>
            One resident selected when timer ends · Winner notified by text
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Profile Tab ───────────────────────────────────────────────────────────────
const ProfileTab = () => (
  <div className="page">
    <div className="z-profile-top">
      <div className="z-profile-avatar">J</div>
      <div className="z-profile-name">Jamie Chen</div>
      <div className="z-profile-unit">The Henry · Unit 4B</div>
    </div>

    <div className="z-section-label fu fu1">Account</div>
    <div className="z-list-card fu fu1">
      {[
        ["📱","Phone","(404) 555-0182"],
        ["💳","Payment","•••• 4921"],
        ["🏢","Building","The Henry, Ponce City"],
      ].map(([icon,label,val]) => (
        <div key={label} className="z-list-row">
          <div className="z-row-icon">{icon}</div>
          <div className="z-row-body">
            <div className="z-row-label">{label}</div>
            <div className="z-row-value">{val}</div>
          </div>
          <div className="z-row-end">›</div>
        </div>
      ))}
    </div>

    <div className="z-section-label fu fu2">Preferences</div>
    <div className="z-list-card fu fu2">
      {[
        ["⏰","Preferred window","10 AM – 2 PM"],
        ["👟","Shoes off","Always"],
        ["🌿","Products","Fragrance-free"],
        ["👕","Laundry","Hang dry everything"],
        ["🔕","Do not disturb","After 6 PM"],
      ].map(([icon,label,val]) => (
        <div key={label} className="z-list-row">
          <div className="z-row-icon">{icon}</div>
          <div className="z-row-body">
            <div className="z-row-label">{label}</div>
            <div className="z-row-value">{val}</div>
          </div>
          <div className="z-row-end">›</div>
        </div>
      ))}
    </div>

    <div className="z-section-label fu fu3">Notifications</div>
    <div className="z-list-card fu fu3">
      {[
        ["Booking reminders", true],
        ["Cleaner on the way", true],
        ["Lottery alerts", true],
        ["Weekly summary", false],
      ].map(([label, def]) => (
        <div key={label} className="z-list-row">
          <div className="z-row-icon">🔔</div>
          <div className="z-row-body"><div className="z-row-value">{label}</div></div>
          <Toggle def={def} />
        </div>
      ))}
    </div>

    <div className="z-section-label fu fu4">Cleaning History</div>
    <div className="z-list-card fu fu4">
      {[
        { icon: "🚿", name: "Bathroom Refresh",    date: "Mar 12", sub: "15 min" },
        { icon: "🌀", name: "Vacuum + Rugs",        date: "Mar 5",  sub: "20 min" },
        { icon: "🏠", name: "Studio Refresh",       date: "Feb 26", sub: "1.5 hrs" },
        { icon: "🍳", name: "Full Kitchen Clean",   date: "Feb 18", sub: "45 min" },
      ].map(h => (
        <div key={h.name+h.date} className="z-hist-row">
          <div className="z-hist-art">{h.icon}</div>
          <div className="z-hist-info">
            <div className="z-hist-name">{h.name}</div>
            <div className="z-hist-meta">{h.sub} · {h.date}</div>
          </div>
          <div className="z-hist-right">
            <span className="z-hist-badge">Done</span>
          </div>
        </div>
      ))}
    </div>

    <div style={{ height: 20 }} />
  </div>
);

// ── Tab icons ─────────────────────────────────────────────────────────────────
const IcoHome = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill={active ? "#111" : "none"} stroke={active ? "#111" : "#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
);
const IcoExplore = ({ active }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={active ? "#111" : "#aaa"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => { injectFonts(); }, []);
  const [tab, setTab] = useState("home");

  return (
    <>
      <Styles />
      <div className="z-root">
        <div className="z-scroll" key={tab}>
          {tab === "home"    && <HomeTab setTab={setTab} />}
          {tab === "lottery" && <LotteryTab />}
          {tab === "profile" && <ProfileTab />}
        </div>

        {/* Blackbird-style 3-tab bar with raised center */}
        <nav className="z-tabbar">
          <div className={`z-tab${tab==="home"?" active":""}`} onClick={() => setTab("home")}>
            <IcoHome active={tab==="home"} />
            <span className="z-tab-label">Home</span>
          </div>

          {/* Center logo button */}
          <div className="z-tab-center" onClick={() => setTab("home")}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 22v-4h18v4"/><path d="M3 10h18v8H3z"/><path d="M8 10V6a4 4 0 0 1 8 0v4"/>
            </svg>
          </div>

          <div className={`z-tab${tab==="profile"?" active":""}`} onClick={() => setTab("profile")}>
            <IcoExplore active={tab==="profile"} />
            <span className="z-tab-label">Profile</span>
          </div>
        </nav>
      </div>
    </>
  );
}
