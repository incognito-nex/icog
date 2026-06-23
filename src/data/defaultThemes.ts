import { AppTheme } from '../types';

export const defaultThemes: AppTheme[] = [
  {
    id: 'clean-minimal',
    name: 'Studio Light (Default)',
    isLight: true,
    background: 'bg-[#fafafa] text-[#18181b]',
    editorBg: '#ffffff',
    accent: '#18181b', // Deep charcoal / black accent
    accentGlow: 'shadow-[0_2px_10px_rgba(24,24,27,0.08)]',
    sidebarBg: '#09090b', // Deep dark sidebar for beautiful contrast accent
    cardBg: '#ffffff',
    textMain: '#18181b',
    textMuted: '#71717a',
    borderColor: '#e4e4e7',
    terminalBg: '#18181b', // Professional deep dark terminal panel
    headerBg: '#f4f4f5',
  },
  {
    id: 'alpine-ice',
    name: 'Alpine Ice',
    isLight: true,
    background: 'bg-[#f0f4f8] text-[#0f172a]',
    editorBg: '#ffffff',
    accent: '#3b82f6', // Bright ocean blue
    accentGlow: 'shadow-[0_2px_10px_rgba(59,130,246,0.15)]',
    sidebarBg: '#0f172a',
    cardBg: '#ffffff',
    textMain: '#0f172a',
    textMuted: '#64748b',
    borderColor: '#e2e8f0',
    terminalBg: '#0f172a',
    headerBg: '#f1f5f9',
  },
  {
    id: 'obsidian-gray',
    name: 'Obsidian Gray',
    isLight: false,
    background: 'bg-[#0c0d0f] text-[#f4f4f5]',
    editorBg: '#121316',
    accent: '#f4f4f5', // Pristine silver/white accent
    accentGlow: 'shadow-[0_0_15px_rgba(244,244,245,0.15)]',
    sidebarBg: '#181a1f',
    cardBg: '#16181d',
    textMain: '#f4f4f5',
    textMuted: '#a1a1aa',
    borderColor: '#27272a',
    terminalBg: '#0b0c0e',
    headerBg: '#1e2025',
  },
  {
    id: 'mint-dark',
    name: 'Emerald Dark',
    isLight: false,
    background: 'bg-[#09090b] text-[#f4f4f5]',
    editorBg: '#18181b',
    accent: '#10b981', // Clean mint/emerald accent
    accentGlow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]',
    sidebarBg: '#09090b',
    cardBg: '#18181b',
    textMain: '#f4f4f5',
    textMuted: '#a1a1aa',
    borderColor: '#27272a',
    terminalBg: '#09090b',
    headerBg: '#18181b',
  }
];
