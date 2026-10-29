import { Process, SchedulingAlgorithm, ScheduleResult } from '../types/os';
import { runAlgorithm } from '../algorithms/scheduling';
import { WorkerRequest, WorkerResponse } from './scheduler.worker';

export interface ThreadTaskMetric {
  jobId: string;
  algorithm: SchedulingAlgorithm;
  workerId: string;
  engine: 'web-worker' | 'node-worker' | 'main-thread';
  status: 'idle' | 'queued' | 'running' | 'completed' | 'failed';
  dispatchedAt: number;
  completedAt?: number;
  computeTimeMs?: number;
}

class SimulationWorkerPool {
  private workers: { worker: Worker; isBusy: boolean; id: number }[] = [];
  private poolSize: number = 6;
  private pendingJobs = new Map<
    string,
    {
      resolve: (res: ScheduleResult) => void;
      reject: (err: any) => void;
      algorithm: SchedulingAlgorithm;
      startTime: number;
      workerId: string;
    }
  >();
  private isSupported: boolean = typeof window !== 'undefined' && typeof window.Worker !== 'undefined';
  public taskMetrics: ThreadTaskMetric[] = [];
  private listeners: ((metrics: ThreadTaskMetric[]) => void)[] = [];

  constructor(poolSize: number = 6) {
    this.poolSize = Math.max(2, poolSize);
    if (this.isSupported) {
      this.initPool();
    }
  }

  private initPool() {
    try {
      for (let i = 1; i <= this.poolSize; i++) {
        const worker = new Worker(
          new URL('./scheduler.worker.ts', import.meta.url),
          { type: 'module', name: `Worker-${i}` }
        );

        worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
          this.handleWorkerMessage(i, event.data);
        };

        worker.onerror = (err) => {
          console.error(`Worker #${i} runtime error:`, err);
        };

        this.workers.push({ worker, isBusy: false, id: i });
      }
    } catch (err) {
      console.warn('Web Workers could not be initialized, falling back to main thread:', err);
      this.isSupported = false;
    }
  }

  public subscribeMetrics(listener: (metrics: ThreadTaskMetric[]) => void) {
    this.listeners.push(listener);
    listener([...this.taskMetrics]);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyMetrics() {
    for (const l of this.listeners) {
      l([...this.taskMetrics]);
    }
  }

  private updateMetric(jobId: string, updates: Partial<ThreadTaskMetric>) {
    const idx = this.taskMetrics.findIndex((m) => m.jobId === jobId);
    if (idx !== -1) {
      this.taskMetrics[idx] = { ...this.taskMetrics[idx], ...updates };
    } else if (updates.algorithm && updates.workerId) {
      this.taskMetrics.push({
        jobId,
        algorithm: updates.algorithm,
        workerId: updates.workerId,
        engine: updates.engine || 'web-worker',
        status: updates.status || 'queued',
        dispatchedAt: updates.dispatchedAt || performance.now(),
        ...updates,
      });
    }
    this.notifyMetrics();
  }

  private handleWorkerMessage(workerIndex: number, data: WorkerResponse) {
    const workerEntry = this.workers.find((w) => w.id === workerIndex);
    if (workerEntry) {
      workerEntry.isBusy = false;
    }

    const job = this.pendingJobs.get(data.jobId);
    if (!job) return;

    this.pendingJobs.delete(data.jobId);
    const now = performance.now();

    if (data.success && data.result) {
      this.updateMetric(data.jobId, {
        status: 'completed',
        completedAt: now,
        computeTimeMs: data.computeTimeMs,
      });
      job.resolve(data.result);
    } else {
      this.updateMetric(data.jobId, {
        status: 'failed',
        completedAt: now,
        computeTimeMs: data.computeTimeMs,
      });
      job.reject(new Error(data.error || 'Worker execution failed'));
    }
  }

  /**
   * Executes an algorithm on a dedicated background Web Worker thread.
   */
  public async executeOnWorker(
    algorithm: SchedulingAlgorithm,
    processes: Process[],
    quantum: number = 2,
    preferredWorkerIndex?: number
  ): Promise<ScheduleResult> {
    if (!this.isSupported || this.workers.length === 0) {
      return this.executeOnMainThread(algorithm, processes, quantum);
    }

    // Deep copy input processes to ensure thread-safe isolated snapshot
    const clonedProcesses: Process[] = JSON.parse(JSON.stringify(processes));
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Select worker: preferred or first idle or round-robin
    let target = preferredWorkerIndex
      ? this.workers.find((w) => w.id === preferredWorkerIndex)
      : this.workers.find((w) => !w.isBusy);

    if (!target) {
      target = this.workers[Math.floor(Math.random() * this.workers.length)];
    }

    target.isBusy = true;
    const workerId = `Worker-Thread-${target.id}`;

    this.updateMetric(jobId, {
      algorithm,
      workerId,
      engine: 'web-worker',
      status: 'running',
      dispatchedAt: performance.now(),
    });

    return new Promise<ScheduleResult>((resolve, reject) => {
      this.pendingJobs.set(jobId, {
        resolve,
        reject,
        algorithm,
        startTime: performance.now(),
        workerId,
      });

      const request: WorkerRequest = {
        jobId,
        algorithm,
        processes: clonedProcesses,
        quantum,
        workerIndex: target?.id,
      };

      target?.worker.postMessage(request);
    });
  }

  /**
   * Baseline execution on the main JavaScript event loop for comparison.
   */
  public executeOnMainThread(
    algorithm: SchedulingAlgorithm,
    processes: Process[],
    quantum: number = 2
  ): ScheduleResult {
    const jobId = `main_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const start = performance.now();

    this.updateMetric(jobId, {
      algorithm,
      workerId: 'Main-UI-Thread',
      engine: 'main-thread',
      status: 'running',
      dispatchedAt: start,
    });

    const cloned = JSON.parse(JSON.stringify(processes));
    const result = runAlgorithm(algorithm, cloned, quantum);
    const end = performance.now();
    const computeTimeMs = Number((end - start).toFixed(3));

    result.threadInfo = {
      engine: 'main-thread',
      threadId: 'Main-Thread (Event Loop)',
      computeTimeMs,
      isConcurrentWorker: false,
    };

    this.updateMetric(jobId, {
      status: 'completed',
      completedAt: end,
      computeTimeMs,
    });

    return result;
  }

  /**
   * Runs ALL 6 algorithms concurrently across separate worker threads.
   * Uses Promise.all as the thread synchronization join barrier.
   */
  public async executeConcurrentBatch(
    processes: Process[],
    quantum: number = 2,
    engine: 'web-worker' | 'main-thread' = 'web-worker'
  ): Promise<{ results: ScheduleResult[]; totalDurationMs: number }> {
    const algorithms: SchedulingAlgorithm[] = [
      'FCFS',
      'SJF_NP',
      'SRTF',
      'PRIORITY_NP',
      'PRIORITY_P',
      'ROUND_ROBIN',
    ];

    const wallClockStart = performance.now();

    if (engine === 'main-thread' || !this.isSupported) {
      // Run sequentially on main thread
      const results: ScheduleResult[] = [];
      for (const algo of algorithms) {
        results.push(this.executeOnMainThread(algo, processes, quantum));
      }
      const totalDurationMs = Number((performance.now() - wallClockStart).toFixed(3));
      return { results, totalDurationMs };
    }

    // Concurrent multithreaded dispatch: each algorithm mapped to an independent worker
    const promises = algorithms.map((algo, index) => {
      const workerIndex = (index % this.workers.length) + 1;
      return this.executeOnWorker(algo, processes, quantum, workerIndex);
    });

    // Thread Join Barrier: Wait for all concurrent workers to safely finish
    const results = await Promise.all(promises);
    const totalDurationMs = Number((performance.now() - wallClockStart).toFixed(3));

    return { results, totalDurationMs };
  }

  public getPoolInfo() {
    return {
      isSupported: this.isSupported,
      poolSize: this.workers.length,
      hardwareConcurrency:
        typeof navigator !== 'undefined' ? navigator.hardwareConcurrency || 4 : 4,
      busyWorkersCount: this.workers.filter((w) => w.isBusy).length,
    };
  }
}

export const workerPool = new SimulationWorkerPool(6);
