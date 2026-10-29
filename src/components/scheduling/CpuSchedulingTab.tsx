import React, { useState, useEffect, useCallback } from 'react';
import { Process, SchedulingAlgorithm, ScheduleResult } from '../../types/os';
import { CPU_PRESETS } from '../../data/presets';
import { workerPool } from '../../workers/workerPool';
import { ProcessTable } from './ProcessTable';
import { GanttChart } from './GanttChart';
import { MetricsOverview } from './MetricsOverview';
import { MultithreadMonitor } from './MultithreadMonitor';
import { AlgorithmComparisonModal } from './AlgorithmComparisonModal';
import {
  Play,
  RotateCcw,
  Zap,
  Cpu,
  Layers,
  Sparkles,
  Loader2,
  Clock,
  HelpCircle,
} from 'lucide-react';

export const CpuSchedulingTab: React.FC = () => {
  // Processes and quantum
  const [processes, setProcesses] = useState<Process[]>(CPU_PRESETS[0].processes);
  const [quantum, setQuantum] = useState<number>(CPU_PRESETS[0].quantum);

  // Selected algorithm
  const [selectedAlgo, setSelectedAlgo] = useState<SchedulingAlgorithm>('ROUND_ROBIN');

  // Execution engine
  const [engine, setEngine] = useState<'web-worker' | 'node-worker' | 'main-thread'>('web-worker');
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean>(false);

  // Results
  const [currentResult, setCurrentResult] = useState<ScheduleResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  // Comparison modal
  const [isComparisonOpen, setIsComparisonOpen] = useState<boolean>(false);
  const [benchmarkResults, setBenchmarkResults] = useState<ScheduleResult[]>([]);
  const [benchmarkDuration, setBenchmarkDuration] = useState<number | undefined>(undefined);

  // Check backend health
  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        if (res.ok) setIsBackendAvailable(true);
      })
      .catch(() => {
        setIsBackendAvailable(false);
      });
  }, []);

  // Run single simulation
  const handleRunSimulation = useCallback(
    async (algoToRun = selectedAlgo) => {
      setIsRunning(true);

      try {
        if (engine === 'node-worker' && isBackendAvailable) {
          // Node.js backend worker thread via Express API
          const response = await fetch('/api/simulate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              algorithm: algoToRun,
              processes,
              quantum,
            }),
          });
          if (!response.ok) throw new Error('Backend worker simulation failed');
          const data: ScheduleResult = await response.json();
          setCurrentResult(data);
        } else if (engine === 'web-worker') {
          // Browser Web Worker OS Thread
          const res = await workerPool.executeOnWorker(algoToRun, processes, quantum);
          setCurrentResult(res);
        } else {
          // Main Thread synchronous baseline
          const res = workerPool.executeOnMainThread(algoToRun, processes, quantum);
          setCurrentResult(res);
        }
      } catch (err) {
        console.error('Simulation error:', err);
        // Fallback to main thread execution
        const res = workerPool.executeOnMainThread(algoToRun, processes, quantum);
        setCurrentResult(res);
      } finally {
        setIsRunning(false);
      }
    },
    [selectedAlgo, processes, quantum, engine, isBackendAvailable]
  );

  // Auto-run when mounted or when algorithm changes
  useEffect(() => {
    handleRunSimulation();
  }, [selectedAlgo]);

  // Run parallel concurrent benchmark
  const handleRunConcurrentBenchmark = async () => {
    setIsRunning(true);
    try {
      if (engine === 'node-worker' && isBackendAvailable) {
        const response = await fetch('/api/simulate-batch', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ processes, quantum }),
        });
        const data = await response.json();
        setBenchmarkResults(data.results);
        setBenchmarkDuration(data.totalDurationMs);
      } else {
        const { results, totalDurationMs } = await workerPool.executeConcurrentBatch(
          processes,
          quantum,
          engine === 'main-thread' ? 'main-thread' : 'web-worker'
        );
        setBenchmarkResults(results);
        setBenchmarkDuration(totalDurationMs);
      }
      setIsComparisonOpen(true);
    } catch (err) {
      console.error('Batch benchmark error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  const algorithmOptions: { id: SchedulingAlgorithm; name: string; tag: string; desc: string }[] = [
    {
      id: 'FCFS',
      name: 'First Come First Serve',
      tag: 'Non-Preemptive',
      desc: 'Executes processes in arrival order; prone to convoy effect.',
    },
    {
      id: 'SJF_NP',
      name: 'Shortest Job First (SJF)',
      tag: 'Non-Preemptive',
      desc: 'Selects the shortest burst time among arrived processes once CPU is free.',
    },
    {
      id: 'SRTF',
      name: 'Shortest Remaining Time First',
      tag: 'Preemptive SJF',
      desc: 'Preempts running process if a newly arrived process has shorter remaining time.',
    },
    {
      id: 'PRIORITY_NP',
      name: 'Priority Scheduling',
      tag: 'Non-Preemptive',
      desc: 'Executes highest priority arrived job (smaller number = higher priority).',
    },
    {
      id: 'PRIORITY_P',
      name: 'Priority Scheduling',
      tag: 'Preemptive',
      desc: 'Preempts currently running process when a strictly higher priority job arrives.',
    },
    {
      id: 'ROUND_ROBIN',
      name: 'Round Robin (RR)',
      tag: 'Preemptive Quantum',
      desc: 'Cyclic execution for at most Time Quantum before rotating to back of ready queue.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Algorithm Selector Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {algorithmOptions.map((algo) => {
          const isSelected = selectedAlgo === algo.id;
          return (
            <button
              key={algo.id}
              onClick={() => setSelectedAlgo(algo.id)}
              className={`p-3 rounded-xl text-left border transition relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                  : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
              }`}
            >
              <div>
                <span
                  className={`inline-block text-[10px] font-mono uppercase px-1.5 py-0.5 rounded mb-1.5 ${
                    isSelected
                      ? 'bg-blue-500 text-white font-bold'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {algo.tag}
                </span>
                <h4
                  className={`text-xs font-semibold leading-snug ${
                    isSelected ? 'text-blue-300' : 'text-zinc-200'
                  }`}
                >
                  {algo.name}
                </h4>
              </div>
              <span className="text-[10px] text-zinc-400 mt-2 line-clamp-2">
                {algo.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Primary Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleRunSimulation()}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-blue-600/20"
          >
            {isRunning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
            <span>Run {selectedAlgo} Simulation</span>
          </button>

          <button
            onClick={handleRunConcurrentBenchmark}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-emerald-600/20"
            title="Spawns 6 worker threads to run all scheduling algorithms concurrently"
          >
            <Zap className="w-4 h-4" />
            <span>Run Concurrent Multi-Thread Benchmark (All 6)</span>
          </button>
        </div>

        {/* Execution Metadata Pill */}
        {currentResult?.threadInfo && (
          <div className="flex items-center gap-2 text-xs font-mono px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300">
            <Cpu className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-zinc-400">Thread:</span>
            <strong className="text-blue-300">{currentResult.threadInfo.threadId}</strong>
            <span className="text-zinc-500">|</span>
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-emerald-300">{currentResult.threadInfo.computeTimeMs} ms</span>
          </div>
        )}
      </div>

      {/* Multithread Concurrency Monitor */}
      <MultithreadMonitor
        currentEngine={engine}
        onChangeEngine={setEngine}
        isBackendAvailable={isBackendAvailable}
      />

      {/* Gantt Chart & Visual Timeline */}
      <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <span>{currentResult?.algorithmName || selectedAlgo}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                Gantt Execution Schedule
              </span>
            </h3>
            <p className="text-xs text-zinc-400">
              Interactive timeline with exact process segment start/end intervals and preemption slices.
            </p>
          </div>
        </div>

        {currentResult && (
          <GanttChart segments={currentResult.ganttChart} processes={processes} />
        )}
      </div>

      {/* Metrics & Mathematical Averages */}
      {currentResult && (
        <MetricsOverview result={currentResult} processes={processes} />
      )}

      {/* Process Table & Workload Inputs */}
      <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-100">Process Workload Configuration</h3>
            <p className="text-xs text-zinc-400">
              Add, remove, or modify Arrival Time (AT), Burst Time (BT), and Priority in real time.
            </p>
          </div>
        </div>

        <ProcessTable
          processes={processes}
          onChangeProcesses={(newProcs) => {
            setProcesses(newProcs);
          }}
          quantum={quantum}
          onChangeQuantum={setQuantum}
          showQuantum={selectedAlgo === 'ROUND_ROBIN'}
        />
      </div>

      {/* Comparison Modal */}
      <AlgorithmComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        results={benchmarkResults}
        processes={processes}
        totalBenchmarkDurationMs={benchmarkDuration}
      />
    </div>
  );
};
