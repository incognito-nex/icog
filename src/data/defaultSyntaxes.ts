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
  },
  {
    id: 'roblox-luau',
    name: 'Roblox Luau',
    keywords: [
      'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function',
      'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true',
      'until', 'while', 'self', 'type', 'typeof', 'export', 'continue'
    ],
    functions: [
      'Workspace', 'game', 'script', 'Instance', 'Vector3', 'CFrame', 'UDim2', 'Color3',
      'task', 'Enum', 'Players', 'ReplicatedStorage', 'ServerScriptService', 'HttpService',
      'TweenService', 'RunService', 'Debris', 'UserInputService', 'pcall', 'require', 'print'
    ],
    colors: {
      background: '#f4f4f5',
      keywords: '#d91a60', // Roblox Magenta/crimson
      functions: '#0055ff', // Roblox royal blue
      strings: '#00a33a',
      numbers: '#ff7700',
      comments: '#888888',
      operators: '#18181b',
      accent: '#0055ff'
    }
  },
  {
    id: 'exploit-luau',
    name: 'Exploit Luau',
    keywords: [
      'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 'for', 'function',
      'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 'then', 'true',
      'until', 'while', 'self', 'type', 'typeof', 'export', 'continue'
    ],
    functions: [
      'getgenv', 'getrenv', 'getreg', 'getgc', 'hookfunction', 'hookmetamethod', 
      'replaceclosure', 'loadstring', 'cloneref', 'fireclickdetector', 'firetouchinterest',
      'rconsoleprint', 'rconsolewarn', 'rconsoleinfo', 'rconsoleerr', 'getrawmetatable',
      'setreadonly', 'isreadonly', 'make_writeable', 'identifyexecutor', 'isexecutorscript'
    ],
    colors: {
      background: '#121214',
      keywords: '#a855f7', // Mystic purple
      functions: '#22c55e', // Poison neon green
      strings: '#eab308', // Amber code
      numbers: '#f97316', // Orange
      comments: '#6b7280',
      operators: '#f4f4f5',
      accent: '#a855f7'
    }
  },
  {
    id: 'custom-incognito',
    name: 'Custom Framework (By Us)',
    keywords: [
      'import', 'export', 'and', 'break', 'do', 'else', 'elseif', 'end', 'false', 
      'for', 'function', 'if', 'in', 'local', 'nil', 'not', 'or', 'repeat', 'return', 
      'then', 'true', 'until', 'while', 'self', 'type', 'typeof', 'continue'
    ],
    functions: [
      'Luau', 'use', 'inject', 'system', 'core', 'config', 'print', 'warn',
      'assert', 'require', 'dispatch', 'onEvent', 'triggerChange', 'shutdown'
    ],
    colors: {
      background: '#fafafa',
      keywords: '#000000', // Hard black
      functions: '#a15b3c', // Amber gold
      strings: '#15803d',
      numbers: '#c2410c',
      comments: '#94a3b8',
      operators: '#0f172a',
      accent: '#000000'
    }
  }
];
