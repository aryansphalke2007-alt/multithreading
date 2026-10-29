import React from 'react';
import { MemoryAllocationResult } from '../../types/os';
import {
  CheckCircle,
  XCircle,
  Database,
  PieChart,
  HardDrive,
  AlertTriangle,
} from 'lucide-react';

interface MemoryStatsCardProps {
  result: MemoryAllocationResult;
}

export const MemoryStatsCard: React.FC<MemoryStatsCardProps> = ({ result }) => {
  const memoryUtilization =
    result.totalMemoryAvailable > 0
      ? Number(((result.totalAllocatedMemory / result.totalMemoryAvailable) * 100).toFixed(2))
      : 0;

  return (
    <div className="space-y-4">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Successful Allocations */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Allocated</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-emerald-300">
              {result.successfulAllocationsCount}
            </span>
            <span className="text-xs text-zinc-400">processes</span>
          </div>
          <span className="text-[11px] text-zinc-400 mt-2">Placed in slots</span>
        </div>

        {/* Failed Allocations */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Unallocated</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-rose-300">
              {result.failedAllocationsCount}
            </span>
            <span className="text-xs text-zinc-400">processes</span>
          </div>
          <span className="text-[11px] text-zinc-400 mt-2">Insufficient block size</span>
        </div>

        {/* Total Allocated Memory */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Memory In Use</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-blue-300">
              {result.totalAllocatedMemory}
            </span>
            <span className="text-xs text-zinc-400">KB</span>
          </div>
          <span className="text-[11px] text-zinc-400 mt-2">Active process payload</span>
        </div>

        {/* Total Internal Fragmentation */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Int. Fragmentation</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-amber-300">
              {result.totalInternalFragmentation}
            </span>
            <span className="text-xs text-zinc-400">KB</span>
          </div>
          <span className="text-[11px] text-zinc-400 mt-2">Unused inside occupied blocks</span>
        </div>

        {/* Total Capacity & Utilization */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800 flex flex-col justify-between hover:border-zinc-700 transition">
          <div className="flex items-center justify-between text-zinc-400 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Net Utilization</span>
            <PieChart className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-purple-300">
              {memoryUtilization}%
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 mt-2">
            Of {result.totalMemoryAvailable} KB total RAM
          </span>
        </div>
      </div>

      {/* Unallocated Processes Warning Banner (if any) */}
      {result.unallocatedProcesses.length > 0 && (
        <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-900/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <strong className="text-rose-300 font-semibold">
              {result.unallocatedProcesses.length} Process(es) Could Not Be Allocated:
            </strong>
            <div className="flex flex-wrap gap-2 pt-1">
              {result.unallocatedProcesses.map((p) => (
                <span
                  key={p.id}
                  className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-xs"
                >
                  {p.id}: {p.size} KB
                </span>
              ))}
            </div>
            <p className="text-zinc-400 text-[11px] pt-1">
              These processes failed to find an available contiguous block large enough to fit their memory request.
            </p>
          </div>
        </div>
      )}

      {/* Process Allocation Detailed Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow">
        <div className="px-5 py-3 border-b border-zinc-800 flex items-center justify-between">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Process Allocation Status & Fragmentation Table
          </h4>
          <span className="text-xs text-zinc-400 font-mono">
            {result.allocations.length} Processes
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <th className="py-2.5 px-4">Process ID</th>
                <th className="py-2.5 px-4">Required Size</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Allocated Block</th>
                <th className="py-2.5 px-4">Block Size</th>
                <th className="py-2.5 px-4 text-amber-400">Internal Fragmentation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 font-mono text-xs">
              {result.allocations.map((alloc) => (
                <tr key={alloc.processId} className="hover:bg-zinc-800/40 transition">
                  <td className="py-3 px-4 font-sans font-bold text-zinc-200">
                    {alloc.processId}
                  </td>
                  <td className="py-3 px-4 text-zinc-300">{alloc.processSize} KB</td>
                  <td className="py-3 px-4">
                    {alloc.isAllocated ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-sans">
                        <CheckCircle className="w-3 h-3" />
                        Allocated
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 font-sans">
                        <XCircle className="w-3 h-3" />
                        Not Allocated
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-blue-300 font-bold">
                    {alloc.allocatedBlockId !== null ? `Block ${alloc.allocatedBlockId}` : '—'}
                  </td>
                  <td className="py-3 px-4 text-zinc-300">
                    {alloc.allocatedBlockOriginalSize !== null
                      ? `${alloc.allocatedBlockOriginalSize} KB`
                      : '—'}
                  </td>
                  <td className="py-3 px-4 text-amber-300 font-bold">
                    {alloc.internalFragmentation !== null
                      ? `${alloc.internalFragmentation} KB`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
