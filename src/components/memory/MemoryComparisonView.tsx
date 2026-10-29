import React from 'react';
import { MemoryAllocationResult } from '../../types/os';
import { MemoryBlockVisualizer } from './MemoryBlockVisualizer';
import {
  Trophy,
  CheckCircle,
  XCircle,
  Layers,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

interface MemoryComparisonViewProps {
  firstFitResult: MemoryAllocationResult;
  bestFitResult: MemoryAllocationResult;
  nextFitResult: MemoryAllocationResult;
}

export const MemoryComparisonView: React.FC<MemoryComparisonViewProps> = ({
  firstFitResult,
  bestFitResult,
  nextFitResult,
}) => {
  const results = [firstFitResult, bestFitResult, nextFitResult];

  // Best performer based on successful allocations, then lowest internal fragmentation
  const maxAllocations = Math.max(...results.map((r) => r.successfulAllocationsCount));
  const minFragmentation = Math.min(
    ...results
      .filter((r) => r.successfulAllocationsCount === maxAllocations)
      .map((r) => r.totalInternalFragmentation)
  );

  return (
    <div className="space-y-6 pt-2">
      {/* Overview Banner */}
      <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100">
              Comparative Analysis: First Fit vs. Best Fit vs. Next Fit
            </h3>
            <p className="text-xs text-zinc-400">
              Evaluated simultaneously on the identical set of memory blocks and process requests.
            </p>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="rounded-xl border border-zinc-800 overflow-hidden bg-zinc-950 shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4 text-emerald-400">Successful Placements</th>
                <th className="py-3 px-4 text-rose-400">Failed Placements</th>
                <th className="py-3 px-4 text-blue-400">Allocated Memory</th>
                <th className="py-3 px-4 text-amber-400">Total Internal Fragmentation</th>
                <th className="py-3 px-4">Unallocated Process IDs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 font-mono text-xs">
              {results.map((res) => {
                const isWinner =
                  res.successfulAllocationsCount === maxAllocations &&
                  res.totalInternalFragmentation === minFragmentation;

                return (
                  <tr key={res.algorithm} className="hover:bg-zinc-800/40 transition">
                    <td className="py-3 px-4 font-sans font-bold text-zinc-200 flex items-center gap-2">
                      <span>{res.algorithmName}</span>
                      {isWinner && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          <Trophy className="w-3 h-3 text-amber-400" />
                          Optimal
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-emerald-300 font-bold">
                      {res.successfulAllocationsCount} / {res.allocations.length}
                    </td>
                    <td className="py-3 px-4 text-rose-300">
                      {res.failedAllocationsCount}
                    </td>
                    <td className="py-3 px-4 text-blue-300">
                      {res.totalAllocatedMemory} KB
                    </td>
                    <td className="py-3 px-4 text-amber-300 font-bold">
                      {res.totalInternalFragmentation} KB
                    </td>
                    <td className="py-3 px-4 text-zinc-400 font-sans text-xs">
                      {res.unallocatedProcesses.length > 0
                        ? res.unallocatedProcesses.map((p) => p.id).join(', ')
                        : 'None (All Fitted)'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side-by-Side Memory Block Visualizers */}
      <div className="space-y-6">
        <h4 className="text-sm font-semibold text-zinc-200">
          Visual Partition Layout Comparison:
        </h4>

        {results.map((res) => (
          <div
            key={res.algorithm}
            className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-200">
                {res.algorithmName}
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                Allocated: <strong className="text-emerald-400">{res.successfulAllocationsCount}</strong> | Fragmentation: <strong className="text-amber-400">{res.totalInternalFragmentation} KB</strong>
              </span>
            </div>

            <MemoryBlockVisualizer
              blockStates={res.blockStates}
              algorithm={res.algorithm}
              nextFitPointer={res.nextFitLastIndex}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
