import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Cpu, Terminal, Disc } from 'lucide-react';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [rpm, setRpm] = useState(0);
  const [logIndex, setLogIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const logs = [
    'System init: Booting virtual Luau standard libraries...',
    'V-Chassis alignment calibrated (Dual-Wishbone active state)',
    'Allocating secure memory page indicators...',
    'Establishing local terminal proxy socket: PORT 3000...',
    'Syncing with GitHub RAW update index...',
    'Applying Porsche Slate custom-tuned UI styles...',
    'Incognito Workspace Fully Loaded. Standard Engine Active.'
  ];

  useEffect(() => {
    // Needle sweeping simulation up to 9000 RPM and then settling
    let start: number | null = null;
    const duration = 2400; // 2.4s sweep

    const animateRpm = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = timestamp - start;

      if (progress < duration) {
        // Redline sweep up to 9000 and back to idle speed (850 RPM)
        if (progress < duration * 0.6) {
          // Accelerate to 9200
          const ratio = progress / (duration * 0.6);
          setRpm(Math.floor(ratio * 9200));
        } else {
          // bounce down to idle (850 RPM)
          const ratio = (progress - duration * 0.6) / (duration * 0.4);
          setRpm(Math.floor(9200 - ratio * (9200 - 850)));
        }
        requestAnimationFrame(animateRpm);
      } else {
        setRpm(850);
        setIsFinished(true);
        setTimeout(onComplete, 550);
      }
    };

    const animFrame = requestAnimationFrame(animateRpm);

    // Logs timing
    const logInterval = setInterval(() => {
      setLogIndex((prev) => (prev < logs.length - 1 ? prev + 1 : prev));
    }, 320);

    return () => {
      cancelAnimationFrame(animFrame);
      clearInterval(logInterval);
    };
  }, [onComplete]);

  // Calculate rotation angle for meter needle, say from -120deg to +120deg
  // 0 RPM = -120deg, 9000 RPM = 120deg
  const maxCalibratedRpm = 10000;
  const degrees = -120 + (Math.min(rpm, maxCalibratedRpm) / maxCalibratedRpm) * 240;

  return (
    <div className="fixed inset-0 bg-[#0c0d0f] z-50 flex flex-col items-center justify-center p-6 select-none overflow-hidden font-sans">
      <div className="absolute inset-0 bg-radial-[circle_800px_at_50%_50%,rgba(238,60,34,0.07),transparent]" />

      <div className="w-full max-w-sm flex flex-col items-center justify-center">
        {/* Tachometer Visual Section */}
        <div className="relative w-56 h-56 rounded-full border border-zinc-800/80 bg-zinc-950/60 flex items-center justify-center shadow-2xl p-4">
          <div className="absolute inset-2 rounded-full border border-zinc-900/60 bg-radial-[circle_150px_at_50%_50%,rgba(0,0,0,0.8),#030405]" />
          
          {/* RPM Tick Marks */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            {Array.from({ length: 11 }).map((_, i) => {
              const value = i; // 0 to 10
              const percentage = value / 10;
              const angle = -120 + percentage * 240 + 90; // Add 90 for SVG rotate-90 offset
              const rad = (angle * Math.PI) / 180;
              const x1 = 50 + 38 * Math.cos(rad);
              const y1 = 50 + 38 * Math.sin(rad);
              const x2 = 50 + (value === 9 || value === 10 ? 32 : 34) * Math.cos(rad);
              const y2 = 50 + (value === 9 || value === 10 ? 32 : 34) * Math.sin(rad);
              const isRedline = value >= 8;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isRedline ? '#ee3c22' : '#52525b'}
                  strokeWidth={value % 2 === 0 ? 1.5 : 0.8}
                />
              );
            })}
          </svg>

          {/* RPM Numbers */}
          <div className="absolute inset-0 flex items-center justify-center">
            {Array.from({ length: 11 }).map((_, i) => {
              const value = i; // 0 to 10 (thousands of RPM)
              const percentage = value / 10;
              const angle = -120 + percentage * 240;
              const rad = (angle * Math.PI) / 180;
              const distance = 30; // offset inwards
              const x = 50 + distance * Math.cos(rad);
              const y = 50 + distance * Math.sin(rad);
              const isRedline = value >= 8;

              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  className={`text-[8px] font-mono font-medium ${
                    isRedline ? 'text-red-500 font-bold' : 'text-zinc-500'
                  }`}
                >
                  {value}
                </div>
              );
            })}
          </div>

          {/* Core Gauge Details */}
          <div className="absolute bottom-12 flex flex-col items-center">
            <span className="text-[7px] text-zinc-500 font-mono tracking-widest uppercase">RPM x1000</span>
            <span className="text-sm font-mono font-bold text-zinc-300 mt-1">{rpm}</span>
          </div>

          {/* Glowing Red Center Hub */}
          <div className="absolute w-4 h-4 bg-red-600 rounded-full border border-red-500 shadow-lg flex items-center justify-center z-10">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>

          {/* Spinning Gauge Needle */}
          <div
            style={{ transform: `rotate(${degrees}deg)` }}
            className="absolute top-1/2 left-1/2 w-28 h-1 origin-left -translate-y-1/2 z-0 transition-transform duration-75 ease-out"
          >
            <div className="w-full h-full bg-gradient-to-r from-red-600 to-red-400 rounded-full" />
          </div>

          {/* Digital Speed Indicator */}
          <div className="absolute top-12 text-center">
            <div className="text-[10px] uppercase font-mono tracking-widest text-[#ee3c22] font-semibold">Workspace</div>
            <div className="text-[9px] text-zinc-400 font-mono mt-0.5">GT3 CALIBER</div>
          </div>
        </div>

        {/* Brand Reveal (subtle, clean) */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 flex flex-col items-center text-center"
        >
          <div className="h-6 overflow-hidden">
            <div className="text-xs tracking-[0.45em] text-zinc-400 font-mono font-medium uppercase">
              I N C O G N I T O&nbsp;&nbsp;I I I
            </div>
          </div>
          <p className="text-[10px] text-zinc-600 tracking-wider font-mono mt-1.5 uppercase">
            Luau Development Engine
          </p>
        </motion.div>

        {/* Telemetry Process Indicators */}
        <div className="w-64 mt-8 bg-zinc-950/80 border border-zinc-900 rounded-lg p-3 shadow-inner">
          <div className="flex items-center space-x-2 text-[9px] text-[#ee3c22] border-b border-zinc-900 pb-1.5 mb-2 font-mono">
            <Cpu size={12} className="animate-pulse" />
            <span className="font-semibold tracking-wider uppercase">Engine Diagnostic Data</span>
          </div>

          <div className="h-10 flex flex-col justify-end">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={logIndex}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="text-[9px] font-mono text-zinc-400 line-clamp-1 flex items-start space-x-1"
              >
                <Terminal size={10} className="w-3 shrink-0 text-zinc-500 mt-0.5" />
                <span>{logs[logIndex]}</span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden mt-3">
            <motion.div
              initial={{ width: '0%' }}
              animate={{ width: isFinished ? '100%' : '90%' }}
              transition={{ duration: 2.2, ease: 'easeOut' }}
              className="bg-[#ee3c22] h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
