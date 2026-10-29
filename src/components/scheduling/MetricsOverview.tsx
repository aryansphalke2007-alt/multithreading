import React, { useState } from 'react';
import { ScheduleResult, Process } from '../../types/os';
import {
  Timer,
  Hourglass,
  Zap,
  Activity,
  Cpu,
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface MetricsOverviewProps {
  result: ScheduleResult;
  processes: Process[];
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ result, processes }) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  const colorMap = new Map<string, string>();
  processes.forEach((p) => {
    colorMap.set(p.id, p.color || '#3b82f6');
  });

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Average Turnaround Time */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Turnaround</span>
            <Hourglass className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-amber-300">
              {result.averageTurnaroundTime}
            </span>
            <span className="text-xs text-zinc-400">ms / units</span>
          </div>
          <span className="text-[11px] text-zinc-400 mt-2 font-mono">TAT = CT - AT</span>
        </div>

        {/* Average Waiting Time */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Waiting Time</span>
            <Timer className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-300">
              {result.averageWaitingTime}
            </span>
            <span className="text-xs text-zinc-400">units</span>
          </div>
          <span className="text-[11px] text-zinc-400 mt-2 font-mono">WT = TAT - BT</span>
        </div>

        {/* Average Response Time */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Avg Response</span>
            <Zap className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-cyan-300">
              {result.averageResponseTime}
            </span>
            <span className="text-xs text-zinc-400">units</span>
          </div>
          <span className="text-[11px] text-zinc-400 mt-2 font-mono">RT = Start - AT</span>
        </div>

        {/* Total Execution Time */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total Duration</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-purple-300">
              {result.totalExecutionTime}
            </span>
            <span className="text-xs text-zinc-400">units</span>
          </div>
          <span className="text-[11px] text-zinc-400 mt-2">Finish of last job</span>
        </div>

        {/* CPU Utilization */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">CPU Utilization</span>
            <Cpu className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-blue-300">
              {result.cpuUtilization}%
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 mt-2 font-mono">Busy / Total Time</span>
        </div>

        {/* Throughput */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Throughput</span>
            <CheckCircle2 className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-rose-300">
              {result.throughput}
            </span>
            <span className="text-xs text-zinc-400">p/unit</span>
          </div>
          <span className="text-[11px] text-zinc-400 mt-2 font-mono">Completed / Total</span>
        </div>
      </div>

      {/* Process Metrics Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow-lg">
        <div className="px-5 py-3.5 border-b border-zinc-800 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-zinc-200">
              Process Evaluation & Metrics Table
            </h3>
            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
              {result.processMetrics.length} Processes
            </span>
          </div>

          <button
            onClick={() => setShowFormulaDetails(!showFormulaDetails)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition px-2 py-1 rounded bg-zinc-800/70 border border-zinc-700"
          >
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>Mathematical Definitions</span>
            {showFormulaDetails ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Formula Explanations Collapsible */}
        {showFormulaDetails && (
          <div className="p-4 bg-zinc-950/80 border-b border-zinc-800 text-xs text-zinc-300 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1 p-2.5 rounded bg-zinc-900/70 border border-zinc-800">
              <strong className="text-amber-400 font-mono">Turnaround Time (TAT)</strong>
              <p className="text-zinc-400">
                Formula: <span className="font-mono text-zinc-200">TAT = CT − AT</span>
              </p>
              <p className="text-[11px] text-zinc-400">
                Total time elapsed from process arrival to final completion.
              </p>
            </div>

            <div className="space-y-1 p-2.5 rounded bg-zinc-900/70 border border-zinc-800">
              <strong className="text-emerald-400 font-mono">Waiting Time (WT)</strong>
              <p className="text-zinc-400">
                Formula: <span className="font-mono text-zinc-200">WT = TAT − BT</span>
              </p>
              <p className="text-[11px] text-zinc-400">
                Time spent waiting in the ready queue without CPU allocation.
              </p>
            </div>

            <div className="space-y-1 p-2.5 rounded bg-zinc-900/70 border border-zinc-800">
              <strong className="text-cyan-400 font-mono">Response Time (RT)</strong>
              <p className="text-zinc-400">
                Formula: <span className="font-mono text-zinc-200">RT = FirstStart − AT</span>
              </p>
              <p className="text-[11px] text-zinc-400">
                Time until the process is granted CPU execution for the first time.
              </p>
            </div>

            <div className="space-y-1 p-2.5 rounded bg-zinc-900/70 border border-zinc-800">
              <strong className="text-blue-400 font-mono">CPU Utilization</strong>
              <p className="text-zinc-400">
                Formula:{' '}
                <span className="font-mono text-zinc-200">(Busy Time / Total Time) × 100%</span>
              </p>
              <p className="text-[11px] text-zinc-400">
                Fraction of total scheduled time CPU was active vs idling.
              </p>
            </div>
          </div>
        )}

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-950/70 border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <th className="py-3 px-4">Process ID</th>
                <th className="py-3 px-4">Arrival Time (AT)</th>
                <th className="py-3 px-4">Burst Time (BT)</th>
                <th className="py-3 px-4">Priority (Prio)</th>
                <th className="py-3 px-4 text-purple-400">Completion (CT)</th>
                <th className="py-3 px-4 text-amber-400">Turnaround (TAT)</th>
                <th className="py-3 px-4 text-emerald-400">Waiting (WT)</th>
                <th className="py-3 px-4 text-cyan-400">Response (RT)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono">
              {result.processMetrics.map((p) => {
                const color = colorMap.get(p.id) || '#3b82f6';
                return (
                  <tr key={p.id} className="hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-4 font-sans font-medium flex items-center gap-2 text-zinc-200">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span>{p.id}</span>
                    </td>
                    <td className="py-3 px-4 text-zinc-300">{p.arrivalTime}</td>
                    <td className="py-3 px-4 text-zinc-300">{p.burstTime}</td>
                    <td className="py-3 px-4 text-zinc-300">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-xs border border-zinc-700">
                        {p.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-purple-300 font-semibold">{p.completionTime}</td>
                    <td className="py-3 px-4 text-amber-300 font-semibold">{p.turnaroundTime}</td>
                    <td className="py-3 px-4 text-emerald-300 font-semibold">{p.waitingTime}</td>
                    <td className="py-3 px-4 text-cyan-300 font-semibold">{p.responseTime}</td>
                  </tr>
                );
              })}

              {/* Averages Row */}
              <tr className="bg-zinc-950 font-semibold text-xs border-t-2 border-zinc-700">
                <td colSpan={4} className="py-3.5 px-4 font-sans uppercase tracking-wider text-zinc-400">
                  Algorithm System Averages
                </td>
                <td className="py-3.5 px-4 text-purple-400">—</td>
                <td className="py-3.5 px-4 text-amber-400 text-base">{result.averageTurnaroundTime}</td>
                <td className="py-3.5 px-4 text-emerald-400 text-base">{result.averageWaitingTime}</td>
                <td className="py-3.5 px-4 text-cyan-400 text-base">{result.averageResponseTime}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
