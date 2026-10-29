import React, { useState, useMemo } from 'react';
import {
  MemoryBlock,
  MemoryProcess,
  MemoryAlgorithm,
  MemoryAllocationResult,
} from '../../types/os';
import { MEMORY_PRESETS } from '../../data/presets';
import {
  runMemoryAlgorithm,
  simulateFirstFit,
  simulateBestFit,
  simulateNextFit,
} from '../../algorithms/memory';
import { MemoryBlockVisualizer } from './MemoryBlockVisualizer';
import { MemoryStatsCard } from './MemoryStatsCard';
import { MemoryTables } from './MemoryTables';
import { MemoryComparisonView } from './MemoryComparisonView';
import {
  Layers,
  RotateCcw,
  CheckCircle2,
  Box,
  Split,
  Info,
} from 'lucide-react';

export const MemoryAllocationTab: React.FC = () => {
  // Blocks and processes state initialized from textbook preset
  const [blocks, setBlocks] = useState<MemoryBlock[]>(MEMORY_PRESETS[0].blocks);
  const [processes, setProcesses] = useState<MemoryProcess[]>(MEMORY_PRESETS[0].processes);

  // Selected algorithm
  const [selectedAlgo, setSelectedAlgo] = useState<MemoryAlgorithm>('FIRST_FIT');

  // Compare mode toggle
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);

  // Dynamic simulation execution
  const currentResult: MemoryAllocationResult = useMemo(() => {
    return runMemoryAlgorithm(selectedAlgo, blocks, processes);
  }, [selectedAlgo, blocks, processes]);

  // All three simulation results for comparison view
  const comparisonResults = useMemo(() => {
    return {
      firstFit: simulateFirstFit(blocks, processes),
      bestFit: simulateBestFit(blocks, processes),
      nextFit: simulateNextFit(blocks, processes),
    };
  }, [blocks, processes]);

  const handleReset = () => {
    setBlocks(MEMORY_PRESETS[0].blocks);
    setProcesses(MEMORY_PRESETS[0].processes);
    setSelectedAlgo('FIRST_FIT');
    setIsCompareMode(false);
  };

  const algorithmOptions: { id: MemoryAlgorithm; name: string; tag: string; desc: string }[] = [
    {
      id: 'FIRST_FIT',
      name: 'First Fit',
      tag: 'Fast Search',
      desc: 'Allocates each process to the first available block large enough.',
    },
    {
      id: 'BEST_FIT',
      name: 'Best Fit',
      tag: 'Minimum Waste',
      desc: 'Allocates each process to the smallest available block that can accommodate it.',
    },
    {
      id: 'NEXT_FIT',
      name: 'Next Fit',
      tag: 'Wrap-Around Scan',
      desc: 'Starts search from the position after the previous successful allocation, wrapping around.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Algorithm Selector & Compare Mode Switch */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
          {algorithmOptions.map((algo) => {
            const isSelected = selectedAlgo === algo.id && !isCompareMode;
            return (
              <button
                key={algo.id}
                onClick={() => {
                  setSelectedAlgo(algo.id);
                  setIsCompareMode(false);
                }}
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

        {/* Compare All Button */}
        <button
          onClick={() => setIsCompareMode(!isCompareMode)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-xs font-semibold transition shrink-0 shadow-lg ${
            isCompareMode
              ? 'bg-purple-600 text-white border-purple-500 shadow-purple-600/20'
              : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-600 hover:text-white'
          }`}
        >
          <Split className="w-4 h-4" />
          <span>{isCompareMode ? 'Exit Comparison' : 'Compare All 3 Algorithms'}</span>
        </button>
      </div>

      {/* Model Assumption Callout */}
      <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-950/20 border border-blue-900/40 text-xs text-zinc-300">
        <Info className="w-4 h-4 text-blue-400 shrink-0" />
        <p>
          <strong className="text-blue-300">Partition Allocation Model:</strong> Each memory block
          is treated as an individual allocation slot holding at most one process. Internal
          fragmentation is strictly calculated as{' '}
          <code className="text-blue-300 font-mono">Allocated Block Size − Process Size</code>.
          Unallocated blocks remain free and are not counted as internal fragmentation.
        </p>
      </div>

      {/* View: Either Comparison View OR Single Algorithm View */}
      {isCompareMode ? (
        <MemoryComparisonView
          firstFitResult={comparisonResults.firstFit}
          bestFitResult={comparisonResults.bestFit}
          nextFitResult={comparisonResults.nextFit}
        />
      ) : (
        <>
          {/* Visual Memory Diagram */}
          <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
              <div>
                <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
                  <span>{currentResult.algorithmName}</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                    Memory Allocation Layout
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Visual partition map showing allocated process chunks, internal fragmentation holes, and free blocks.
                </p>
              </div>
            </div>

            <MemoryBlockVisualizer
              blockStates={currentResult.blockStates}
              algorithm={currentResult.algorithm}
              nextFitPointer={currentResult.nextFitLastIndex}
            />
          </div>

          {/* Stats & Allocation Table */}
          <MemoryStatsCard result={currentResult} />
        </>
      )}

      {/* Configuration & Inputs */}
      <div className="p-5 rounded-2xl border border-zinc-800 bg-zinc-900/80 shadow-lg space-y-3">
        <div>
          <h3 className="text-sm font-bold text-zinc-100">
            Memory Partitions & Process Requests Configuration
          </h3>
          <p className="text-xs text-zinc-400">
            Dynamically add, remove, or modify memory block sizes and process memory demands.
          </p>
        </div>

        <MemoryTables
          blocks={blocks}
          onChangeBlocks={setBlocks}
          processes={processes}
          onChangeProcesses={setProcesses}
          onReset={handleReset}
        />
      </div>
    </div>
  );
};
