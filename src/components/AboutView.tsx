import React from 'react';
import { Info, HelpCircle, ShieldAlert, Cpu, Heart, Code, Terminal, TerminalSquare } from 'lucide-react';
import { AppTheme, UserSettings } from '../types';

interface AboutViewProps {
  theme: AppTheme;
  settings: UserSettings;
}

export default function AboutView({ theme, settings }: AboutViewProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-7 space-y-6 font-sans">
      
      {/* Title */}
      <div className="pb-4 border-b border-zinc-850 text-left">
        <h1 className="text-xl font-bold font-mono tracking-tight text-white uppercase flex items-center space-x-2">
          <Info className="text-[#ee3c22] w-5 h-5 shrink-0" />
          <span>Workspace Diagnostic Blueprint</span>
        </h1>
        <p className="text-xs text-zinc-500 font-mono mt-1">
          Technical specifications of the Incognito standard virtual compilation platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start max-w-4xl text-left">
        
        {/* Technical Specs Card */}
        <div className="border border-zinc-800 bg-zinc-950/40 p-5 rounded-xl space-y-4">
          <h3 className="text-xs font-bold font-mono text-zinc-300 tracking-wider uppercase flex items-center">
            <Cpu size={14} className="text-[#ee3c22] mr-2" />
            Virtual Engine Calibration Specs
          </h3>

          <div className="space-y-2.5 text-xs font-mono text-zinc-400">
            <div className="flex justify-between border-b border-zinc-900 pb-1.5">
              <span>ACTIVE PIPELINE VERSION</span>
              <span className="text-white font-bold">INCOGNITO III</span>
            </div>
            <div className="flex justify-between border-b border-zinc-900 pb-1.5">
              <span>TARGET PHYSICS TICKS</span>
              <span className="text-[#ee3c22] font-semibold">120 Hz (D-Double Wishbone)</span>
            </div>
            <div className="flex justify-between border-b border-zinc-900 pb-1.5">
              <span>STABILIZATION RATIO</span>
              <span className="text-emerald-400">0.035s Tween Target</span>
            </div>
            <div className="flex justify-between border-b border-zinc-900 pb-1.5">
              <span>ACTIVE SYNTAX TOKENIZER</span>
              <span className="text-zinc-200">Luau Token Provider [Custom-Tuned]</span>
            </div>
            <div className="flex justify-between border-b border-zinc-900 pb-1.5">
              <span>SANDBOX HOSTPORT PROXIES</span>
              <span className="text-zinc-500">Port 3000 Standard Router</span>
            </div>
          </div>
        </div>

        {/* Keyboard controller schema shortcuts */}
        <div className="border border-zinc-800 bg-zinc-950/40 p-5 rounded-xl space-y-4">
          <h3 className="text-xs font-bold font-mono text-zinc-300 tracking-wider uppercase flex items-center">
            <TerminalSquare size={14} className="text-[#ee3c22] mr-2" />
            Workspace Console Shortcuts
          </h3>

          <div className="space-y-3.5 text-xs font-mono text-zinc-400">
            <div className="flex justify-between items-center bg-zinc-900/40 p-2 rounded border border-zinc-850">
              <div>
                <div className="font-semibold text-zinc-200">Ctrl + P</div>
                <div className="text-[10px] text-zinc-500 uppercase mt-0.5">Toggle Command Search Palette</div>
              </div>
              <span className="text-[10px] bg-zinc-850 text-zinc-400 px-1 py-0.5 rounded border border-zinc-700">ESC</span>
            </div>

            <div className="flex justify-between items-center bg-zinc-900/40 p-2 rounded border border-zinc-850">
              <div>
                <div className="font-semibold text-zinc-200">Ctrl + S</div>
                <div className="text-[10px] text-zinc-500 uppercase mt-0.5">Save Current Script Node Data</div>
              </div>
              <span className="text-[10px] bg-zinc-850 text-zinc-400 px-1 py-0.5 rounded border border-zinc-700">SAVE</span>
            </div>

            <div className="flex justify-between items-center bg-zinc-900/40 p-2 rounded border border-zinc-850">
              <div>
                <div className="font-semibold text-zinc-200">Escape</div>
                <div className="text-[10px] text-zinc-500 uppercase mt-0.5">Close Popovers And Float Overlays</div>
              </div>
              <span className="text-[10px] bg-zinc-850 text-zinc-400 px-1 py-0.5 rounded border border-zinc-700">ESC</span>
            </div>
          </div>
        </div>

        {/* Mission Statement */}
        <div className="border border-zinc-800 bg-zinc-950/40 p-5 rounded-xl md:col-span-2 space-y-3">
          <h3 className="text-xs font-bold font-mono text-zinc-300 tracking-wider uppercase flex items-center">
            <Code size={14} className="text-[#ee3c22] mr-2" />
            Architectural Philosophy
          </h3>
          <p className="text-xs text-zinc-500 font-mono leading-relaxed uppercase">
            Incognito Workspace Workspace designs virtual telemetry systems and active chassis interfaces for Roblox Luau environments. 
            By integrating double-wishbone physics simulators and compiling real-time execution graphs, developers can engineer complex 
            motorsports suspensions directly inside a secure sandbox environment.
          </p>
        </div>

      </div>
    </div>
  );
}
