import React, { useEffect, useState } from 'react';
import { workerPool, ThreadTaskMetric } from '../../workers/workerPool';
import {
  Cpu,
  ShieldCheck,
  Server,
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';

interface MultithreadMonitorProps {
  currentEngine: 'web-worker' | 'node-worker' | 'main-thread';
  onChangeEngine: (engine: 'web-worker' | 'node-worker' | 'main-thread') => void;
  isBackendAvailable: boolean;
}

export const MultithreadMonitor: React.FC<MultithreadMonitorProps> = ({
  currentEngine,
  onChangeEngine,
  isBackendAvailable,
}) => {
  const [metrics, setMetrics] = useState<ThreadTaskMetric[]>([]);
  const [poolInfo, setPoolInfo] = useState(workerPool.getPoolInfo());
  const [expandedInfo, setExpandedInfo] = useState(false);

  useEffect(() => {
    const unsubscribe = workerPool.subscribeMetrics((newMetrics) => {
      setMetrics([...newMetrics]);
      setPoolInfo(workerPool.getPoolInfo());
    });
    return unsubscribe;
  }, []);

  const recentTasks = metrics.slice(-6).reverse();

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-4 space-y-4">
      {/* Header and Engine Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-200">
              Multithreading Architecture & Concurrency Monitor
            </h3>
            <p className="text-xs text-zinc-400">
              True multi-core parallelism, safe memory isolation, and thread join synchronization.
            </p>
          </div>
        </div>

        {/* Engine Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="thread-engine-select" className="text-xs text-zinc-400">Execution Engine:</label>
          <select
            id="thread-engine-select"
            value={currentEngine}
            onChange={(e) =>
              onChangeEngine(e.target.value as 'web-worker' | 'node-worker' | 'main-thread')
            }
            className="text-xs font-medium bg-zinc-950 border border-zinc-700 text-zinc-200 rounded-lg px-2.5 py-1.5 focus:border-blue-500 focus:outline-none"
          >
            <option value="web-worker">
              Web Worker Pool (Client OS Threads: {poolInfo.hardwareConcurrency} Cores)
            </option>
            {isBackendAvailable && (
              <option value="node-worker">
                Node.js Worker Threads (Server OS Threads)
              </option>
            )}
            <option value="main-thread">
              Single-Thread Main Event Loop (Baseline Comparison)
            </option>
          </select>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-zinc-200 block font-medium">Race-Condition Safe</strong>
            <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
              Worker threads receive deep-cloned immutable process states. No shared mutable memory
              prevents data races and deadlocks.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 flex items-start gap-2.5">
          <Layers className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-zinc-200 block font-medium">Thread Synchronization Barrier</strong>
            <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
              Concurrent simulations dispatch in parallel across 6 worker threads and join cleanly
              using asynchronous barriers before presenting metrics.
            </p>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 flex items-start gap-2.5">
          <Server className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-zinc-200 block font-medium">Non-Blocking UI Execution</strong>
            <p className="text-zinc-400 text-[11px] mt-0.5 leading-relaxed">
              Algorithms compute on background OS threads, keeping 60 FPS UI responsiveness even
              under intense scheduling workloads.
            </p>
          </div>
        </div>
      </div>

      {/* Real-Time Thread Activity Log */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-medium">Active Thread Activity & Task Dispatches:</span>
          <button
            onClick={() => setExpandedInfo(!expandedInfo)}
            className="text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
          >
            <Info className="w-3.5 h-3.5" />
            <span>{expandedInfo ? 'Hide Threading Theory' : 'Threading Principles Explained'}</span>
          </button>
        </div>

        {recentTasks.length === 0 ? (
          <div className="p-3 rounded-lg bg-zinc-950 text-center text-xs text-zinc-400 font-mono">
            Thread pool initialized and ready ({poolInfo.poolSize} background worker threads waiting in pool).
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {recentTasks.map((t) => (
              <div
                key={t.jobId}
                className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{t.algorithm}</span>
                  </div>
                  <span className="text-[11px] text-zinc-400 font-mono block">
                    {t.workerId}
                  </span>
                </div>

                <div className="text-right">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono uppercase ${
                      t.status === 'completed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : t.status === 'running'
                        ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {t.status}
                  </span>
                  {t.computeTimeMs !== undefined && (
                    <span className="text-[10px] text-zinc-400 block font-mono mt-0.5">
                      {t.computeTimeMs} ms
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Explanatory Collapsible */}
      {expandedInfo && (
        <div className="p-3.5 rounded-lg bg-blue-950/20 border border-blue-900/40 text-xs text-zinc-300 space-y-2 leading-relaxed">
          <p>
            <strong className="text-blue-300">How Multithreading Operates in this Simulator:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 text-[11px]">
            <li>
              <strong>Browser Web Workers:</strong> Spawned via the HTML5 Worker API. Each worker
              executes on an isolated OS-level thread created by the browser process, completely
              independent of the main JavaScript event loop.
            </li>
            <li>
              <strong>Memory Safety:</strong> Web Workers communicate via message passing
              (postMessage) using the Structured Clone algorithm. This creates an isolated snapshot
              of the process array, ensuring zero data race conditions.
            </li>
            <li>
              <strong>Synchronization:</strong> When running concurrent batch simulations (all 6
              algorithms simultaneously), tasks are dispatched across the worker pool and joined at a
              barrier using <code className="text-blue-300">Promise.all()</code>.
            </li>
            <li>
              <strong>Honesty in Concurrency:</strong> Asynchronous functions (promises, async/await,
              setTimeout) on their own do NOT create new threads in JavaScript; they only time-slice
              the single-threaded event loop. Only Web Workers and Node.js{' '}
              <code className="text-blue-300">worker_threads</code> utilize actual parallel OS
              threads.
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};
