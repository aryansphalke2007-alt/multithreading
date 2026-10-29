import { Process, MemoryBlock, MemoryProcess } from '../types/os';

export const PROCESS_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
  '#14b8a6', // teal
  '#6366f1', // indigo
  '#84cc16', // lime
];

export const CPU_PRESETS: { name: string; description: string; quantum: number; processes: Process[] }[] = [
  {
    name: 'Standard OS Textbook Example',
    description: 'Diverse arrival times, varying burst times, and mixed priorities.',
    quantum: 2,
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 5, priority: 2, color: PROCESS_COLORS[0] },
      { id: 'P2', arrivalTime: 1, burstTime: 3, priority: 1, color: PROCESS_COLORS[1] },
      { id: 'P3', arrivalTime: 2, burstTime: 8, priority: 4, color: PROCESS_COLORS[2] },
      { id: 'P4', arrivalTime: 3, burstTime: 6, priority: 3, color: PROCESS_COLORS[3] },
      { id: 'P5', arrivalTime: 4, burstTime: 4, priority: 2, color: PROCESS_COLORS[4] },
    ],
  },
  {
    name: 'Preemption & Short Jobs (SRTF / Priority)',
    description: 'Long job arrives first, followed by shorter and higher priority jobs.',
    quantum: 3,
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 10, priority: 3, color: PROCESS_COLORS[0] },
      { id: 'P2', arrivalTime: 2, burstTime: 2, priority: 1, color: PROCESS_COLORS[1] },
      { id: 'P3', arrivalTime: 4, burstTime: 4, priority: 2, color: PROCESS_COLORS[2] },
      { id: 'P4', arrivalTime: 6, burstTime: 1, priority: 1, color: PROCESS_COLORS[3] },
    ],
  },
  {
    name: 'Idle CPU Periods & Gaps',
    description: 'Processes arrive with substantial time gaps to test CPU idle handling.',
    quantum: 2,
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 3, priority: 2, color: PROCESS_COLORS[0] },
      { id: 'P2', arrivalTime: 6, burstTime: 4, priority: 1, color: PROCESS_COLORS[1] },
      { id: 'P3', arrivalTime: 14, burstTime: 3, priority: 3, color: PROCESS_COLORS[2] },
    ],
  },
  {
    name: 'Simultaneous Arrivals & Equal Priorities',
    description: 'All arrive at time 0 with identical priorities to verify tie-breaking logic.',
    quantum: 4,
    processes: [
      { id: 'P1', arrivalTime: 0, burstTime: 4, priority: 2, color: PROCESS_COLORS[0] },
      { id: 'P2', arrivalTime: 0, burstTime: 6, priority: 2, color: PROCESS_COLORS[1] },
      { id: 'P3', arrivalTime: 0, burstTime: 2, priority: 2, color: PROCESS_COLORS[2] },
      { id: 'P4', arrivalTime: 0, burstTime: 5, priority: 2, color: PROCESS_COLORS[3] },
    ],
  },
];

export const MEMORY_PRESETS: {
  name: string;
  description: string;
  blocks: MemoryBlock[];
  processes: MemoryProcess[];
}[] = [
  {
    name: 'Classic OS Textbook (Galvin/Silberschatz)',
    description: '5 partitions (100K to 600K) and 4 processes (212K, 417K, 112K, 426K).',
    blocks: [
      { id: 1, size: 100 },
      { id: 2, size: 500 },
      { id: 3, size: 200 },
      { id: 4, size: 300 },
      { id: 5, size: 600 },
    ],
    processes: [
      { id: 'P1', size: 212 },
      { id: 'P2', size: 417 },
      { id: 'P3', size: 112 },
      { id: 'P4', size: 426 },
    ],
  },
  {
    name: 'Best Fit Advantage vs Next Fit Wrap',
    description: 'Demonstrates how Best Fit preserves larger blocks while Next Fit wraps around.',
    blocks: [
      { id: 1, size: 200 },
      { id: 2, size: 400 },
      { id: 3, size: 600 },
      { id: 4, size: 500 },
      { id: 5, size: 300 },
      { id: 6, size: 250 },
    ],
    processes: [
      { id: 'P1', size: 350 },
      { id: 'P2', size: 180 },
      { id: 'P3', size: 480 },
      { id: 'P4', size: 220 },
      { id: 'P5', size: 550 },
    ],
  },
  {
    name: 'Severe Fragmentation & Oversized Processes',
    description: 'Includes processes that exceed largest available block to test failure handling.',
    blocks: [
      { id: 1, size: 50 },
      { id: 2, size: 150 },
      { id: 3, size: 100 },
      { id: 4, size: 200 },
    ],
    processes: [
      { id: 'P1', size: 90 },
      { id: 'P2', size: 300 }, // Will fail (too large)
      { id: 'P3', size: 140 },
      { id: 'P4', size: 45 },
    ],
  },
];
