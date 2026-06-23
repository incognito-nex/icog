import { CustomSyntaxProfile } from '../types';

export const defaultSyntaxes: CustomSyntaxProfile[] = [
  {
    id: 'studio-classic',
    name: 'Standard Luau',
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
      background: '#ffffff',
      keywords: '#2563eb', // Clean Blue
      functions: '#0891b2', // Cyan
      strings: '#16a34a', // Dark Green
      numbers: '#ea580c', // Dark Orange
      comments: '#71717a', // Muted Gray
      operators: '#18181b', // Ink Black
      accent: '#18181b'
    }
  }
];
