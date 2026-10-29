import { Process, SchedulingAlgorithm } from '../types/os';
import { runAlgorithm } from '../algorithms/scheduling';

export interface WorkerRequest {
  jobId: string;
  algorithm: SchedulingAlgorithm;
  processes: Process[];
  quantum?: number;
  workerIndex?: number;
}

export interface WorkerResponse {
  jobId: string;
  success: boolean;
  result?: any;
  error?: string;
  threadId: string;
  computeTimeMs: number;
}

// In Web Worker context:
self.onmessage = (event: MessageEvent<WorkerRequest>) => {
  const { jobId, algorithm, processes, quantum, workerIndex } = event.data;
  const startTime = performance.now();

  try {
    // Pure, isolated calculation inside separate thread memory space
    const result = runAlgorithm(algorithm, processes, quantum ?? 2);
    const endTime = performance.now();
    const computeTimeMs = Number((endTime - startTime).toFixed(3));

    result.threadInfo = {
      engine: 'web-worker',
      threadId: `WebWorker-#${workerIndex ?? 1}`,
      computeTimeMs,
      isConcurrentWorker: true,
    };

    const response: WorkerResponse = {
      jobId,
      success: true,
      result,
      threadId: `WebWorker-#${workerIndex ?? 1}`,
      computeTimeMs,
    };

    self.postMessage(response);
  } catch (err: any) {
    const endTime = performance.now();
    self.postMessage({
      jobId,
      success: false,
      error: err?.message || 'Unknown worker error',
      threadId: `WebWorker-#${workerIndex ?? 1}`,
      computeTimeMs: Number((endTime - startTime).toFixed(3)),
    });
  }
};
