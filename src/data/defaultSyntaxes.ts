import { CustomSyntaxProfile } from '../types';

export const defaultSyntaxes: CustomSyntaxProfile[] = [
  {
    id: 'studio-classic',
    name: 'Official Luau Classic',
    keywords: [
      'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function',
      'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true',
      'until', 'while', 'self', 'type', 'typeof', 'export', 'continue'
    ],
    functions: [
      'print', 'warn', 'error', 'assert', 'type', 'typeof', 'pairs', 'ipairs',
      'next', 'select', 'pcall', 'xpcall', 'require', 'getmetatable', 'setmetatable',
      'wait', 'delay', 'tick', 'spawn'
    ],
    colors: {
      background: '#0c0d10',
      keywords: '#f86f5c', // Crimson Red
      functions: '#85dfff', // Cyber blue
      strings: '#7ee787', // Bio Green
      numbers: '#ffc107', // Amber Gold
      comments: '#64748b', // Slate Gray
      operators: '#f1f5f9', // Snow white
      accent: '#ee3c22'
    }
  },
  {
    id: 'porsche-headlight',
    name: 'Porsche Turbo-Glow',
    keywords: [
      'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function',
      'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true',
      'until', 'while', 'self', 'type', 'typeof', 'export', 'continue'
    ],
    functions: [
      'print', 'warn', 'error', 'assert', 'type', 'typeof', 'pairs', 'ipairs',
      'next', 'select', 'pcall', 'xpcall', 'require', 'getmetatable', 'setmetatable',
      'wait', 'delay', 'tick', 'spawn'
    ],
    colors: {
      background: '#040507',
      keywords: '#ee3c22', // Hot Caliper Orange-Red
      functions: '#39ff14', // Acid Speedometer Green
      strings: '#3b82f6', // Cobalt Airway Blue
      numbers: '#f59e0b', // Xenon Amber
      comments: '#4b5563', // Ash Grey
      operators: '#ffffff', // Direct white
      accent: '#ee3c22'
    }
  },
  {
    id: 'acid-green',
    name: 'Acid Performance',
    keywords: [
      'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function',
      'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true',
      'until', 'while', 'self', 'type', 'typeof', 'export', 'continue'
    ],
    functions: [
      'print', 'warn', 'error', 'assert', 'type', 'typeof', 'pairs', 'ipairs',
      'next', 'select', 'pcall', 'xpcall', 'require', 'getmetatable', 'setmetatable',
      'wait', 'delay', 'tick', 'spawn'
    ],
    colors: {
      background: '#0d1117',
      keywords: '#58a6ff',
      functions: '#d2a8ff',
      strings: '#7ee787',
      numbers: '#ff7b72',
      comments: '#8b949e',
      operators: '#f0f6fc',
      accent: '#238636'
    }
  }
];
