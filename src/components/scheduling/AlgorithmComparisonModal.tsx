import React from 'react';
import { ScheduleResult, Process } from '../../types/os';
import { GanttChart } from './GanttChart';
import {
  X,
  Trophy,
  Zap,
  Clock,
  Layers,
  Cpu,
  TrendingDown,
  BarChart3,
} from 'lucide-react';

interface AlgorithmComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: ScheduleResult[];
  processes: Process[];
  totalBenchmarkDurationMs?: number;
}

export const AlgorithmComparisonModal: React.FC<AlgorithmComparisonModalProps> = ({
  isOpen,
  onClose,
  results,
  processes,
  totalBenchmarkDurationMs,
}) => {
  if (!isOpen || results.length === 0) return null;

  // Find optimal values
  const minWT = Math.min(...results.map((r) => r.averageWaitingTime));
  const minTAT = Math.min(...results.map((r) => r.averageTurnaroundTime));
  const minRT = Math.min(...results.map((r) => r.averageResponseTime));
  const maxUtil = Math.max(...results.map((r) => r.cpuUtilization));

  const bestWTAlgo = results.find((r) => r.averageWaitingTime === minWT)?.algorithmName;
  const bestRTAlgo = results.find((r) => r.averageResponseTime === minRT)?.algorithmName;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[90vh] bg-zinc-900 border border-zinc-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-zinc-100 flex items-center gap-2">
                <span>Multi-Threaded Benchmark: All 6 Scheduling Algorithms</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-500/20 text-emerald-400 font-mono border border-emerald-500/30">
                  Executed in Parallel
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Independent worker threads concurrently evaluated each algorithm and joined at synchronization barrier.
                {totalBenchmarkDurationMs !== undefined && (
                  <span className="text-blue-400 font-mono ml-2">
                    (Wall-clock barrier time: {totalBenchmarkDurationMs} ms)
                  </span>
                )}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Winner Highlights Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                  Lowest Average Waiting Time
                </span>
                <p className="text-sm font-bold text-zinc-100">{bestWTAlgo}</p>
                <span className="text-xs text-zinc-400 font-mono">
                  {minWT} units average wait time
                </span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-300">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">
                  Fastest Initial CPU Response
                </span>
                <p className="text-sm font-bold text-zinc-100">{bestRTAlgo}</p>
                <span className="text-xs text-zinc-400 font-mono">
                  {minRT} units average response time
                </span>
              </div>
            </div>
          </div>

          {/* Comparison Matrix Table */}
          <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950 shadow">
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                Side-by-Side Algorithm Performance Matrix
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-zinc-900 border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    <th className="py-2.5 px-4">Algorithm</th>
                    <th className="py-2.5 px-4 text-amber-400">Avg Turnaround (TAT)</th>
                    <th className="py-2.5 px-4 text-emerald-400">Avg Waiting (WT)</th>
                    <th className="py-2.5 px-4 text-cyan-400">Avg Response (RT)</th>
                    <th className="py-2.5 px-4 text-blue-400">CPU Util %</th>
                    <th className="py-2.5 px-4 text-purple-400">Total Span</th>
                    <th className="py-2.5 px-4">Assigned Worker Thread</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800 font-mono text-xs">
                  {results.map((res) => {
                    const isMinTAT = res.averageTurnaroundTime === minTAT;
                    const isMinWT = res.averageWaitingTime === minWT;
                    const isMinRT = res.averageResponseTime === minRT;

                    return (
                      <tr key={res.algorithm} className="hover:bg-zinc-800/40 transition">
                        <td className="py-3 px-4 font-sans font-semibold text-zinc-200">
                          {res.algorithmName}
                        </td>
                        <td className="py-3 px-4 text-amber-300">
                          <span className={isMinTAT ? 'bg-amber-500/20 px-1.5 py-0.5 rounded text-amber-300 font-bold border border-amber-500/30' : ''}>
                            {res.averageTurnaroundTime}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-emerald-300">
                          <span className={isMinWT ? 'bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 font-bold border border-emerald-500/30' : ''}>
                            {res.averageWaitingTime}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-cyan-300">
                          <span className={isMinRT ? 'bg-cyan-500/20 px-1.5 py-0.5 rounded text-cyan-300 font-bold border border-cyan-500/30' : ''}>
                            {res.averageResponseTime}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-blue-300">{res.cpuUtilization}%</td>
                        <td className="py-3 px-4 text-purple-300">{res.totalExecutionTime}</td>
                        <td className="py-3 px-4 text-zinc-400 font-sans text-[11px]">
                          <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono">
                            {res.threadInfo?.threadId || 'Worker Thread'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mini Gantt Charts for each algorithm */}
          <div className="space-y-4 pt-2">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Comparative Execution Timelines</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((res) => (
                <div
                  key={res.algorithm}
                  className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/70 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-zinc-200">{res.algorithmName}</span>
                    <span className="text-zinc-400 font-mono">
                      Avg WT: <strong className="text-emerald-400">{res.averageWaitingTime}</strong> | Avg TAT: <strong className="text-amber-400">{res.averageTurnaroundTime}</strong>
                    </span>
                  </div>
                  <GanttChart segments={res.ganttChart} processes={processes} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-zinc-800 flex justify-end bg-zinc-950">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-200 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
