import React from 'react';
import { MemoryBlockState, MemoryAlgorithm } from '../../types/os';
import { Layers, Box, Check, XCircle, ArrowRight } from 'lucide-react';

interface MemoryBlockVisualizerProps {
  blockStates: MemoryBlockState[];
  algorithm: MemoryAlgorithm;
  nextFitPointer?: number;
}

export const MemoryBlockVisualizer: React.FC<MemoryBlockVisualizerProps> = ({
  blockStates,
  algorithm,
  nextFitPointer,
}) => {
  const totalMemory = blockStates.reduce((sum, b) => sum + b.size, 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Layers className="w-3.5 h-3.5" />
            Physical Memory Partitions Diagram
          </span>
          <span className="text-xs text-zinc-400">
            Total Capacity: <strong className="text-zinc-200">{totalMemory} KB</strong> across {blockStates.length} Blocks
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block"></span>
            <span>Allocated Process</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-amber-500/80 inline-block bg-[repeating-linear-gradient(45deg,#d97706_0,#d97706_4px,#b45309_4px,#b45309_8px)]"></span>
            <span>Internal Fragmentation</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-zinc-800 border border-zinc-700 inline-block"></span>
            <span>Free Block</span>
          </div>
          {algorithm === 'NEXT_FIT' && (
            <div className="flex items-center gap-1.5 text-purple-400">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping inline-block"></span>
              <span>Next Fit Search Pointer</span>
            </div>
          )}
        </div>
      </div>

      {/* Grid of Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {blockStates.map((block, idx) => {
          const isAllocated = block.isOccupied && block.allocatedProcessId !== null;
          const processSize = block.processSize || 0;
          const fragmentSize = block.internalFragmentation || 0;
          const processPercent = block.size > 0 ? (processSize / block.size) * 100 : 0;
          const fragmentPercent = block.size > 0 ? (fragmentSize / block.size) * 100 : 0;
          const isNextFitPointer = algorithm === 'NEXT_FIT' && nextFitPointer === idx;

          return (
            <div
              key={block.blockId}
              className={`relative rounded-xl border p-3 flex flex-col justify-between transition-all select-none ${
                isNextFitPointer
                  ? 'border-purple-500 bg-zinc-950 shadow-md shadow-purple-500/10 ring-1 ring-purple-500'
                  : 'border-zinc-800 bg-zinc-950/70 hover:border-zinc-700'
              }`}
            >
              {isNextFitPointer && (
                <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-purple-600 text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1 shadow">
                  <span>Search Start</span>
                </div>
              )}

              {/* Block Header */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800/80">
                <div className="flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs font-bold text-zinc-200">
                    Block {block.blockId}
                  </span>
                </div>
                <span className="text-xs font-mono text-zinc-400">
                  {block.size} KB
                </span>
              </div>

              {/* Visual Proportion Bar */}
              <div className="my-3 space-y-1">
                <div className="h-10 w-full rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900 flex">
                  {isAllocated ? (
                    <>
                      {/* Process chunk */}
                      <div
                        style={{ width: `${processPercent}%` }}
                        className="bg-blue-600 flex flex-col items-center justify-center text-white text-[10px] font-bold tracking-tight px-1 overflow-hidden"
                        title={`Process ${block.allocatedProcessId} (${processSize} KB)`}
                      >
                        <span className="truncate">{block.allocatedProcessId}</span>
                        <span className="text-[9px] opacity-80">{processSize}K</span>
                      </div>

                      {/* Internal Fragmentation chunk */}
                      {fragmentSize > 0 && (
                        <div
                          style={{ width: `${fragmentPercent}%` }}
                          className="bg-amber-600/70 bg-[repeating-linear-gradient(45deg,#d97706_0,#d97706_4px,#b45309_4px,#b45309_8px)] flex flex-col items-center justify-center text-amber-200 text-[9px] font-mono px-1 overflow-hidden"
                          title={`Internal Fragmentation: ${fragmentSize} KB`}
                        >
                          <span className="truncate">Frag</span>
                          <span>{fragmentSize}K</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-400 text-xs font-medium">
                      Free Block
                    </div>
                  )}
                </div>

                <div className="flex justify-between text-[10px] text-zinc-400 font-mono">
                  <span>0 KB</span>
                  <span>{block.size} KB</span>
                </div>
              </div>

              {/* Block Status Footer */}
              <div className="pt-2 border-t border-zinc-800/60 text-xs">
                {isAllocated ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Allocated:</span>
                      <strong className="text-blue-400 font-mono">
                        {block.allocatedProcessId} ({processSize} KB)
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-400">Int. Fragment:</span>
                      <strong className="text-amber-400 font-mono">
                        {fragmentSize} KB
                      </strong>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-zinc-400">
                    <span>Status:</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-300">
                      Unallocated Slot
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
