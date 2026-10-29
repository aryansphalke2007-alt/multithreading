import {
  Process,
  ProcessMetrics,
  GanttSegment,
  ScheduleResult,
  SchedulingAlgorithm,
} from '../types/os';

export interface InternalProcessState {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  remainingBurst: number;
  firstStartTime: number | null;
  completionTime: number;
  originalIndex: number;
}

/**
 * Merges adjacent segments that belong to the same process or consecutive idle periods.
 */
function mergeAdjacentSegments(segments: GanttSegment[]): GanttSegment[] {
  if (segments.length === 0) return [];
  const merged: GanttSegment[] = [];
  let current = { ...segments[0] };

  for (let i = 1; i < segments.length; i++) {
    const next = segments[i];
    if (next.processId === current.processId && next.startTime === current.endTime) {
      current.endTime = next.endTime;
    } else {
      if (current.endTime > current.startTime) {
        merged.push(current);
      }
      current = { ...next };
    }
  }
  if (current.endTime > current.startTime) {
    merged.push(current);
  }
  return merged;
}

/**
 * Calculates metrics (TAT, WT, RT, averages, CPU utilization) from simulation state.
 */
function buildScheduleResult(
  algorithm: SchedulingAlgorithm,
  algorithmName: string,
  states: InternalProcessState[],
  rawSegments: GanttSegment[],
  quantumUsed?: number
): ScheduleResult {
  const ganttChart = mergeAdjacentSegments(rawSegments);

  const processMetrics: ProcessMetrics[] = states
    .slice()
    .sort((a, b) => a.originalIndex - b.originalIndex)
    .map((p) => {
      const completionTime = p.completionTime;
      const turnaroundTime = completionTime - p.arrivalTime;
      const waitingTime = turnaroundTime - p.burstTime;
      const responseTime = (p.firstStartTime ?? p.arrivalTime) - p.arrivalTime;

      return {
        id: p.id,
        arrivalTime: p.arrivalTime,
        burstTime: p.burstTime,
        priority: p.priority,
        completionTime,
        turnaroundTime: Math.max(0, turnaroundTime),
        waitingTime: Math.max(0, waitingTime),
        responseTime: Math.max(0, responseTime),
      };
    });

  const totalProcesses = processMetrics.length;
  const sumTAT = processMetrics.reduce((sum, p) => sum + p.turnaroundTime, 0);
  const sumWT = processMetrics.reduce((sum, p) => sum + p.waitingTime, 0);
  const sumRT = processMetrics.reduce((sum, p) => sum + p.responseTime, 0);

  const averageTurnaroundTime = totalProcesses > 0 ? sumTAT / totalProcesses : 0;
  const averageWaitingTime = totalProcesses > 0 ? sumWT / totalProcesses : 0;
  const averageResponseTime = totalProcesses > 0 ? sumRT / totalProcesses : 0;

  const totalExecutionTime = ganttChart.length > 0 ? ganttChart[ganttChart.length - 1].endTime : 0;
  const totalBusyTime = ganttChart
    .filter((s) => s.processId !== 'IDLE')
    .reduce((sum, s) => sum + (s.endTime - s.startTime), 0);

  const cpuUtilization =
    totalExecutionTime > 0 ? Math.min(100, (totalBusyTime / totalExecutionTime) * 100) : 100;

  const throughput = totalExecutionTime > 0 ? totalProcesses / totalExecutionTime : 0;

  return {
    algorithm,
    algorithmName,
    ganttChart,
    processMetrics,
    averageTurnaroundTime: Number(averageTurnaroundTime.toFixed(3)),
    averageWaitingTime: Number(averageWaitingTime.toFixed(3)),
    averageResponseTime: Number(averageResponseTime.toFixed(3)),
    totalExecutionTime,
    cpuUtilization: Number(cpuUtilization.toFixed(2)),
    throughput: Number(throughput.toFixed(4)),
    quantumUsed,
  };
}

/**
 * 1. First-Come First-Served (FCFS)
 */
export function simulateFCFS(processes: Process[]): ScheduleResult {
  if (processes.length === 0) {
    return buildScheduleResult('FCFS', 'First Come First Serve (FCFS)', [], []);
  }

  const states: InternalProcessState[] = processes.map((p, idx) => ({
    id: p.id,
    arrivalTime: Math.max(0, p.arrivalTime),
    burstTime: Math.max(1, p.burstTime),
    priority: p.priority,
    remainingBurst: Math.max(1, p.burstTime),
    firstStartTime: null,
    completionTime: 0,
    originalIndex: idx,
  }));

  // Sort by arrival time, then original index
  states.sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return a.originalIndex - b.originalIndex;
  });

  const segments: GanttSegment[] = [];
  let currentTime = 0;

  for (const p of states) {
    if (currentTime < p.arrivalTime) {
      segments.push({
        processId: 'IDLE',
        startTime: currentTime,
        endTime: p.arrivalTime,
      });
      currentTime = p.arrivalTime;
    }

    p.firstStartTime = currentTime;
    const finish = currentTime + p.burstTime;
    segments.push({
      processId: p.id,
      startTime: currentTime,
      endTime: finish,
    });
    currentTime = finish;
    p.completionTime = finish;
    p.remainingBurst = 0;
  }

  return buildScheduleResult('FCFS', 'First Come First Serve (FCFS)', states, segments);
}

/**
 * 2. Shortest Job First (SJF) — Non-Preemptive
 */
export function simulateSJFNonPreemptive(processes: Process[]): ScheduleResult {
  if (processes.length === 0) {
    return buildScheduleResult('SJF_NP', 'Shortest Job First (SJF) - Non-Preemptive', [], []);
  }

  const states: InternalProcessState[] = processes.map((p, idx) => ({
    id: p.id,
    arrivalTime: Math.max(0, p.arrivalTime),
    burstTime: Math.max(1, p.burstTime),
    priority: p.priority,
    remainingBurst: Math.max(1, p.burstTime),
    firstStartTime: null,
    completionTime: 0,
    originalIndex: idx,
  }));

  const segments: GanttSegment[] = [];
  let currentTime = 0;
  let completedCount = 0;
  const total = states.length;
  const isCompleted = new Array(total).fill(false);

  while (completedCount < total) {
    // Find arrived, uncompleted processes
    let bestIdx = -1;
    for (let i = 0; i < total; i++) {
      if (!isCompleted[i] && states[i].arrivalTime <= currentTime) {
        if (bestIdx === -1) {
          bestIdx = i;
        } else {
          // Compare burst time
          if (states[i].burstTime < states[bestIdx].burstTime) {
            bestIdx = i;
          } else if (states[i].burstTime === states[bestIdx].burstTime) {
            // Tie-break: arrival time, then original index
            if (states[i].arrivalTime < states[bestIdx].arrivalTime) {
              bestIdx = i;
            } else if (
              states[i].arrivalTime === states[bestIdx].arrivalTime &&
              states[i].originalIndex < states[bestIdx].originalIndex
            ) {
              bestIdx = i;
            }
          }
        }
      }
    }

    if (bestIdx === -1) {
      // CPU idle until next earliest arrival
      let nextArrival = Infinity;
      for (let i = 0; i < total; i++) {
        if (!isCompleted[i] && states[i].arrivalTime > currentTime) {
          if (states[i].arrivalTime < nextArrival) {
            nextArrival = states[i].arrivalTime;
          }
        }
      }

      if (nextArrival !== Infinity) {
        segments.push({
          processId: 'IDLE',
          startTime: currentTime,
          endTime: nextArrival,
        });
        currentTime = nextArrival;
      }
      continue;
    }

    const p = states[bestIdx];
    p.firstStartTime = currentTime;
    const finish = currentTime + p.burstTime;
    segments.push({
      processId: p.id,
      startTime: currentTime,
      endTime: finish,
    });
    currentTime = finish;
    p.completionTime = finish;
    p.remainingBurst = 0;
    isCompleted[bestIdx] = true;
    completedCount++;
  }

  return buildScheduleResult(
    'SJF_NP',
    'Shortest Job First (SJF) - Non-Preemptive',
    states,
    segments
  );
}

/**
 * 3. Shortest Remaining Time First (SRTF) — Preemptive SJF
 */
export function simulateSRTF(processes: Process[]): ScheduleResult {
  if (processes.length === 0) {
    return buildScheduleResult(
      'SRTF',
      'Shortest Remaining Time First (SRTF) - Preemptive',
      [],
      []
    );
  }

  const states: InternalProcessState[] = processes.map((p, idx) => ({
    id: p.id,
    arrivalTime: Math.max(0, p.arrivalTime),
    burstTime: Math.max(1, p.burstTime),
    priority: p.priority,
    remainingBurst: Math.max(1, p.burstTime),
    firstStartTime: null,
    completionTime: 0,
    originalIndex: idx,
  }));

  const segments: GanttSegment[] = [];
  let currentTime = 0;
  let completedCount = 0;
  const total = states.length;

  // We find critical time points to step forward deterministically
  while (completedCount < total) {
    let bestIdx = -1;
    for (let i = 0; i < total; i++) {
      if (states[i].remainingBurst > 0 && states[i].arrivalTime <= currentTime) {
        if (bestIdx === -1) {
          bestIdx = i;
        } else {
          if (states[i].remainingBurst < states[bestIdx].remainingBurst) {
            bestIdx = i;
          } else if (states[i].remainingBurst === states[bestIdx].remainingBurst) {
            if (states[i].arrivalTime < states[bestIdx].arrivalTime) {
              bestIdx = i;
            } else if (
              states[i].arrivalTime === states[bestIdx].arrivalTime &&
              states[i].originalIndex < states[bestIdx].originalIndex
            ) {
              bestIdx = i;
            }
          }
        }
      }
    }

    if (bestIdx === -1) {
      // Idle until next arrival
      let nextArrival = Infinity;
      for (let i = 0; i < total; i++) {
        if (states[i].remainingBurst > 0 && states[i].arrivalTime > currentTime) {
          if (states[i].arrivalTime < nextArrival) {
            nextArrival = states[i].arrivalTime;
          }
        }
      }
      if (nextArrival !== Infinity) {
        segments.push({
          processId: 'IDLE',
          startTime: currentTime,
          endTime: nextArrival,
        });
        currentTime = nextArrival;
      }
      continue;
    }

    const currentProcess = states[bestIdx];
    if (currentProcess.firstStartTime === null) {
      currentProcess.firstStartTime = currentTime;
    }

    // Determine how long currentProcess can run before another process arrives
    // that might preempt it, or until currentProcess completes
    let nextEventTime = currentTime + currentProcess.remainingBurst;

    for (let i = 0; i < total; i++) {
      if (states[i].remainingBurst > 0 && states[i].arrivalTime > currentTime) {
        if (states[i].arrivalTime < nextEventTime) {
          // Check if newly arrived process would preempt
          // Remaining time of current process at states[i].arrivalTime:
          const currentRemainingAtArrival =
            currentProcess.remainingBurst - (states[i].arrivalTime - currentTime);
          if (
            states[i].burstTime < currentRemainingAtArrival ||
            (states[i].burstTime === currentRemainingAtArrival &&
              states[i].arrivalTime < currentProcess.arrivalTime)
          ) {
            nextEventTime = states[i].arrivalTime;
          }
        }
      }
    }

    const duration = nextEventTime - currentTime;
    segments.push({
      processId: currentProcess.id,
      startTime: currentTime,
      endTime: nextEventTime,
    });

    currentProcess.remainingBurst -= duration;
    currentTime = nextEventTime;

    if (currentProcess.remainingBurst === 0) {
      currentProcess.completionTime = currentTime;
      completedCount++;
    }
  }

  return buildScheduleResult(
    'SRTF',
    'Shortest Remaining Time First (SRTF) - Preemptive',
    states,
    segments
  );
}

/**
 * 4. Priority Scheduling — Non-Preemptive
 * Lower number = higher priority.
 */
export function simulatePriorityNonPreemptive(processes: Process[]): ScheduleResult {
  if (processes.length === 0) {
    return buildScheduleResult(
      'PRIORITY_NP',
      'Priority Scheduling - Non-Preemptive',
      [],
      []
    );
  }

  const states: InternalProcessState[] = processes.map((p, idx) => ({
    id: p.id,
    arrivalTime: Math.max(0, p.arrivalTime),
    burstTime: Math.max(1, p.burstTime),
    priority: p.priority,
    remainingBurst: Math.max(1, p.burstTime),
    firstStartTime: null,
    completionTime: 0,
    originalIndex: idx,
  }));

  const segments: GanttSegment[] = [];
  let currentTime = 0;
  let completedCount = 0;
  const total = states.length;
  const isCompleted = new Array(total).fill(false);

  while (completedCount < total) {
    let bestIdx = -1;
    for (let i = 0; i < total; i++) {
      if (!isCompleted[i] && states[i].arrivalTime <= currentTime) {
        if (bestIdx === -1) {
          bestIdx = i;
        } else {
          // Lower priority number = higher priority
          if (states[i].priority < states[bestIdx].priority) {
            bestIdx = i;
          } else if (states[i].priority === states[bestIdx].priority) {
            // Tie-break: arrival time, then original index
            if (states[i].arrivalTime < states[bestIdx].arrivalTime) {
              bestIdx = i;
            } else if (
              states[i].arrivalTime === states[bestIdx].arrivalTime &&
              states[i].originalIndex < states[bestIdx].originalIndex
            ) {
              bestIdx = i;
            }
          }
        }
      }
    }

    if (bestIdx === -1) {
      let nextArrival = Infinity;
      for (let i = 0; i < total; i++) {
        if (!isCompleted[i] && states[i].arrivalTime > currentTime) {
          if (states[i].arrivalTime < nextArrival) {
            nextArrival = states[i].arrivalTime;
          }
        }
      }
      if (nextArrival !== Infinity) {
        segments.push({
          processId: 'IDLE',
          startTime: currentTime,
          endTime: nextArrival,
        });
        currentTime = nextArrival;
      }
      continue;
    }

    const p = states[bestIdx];
    p.firstStartTime = currentTime;
    const finish = currentTime + p.burstTime;
    segments.push({
      processId: p.id,
      startTime: currentTime,
      endTime: finish,
    });
    currentTime = finish;
    p.completionTime = finish;
    p.remainingBurst = 0;
    isCompleted[bestIdx] = true;
    completedCount++;
  }

  return buildScheduleResult(
    'PRIORITY_NP',
    'Priority Scheduling - Non-Preemptive',
    states,
    segments
  );
}

/**
 * 5. Priority Scheduling — Preemptive
 * Lower number = higher priority. Preempted when a strictly higher priority (smaller number) arrives.
 */
export function simulatePriorityPreemptive(processes: Process[]): ScheduleResult {
  if (processes.length === 0) {
    return buildScheduleResult(
      'PRIORITY_P',
      'Priority Scheduling - Preemptive',
      [],
      []
    );
  }

  const states: InternalProcessState[] = processes.map((p, idx) => ({
    id: p.id,
    arrivalTime: Math.max(0, p.arrivalTime),
    burstTime: Math.max(1, p.burstTime),
    priority: p.priority,
    remainingBurst: Math.max(1, p.burstTime),
    firstStartTime: null,
    completionTime: 0,
    originalIndex: idx,
  }));

  const segments: GanttSegment[] = [];
  let currentTime = 0;
  let completedCount = 0;
  const total = states.length;

  while (completedCount < total) {
    let bestIdx = -1;
    for (let i = 0; i < total; i++) {
      if (states[i].remainingBurst > 0 && states[i].arrivalTime <= currentTime) {
        if (bestIdx === -1) {
          bestIdx = i;
        } else {
          if (states[i].priority < states[bestIdx].priority) {
            bestIdx = i;
          } else if (states[i].priority === states[bestIdx].priority) {
            if (states[i].arrivalTime < states[bestIdx].arrivalTime) {
              bestIdx = i;
            } else if (
              states[i].arrivalTime === states[bestIdx].arrivalTime &&
              states[i].originalIndex < states[bestIdx].originalIndex
            ) {
              bestIdx = i;
            }
          }
        }
      }
    }

    if (bestIdx === -1) {
      let nextArrival = Infinity;
      for (let i = 0; i < total; i++) {
        if (states[i].remainingBurst > 0 && states[i].arrivalTime > currentTime) {
          if (states[i].arrivalTime < nextArrival) {
            nextArrival = states[i].arrivalTime;
          }
        }
      }
      if (nextArrival !== Infinity) {
        segments.push({
          processId: 'IDLE',
          startTime: currentTime,
          endTime: nextArrival,
        });
        currentTime = nextArrival;
      }
      continue;
    }

    const currentProcess = states[bestIdx];
    if (currentProcess.firstStartTime === null) {
      currentProcess.firstStartTime = currentTime;
    }

    // Find the next arrival of any process with higher priority (strictly smaller priority number)
    let nextEventTime = currentTime + currentProcess.remainingBurst;

    for (let i = 0; i < total; i++) {
      if (states[i].remainingBurst > 0 && states[i].arrivalTime > currentTime) {
        if (states[i].arrivalTime < nextEventTime) {
          if (states[i].priority < currentProcess.priority) {
            nextEventTime = states[i].arrivalTime;
          }
        }
      }
    }

    const duration = nextEventTime - currentTime;
    segments.push({
      processId: currentProcess.id,
      startTime: currentTime,
      endTime: nextEventTime,
    });

    currentProcess.remainingBurst -= duration;
    currentTime = nextEventTime;

    if (currentProcess.remainingBurst === 0) {
      currentProcess.completionTime = currentTime;
      completedCount++;
    }
  }

  return buildScheduleResult(
    'PRIORITY_P',
    'Priority Scheduling - Preemptive',
    states,
    segments
  );
}

/**
 * 6. Round Robin (RR)
 * Standard Operating Systems FIFO Ready Queue semantics:
 * - New processes arriving up to currentTime are enqueued in arrival order.
 * - Current process runs for min(Q, remaining).
 * - Newly arrived processes during this quantum are added to ready queue BEFORE re-enqueuing the preempted process.
 */
export function simulateRoundRobin(processes: Process[], timeQuantum: number): ScheduleResult {
  const quantum = Math.max(1, Number(timeQuantum) || 2);

  if (processes.length === 0) {
    return buildScheduleResult('ROUND_ROBIN', 'Round Robin (RR)', [], [], quantum);
  }

  const states: InternalProcessState[] = processes.map((p, idx) => ({
    id: p.id,
    arrivalTime: Math.max(0, p.arrivalTime),
    burstTime: Math.max(1, p.burstTime),
    priority: p.priority,
    remainingBurst: Math.max(1, p.burstTime),
    firstStartTime: null,
    completionTime: 0,
    originalIndex: idx,
  }));

  const segments: GanttSegment[] = [];
  let currentTime = 0;
  let completedCount = 0;
  const total = states.length;

  // Track which processes have already entered the ready queue
  const hasEnteredQueue = new Array(total).fill(false);
  const readyQueue: number[] = [];

  // Helper to enqueue all unqueued arrived processes at or before given time
  const enqueueArrived = (timeLimit: number) => {
    // Sort newly arrived candidates by arrival time, then originalIndex
    const candidates: number[] = [];
    for (let i = 0; i < total; i++) {
      if (!hasEnteredQueue[i] && states[i].arrivalTime <= timeLimit) {
        candidates.push(i);
      }
    }
    candidates.sort((a, b) => {
      if (states[a].arrivalTime !== states[b].arrivalTime) {
        return states[a].arrivalTime - states[b].arrivalTime;
      }
      return states[a].originalIndex - states[b].originalIndex;
    });

    for (const idx of candidates) {
      hasEnteredQueue[idx] = true;
      readyQueue.push(idx);
    }
  };

  enqueueArrived(currentTime);

  while (completedCount < total) {
    if (readyQueue.length === 0) {
      // Find next arrival time
      let nextArrival = Infinity;
      for (let i = 0; i < total; i++) {
        if (!hasEnteredQueue[i] && states[i].arrivalTime > currentTime) {
          if (states[i].arrivalTime < nextArrival) {
            nextArrival = states[i].arrivalTime;
          }
        }
      }

      if (nextArrival !== Infinity) {
        segments.push({
          processId: 'IDLE',
          startTime: currentTime,
          endTime: nextArrival,
        });
        currentTime = nextArrival;
        enqueueArrived(currentTime);
      }
      continue;
    }

    const currIdx = readyQueue.shift()!;
    const p = states[currIdx];

    if (p.firstStartTime === null) {
      p.firstStartTime = currentTime;
    }

    const execDuration = Math.min(quantum, p.remainingBurst);
    const finishTime = currentTime + execDuration;

    segments.push({
      processId: p.id,
      startTime: currentTime,
      endTime: finishTime,
    });

    p.remainingBurst -= execDuration;

    // Enqueue processes that arrived during [currentTime, finishTime]
    enqueueArrived(finishTime);

    currentTime = finishTime;

    if (p.remainingBurst > 0) {
      // Re-enqueue current process at the tail
      readyQueue.push(currIdx);
    } else {
      p.completionTime = currentTime;
      completedCount++;
    }
  }

  return buildScheduleResult('ROUND_ROBIN', 'Round Robin (RR)', states, segments, quantum);
}

/**
 * Unified runner for any algorithm.
 */
export function runAlgorithm(
  algorithm: SchedulingAlgorithm,
  processes: Process[],
  quantum: number = 2
): ScheduleResult {
  switch (algorithm) {
    case 'FCFS':
      return simulateFCFS(processes);
    case 'SJF_NP':
      return simulateSJFNonPreemptive(processes);
    case 'SRTF':
      return simulateSRTF(processes);
    case 'PRIORITY_NP':
      return simulatePriorityNonPreemptive(processes);
    case 'PRIORITY_P':
      return simulatePriorityPreemptive(processes);
    case 'ROUND_ROBIN':
      return simulateRoundRobin(processes, quantum);
    default:
      return simulateFCFS(processes);
  }
}
