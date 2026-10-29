import React, { useState } from 'react';
import { MemoryBlock, MemoryProcess } from '../../types/os';
import { MEMORY_PRESETS } from '../../data/presets';
import {
  Plus,
  Trash2,
  RotateCcw,
  Layers,
  Box,
  Cpu,
  AlertCircle,
} from 'lucide-react';

interface MemoryTablesProps {
  blocks: MemoryBlock[];
  onChangeBlocks: (blocks: MemoryBlock[]) => void;
  processes: MemoryProcess[];
  onChangeProcesses: (procs: MemoryProcess[]) => void;
  onReset: () => void;
}

export const MemoryTables: React.FC<MemoryTablesProps> = ({
  blocks,
  onChangeBlocks,
  processes,
  onChangeProcesses,
  onReset,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New block form
  const [newBlockSize, setNewBlockSize] = useState<number>(250);

  // New process form
  const [newProcId, setNewProcId] = useState<string>(`P${processes.length + 1}`);
  const [newProcSize, setNewProcSize] = useState<number>(150);

  const handleAddBlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (newBlockSize <= 0) {
      setErrorMsg('Memory Block size must be greater than 0 KB.');
      return;
    }
    const nextId = blocks.length > 0 ? Math.max(...blocks.map((b) => b.id)) + 1 : 1;
    onChangeBlocks([...blocks, { id: nextId, size: Number(newBlockSize) }]);
  };

  const handleDeleteBlock = (id: number) => {
    if (blocks.length <= 1) {
      setErrorMsg('At least one memory block is required.');
      return;
    }
    onChangeBlocks(blocks.filter((b) => b.id !== id));
  };

  const handleUpdateBlockSize = (id: number, size: number) => {
    setErrorMsg(null);
    if (size <= 0) {
      setErrorMsg('Block size must be greater than 0.');
      return;
    }
    onChangeBlocks(blocks.map((b) => (b.id === id ? { ...b, size } : b)));
  };

  const handleAddProcess = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const trimmed = newProcId.trim() || `P${processes.length + 1}`;
    if (processes.some((p) => p.id.toLowerCase() === trimmed.toLowerCase())) {
      setErrorMsg(`Process "${trimmed}" already exists.`);
      return;
    }
    if (newProcSize <= 0) {
      setErrorMsg('Process size must be greater than 0 KB.');
      return;
    }
    const updated = [...processes, { id: trimmed, size: Number(newProcSize) }];
    onChangeProcesses(updated);
    setNewProcId(`P${updated.length + 1}`);
  };

  const handleDeleteProcess = (id: string) => {
    if (processes.length <= 1) {
      setErrorMsg('At least one process is required.');
      return;
    }
    onChangeProcesses(processes.filter((p) => p.id !== id));
  };

  const handleUpdateProcessSize = (id: string, size: number) => {
    setErrorMsg(null);
    if (size <= 0) {
      setErrorMsg('Process size must be greater than 0.');
      return;
    }
    onChangeProcesses(processes.map((p) => (p.id === id ? { ...p, size } : p)));
  };

  const handleLoadPreset = (index: number) => {
    const preset = MEMORY_PRESETS[index];
    if (preset) {
      onChangeBlocks(preset.blocks);
      onChangeProcesses(preset.processes);
      setNewProcId(`P${preset.processes.length + 1}`);
      setErrorMsg(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Workload Presets & Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Memory Scenarios:
          </span>
          <select
            onChange={(e) => handleLoadPreset(Number(e.target.value))}
            className="text-xs bg-zinc-950 border border-zinc-700 text-zinc-200 rounded-lg px-2.5 py-1.5 focus:border-blue-500 focus:outline-none"
          >
            {MEMORY_PRESETS.map((p, idx) => (
              <option key={p.name} value={idx}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800/60 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Two Column Layout for Blocks and Processes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Column 1: Memory Blocks */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4 text-blue-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                  Memory Blocks ({blocks.length})
                </h4>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Sum: {blocks.reduce((s, b) => s + b.size, 0)} KB
              </span>
            </div>

            <div className="p-3 max-h-60 overflow-y-auto divide-y divide-zinc-800/60">
              {blocks.map((b) => (
                <div key={b.id} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-300 font-mono">
                      Block {b.id}:
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={b.size}
                      onChange={(e) => handleUpdateBlockSize(b.id, Number(e.target.value))}
                      className="w-20 px-2 py-0.5 text-xs font-mono bg-zinc-950 border border-zinc-700 text-zinc-200 rounded focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-zinc-500">KB</span>
                  </div>

                  <button
                    onClick={() => handleDeleteBlock(b.id)}
                    disabled={blocks.length <= 1}
                    className="text-zinc-500 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed p-1 transition"
                    title="Delete block"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Block Form */}
          <form
            onSubmit={handleAddBlock}
            className="p-3 bg-zinc-950/90 border-t border-zinc-800 flex items-center gap-2 text-xs"
          >
            <span className="text-zinc-400">New Block:</span>
            <input
              type="number"
              min="1"
              value={newBlockSize}
              onChange={(e) => setNewBlockSize(Number(e.target.value))}
              placeholder="Size KB"
              className="w-24 px-2 py-1 font-mono bg-zinc-900 border border-zinc-700 text-zinc-200 rounded focus:border-blue-500 focus:outline-none"
            />
            <span className="text-zinc-500">KB</span>
            <button
              type="submit"
              className="ml-auto flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded transition font-medium"
            >
              <Plus className="w-3 h-3" />
              <span>Add Block</span>
            </button>
          </form>
        </div>

        {/* Column 2: Memory Processes */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/70">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-200">
                  Process Requirements ({processes.length})
                </h4>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                Sum: {processes.reduce((s, p) => s + p.size, 0)} KB
              </span>
            </div>

            <div className="p-3 max-h-60 overflow-y-auto divide-y divide-zinc-800/60">
              {processes.map((p) => (
                <div key={p.id} className="py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-zinc-300 font-mono w-10">
                      {p.id}:
                    </span>
                    <input
                      type="number"
                      min="1"
                      value={p.size}
                      onChange={(e) => handleUpdateProcessSize(p.id, Number(e.target.value))}
                      className="w-20 px-2 py-0.5 text-xs font-mono bg-zinc-950 border border-zinc-700 text-zinc-200 rounded focus:border-blue-500 focus:outline-none"
                    />
                    <span className="text-zinc-500">KB</span>
                  </div>

                  <button
                    onClick={() => handleDeleteProcess(p.id)}
                    disabled={processes.length <= 1}
                    className="text-zinc-500 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed p-1 transition"
                    title="Delete process"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Add Process Form */}
          <form
            onSubmit={handleAddProcess}
            className="p-3 bg-zinc-950/90 border-t border-zinc-800 flex items-center gap-2 text-xs"
          >
            <input
              type="text"
              value={newProcId}
              onChange={(e) => setNewProcId(e.target.value)}
              placeholder="PID"
              className="w-16 px-2 py-1 font-mono bg-zinc-900 border border-zinc-700 text-zinc-200 rounded focus:border-blue-500 focus:outline-none"
            />
            <input
              type="number"
              min="1"
              value={newProcSize}
              onChange={(e) => setNewProcSize(Number(e.target.value))}
              placeholder="Size KB"
              className="w-20 px-2 py-1 font-mono bg-zinc-900 border border-zinc-700 text-zinc-200 rounded focus:border-blue-500 focus:outline-none"
            />
            <span className="text-zinc-500">KB</span>
            <button
              type="submit"
              className="ml-auto flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded transition font-medium"
            >
              <Plus className="w-3 h-3" />
              <span>Add Process</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
