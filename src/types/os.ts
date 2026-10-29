export interface Process {
  id: string; // e.g. "P1", "P2"
  arrivalTime: number; // AT >= 0
  burstTime: number; // BT > 0
  priority: number; // Lower number = higher priority
  color?: string;
}

export interface GanttSegment {
  processId: string; // "IDLE" or process ID like "P1"
  startTime: number;
  endTime: number;
}

export interface ProcessMetrics {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  completionTime: number; // CT
  turnaroundTime: number; // TAT = CT - AT
  waitingTime: number; // WT = TAT - BT
  responseTime: number; // RT = FirstStart - AT
}

export interface ScheduleResult {
  algorithm: SchedulingAlgorithm;
  algorithmName: string;
  ganttChart: GanttSegment[];
  processMetrics: ProcessMetrics[];
  averageTurnaroundTime: number;
  averageWaitingTime: number;
  averageResponseTime: number;
  totalExecutionTime: number; // Span from 0 (or first arrival) to last completion
  cpuUtilization: number; // (Total busy time / Total span) * 100
  throughput: number; // processes completed per unit time
  quantumUsed?: number;
  threadInfo?: {
    engine: 'web-worker' | 'node-worker' | 'main-thread';
    threadId: string | number;
    computeTimeMs: number;
    isConcurrentWorker?: boolean;
  };
}

export type SchedulingAlgorithm =
  | 'FCFS'
  | 'SJF_NP'
  | 'SRTF'
  | 'PRIORITY_NP'
  | 'PRIORITY_P'
  | 'ROUND_ROBIN';

export interface MemoryBlock {
  id: number;
  size: number;
}

export interface MemoryProcess {
  id: string;
  size: number;
}

export interface ProcessAllocation {
  processId: string;
  processSize: number;
  allocatedBlockId: number | null; // null if unallocated
  allocatedBlockOriginalSize: number | null;
  internalFragmentation: number | null; // (block size - process size) or null
  isAllocated: boolean;
}

export interface MemoryBlockState {
  blockId: number;
  size: number;
  allocatedProcessId: string | null;
  processSize: number | null;
  internalFragmentation: number | null;
  isOccupied: boolean;
}

export type MemoryAlgorithm = 'FIRST_FIT' | 'BEST_FIT' | 'NEXT_FIT';

export interface MemoryAllocationResult {
  algorithm: MemoryAlgorithm;
  algorithmName: string;
  blockStates: MemoryBlockState[];
  allocations: ProcessAllocation[];
  unallocatedProcesses: MemoryProcess[];
  totalAllocatedMemory: number; // sum of process sizes allocated
  totalInternalFragmentation: number; // sum of internal fragmentation inside allocated blocks
  successfulAllocationsCount: number;
  failedAllocationsCount: number;
  totalMemoryAvailable: number;
  nextFitLastIndex?: number;
}
