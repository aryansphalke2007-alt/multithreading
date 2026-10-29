import {
  MemoryBlock,
  MemoryProcess,
  MemoryAllocationResult,
  MemoryAlgorithm,
  ProcessAllocation,
  MemoryBlockState,
} from '../types/os';

/**
 * 1. First Fit
 * Allocates each process to the first available block large enough.
 */
export function simulateFirstFit(
  blocks: MemoryBlock[],
  processes: MemoryProcess[]
): MemoryAllocationResult {
  const blockStates: MemoryBlockState[] = blocks.map((b) => ({
    blockId: b.id,
    size: b.size,
    allocatedProcessId: null,
    processSize: null,
    internalFragmentation: null,
    isOccupied: false,
  }));

  const allocations: ProcessAllocation[] = [];
  const unallocatedProcesses: MemoryProcess[] = [];

  for (const proc of processes) {
    let allocated = false;

    for (let i = 0; i < blockStates.length; i++) {
      const block = blockStates[i];
      if (!block.isOccupied && block.size >= proc.size) {
        block.isOccupied = true;
        block.allocatedProcessId = proc.id;
        block.processSize = proc.size;
        block.internalFragmentation = block.size - proc.size;

        allocations.push({
          processId: proc.id,
          processSize: proc.size,
          allocatedBlockId: block.blockId,
          allocatedBlockOriginalSize: block.size,
          internalFragmentation: block.size - proc.size,
          isAllocated: true,
        });
        allocated = true;
        break;
      }
    }

    if (!allocated) {
      allocations.push({
        processId: proc.id,
        processSize: proc.size,
        allocatedBlockId: null,
        allocatedBlockOriginalSize: null,
        internalFragmentation: null,
        isAllocated: false,
      });
      unallocatedProcesses.push(proc);
    }
  }

  return computeMemorySummary('FIRST_FIT', 'First Fit Allocation', blockStates, allocations, unallocatedProcesses);
}

/**
 * 2. Best Fit
 * Allocates each process to the smallest available block large enough.
 */
export function simulateBestFit(
  blocks: MemoryBlock[],
  processes: MemoryProcess[]
): MemoryAllocationResult {
  const blockStates: MemoryBlockState[] = blocks.map((b) => ({
    blockId: b.id,
    size: b.size,
    allocatedProcessId: null,
    processSize: null,
    internalFragmentation: null,
    isOccupied: false,
  }));

  const allocations: ProcessAllocation[] = [];
  const unallocatedProcesses: MemoryProcess[] = [];

  for (const proc of processes) {
    let bestBlockIndex = -1;
    let minDiff = Infinity;

    for (let i = 0; i < blockStates.length; i++) {
      const block = blockStates[i];
      if (!block.isOccupied && block.size >= proc.size) {
        const diff = block.size - proc.size;
        if (diff < minDiff) {
          minDiff = diff;
          bestBlockIndex = i;
        }
      }
    }

    if (bestBlockIndex !== -1) {
      const block = blockStates[bestBlockIndex];
      block.isOccupied = true;
      block.allocatedProcessId = proc.id;
      block.processSize = proc.size;
      block.internalFragmentation = block.size - proc.size;

      allocations.push({
        processId: proc.id,
        processSize: proc.size,
        allocatedBlockId: block.blockId,
        allocatedBlockOriginalSize: block.size,
        internalFragmentation: block.size - proc.size,
        isAllocated: true,
      });
    } else {
      allocations.push({
        processId: proc.id,
        processSize: proc.size,
        allocatedBlockId: null,
        allocatedBlockOriginalSize: null,
        internalFragmentation: null,
        isAllocated: false,
      });
      unallocatedProcesses.push(proc);
    }
  }

  return computeMemorySummary('BEST_FIT', 'Best Fit Allocation', blockStates, allocations, unallocatedProcesses);
}

/**
 * 3. Next Fit
 * Starts search from position after previous successful allocation, wrapping around.
 */
export function simulateNextFit(
  blocks: MemoryBlock[],
  processes: MemoryProcess[]
): MemoryAllocationResult {
  const blockStates: MemoryBlockState[] = blocks.map((b) => ({
    blockId: b.id,
    size: b.size,
    allocatedProcessId: null,
    processSize: null,
    internalFragmentation: null,
    isOccupied: false,
  }));

  const allocations: ProcessAllocation[] = [];
  const unallocatedProcesses: MemoryProcess[] = [];
  const n = blockStates.length;
  let searchPointer = 0;

  for (const proc of processes) {
    if (n === 0) {
      allocations.push({
        processId: proc.id,
        processSize: proc.size,
        allocatedBlockId: null,
        allocatedBlockOriginalSize: null,
        internalFragmentation: null,
        isAllocated: false,
      });
      unallocatedProcesses.push(proc);
      continue;
    }

    let allocated = false;
    // Check up to n blocks starting at searchPointer
    for (let step = 0; step < n; step++) {
      const index = (searchPointer + step) % n;
      const block = blockStates[index];

      if (!block.isOccupied && block.size >= proc.size) {
        block.isOccupied = true;
        block.allocatedProcessId = proc.id;
        block.processSize = proc.size;
        block.internalFragmentation = block.size - proc.size;

        allocations.push({
          processId: proc.id,
          processSize: proc.size,
          allocatedBlockId: block.blockId,
          allocatedBlockOriginalSize: block.size,
          internalFragmentation: block.size - proc.size,
          isAllocated: true,
        });

        // Next search begins at (index + 1) % n
        searchPointer = (index + 1) % n;
        allocated = true;
        break;
      }
    }

    if (!allocated) {
      allocations.push({
        processId: proc.id,
        processSize: proc.size,
        allocatedBlockId: null,
        allocatedBlockOriginalSize: null,
        internalFragmentation: null,
        isAllocated: false,
      });
      unallocatedProcesses.push(proc);
    }
  }

  const res = computeMemorySummary('NEXT_FIT', 'Next Fit Allocation', blockStates, allocations, unallocatedProcesses);
  res.nextFitLastIndex = searchPointer;
  return res;
}

/**
 * Common summary calculator
 */
function computeMemorySummary(
  algorithm: MemoryAlgorithm,
  algorithmName: string,
  blockStates: MemoryBlockState[],
  allocations: ProcessAllocation[],
  unallocatedProcesses: MemoryProcess[]
): MemoryAllocationResult {
  const totalAllocatedMemory = allocations
    .filter((a) => a.isAllocated)
    .reduce((sum, a) => sum + a.processSize, 0);

  // Internal fragmentation is ONLY for occupied blocks!
  const totalInternalFragmentation = blockStates
    .filter((b) => b.isOccupied && b.internalFragmentation !== null)
    .reduce((sum, b) => sum + (b.internalFragmentation ?? 0), 0);

  const successfulAllocationsCount = allocations.filter((a) => a.isAllocated).length;
  const failedAllocationsCount = allocations.filter((a) => !a.isAllocated).length;
  const totalMemoryAvailable = blockStates.reduce((sum, b) => sum + b.size, 0);

  return {
    algorithm,
    algorithmName,
    blockStates,
    allocations,
    unallocatedProcesses,
    totalAllocatedMemory,
    totalInternalFragmentation,
    successfulAllocationsCount,
    failedAllocationsCount,
    totalMemoryAvailable,
  };
}

export function runMemoryAlgorithm(
  algorithm: MemoryAlgorithm,
  blocks: MemoryBlock[],
  processes: MemoryProcess[]
): MemoryAllocationResult {
  switch (algorithm) {
    case 'FIRST_FIT':
      return simulateFirstFit(blocks, processes);
    case 'BEST_FIT':
      return simulateBestFit(blocks, processes);
    case 'NEXT_FIT':
      return simulateNextFit(blocks, processes);
    default:
      return simulateFirstFit(blocks, processes);
  }
}
