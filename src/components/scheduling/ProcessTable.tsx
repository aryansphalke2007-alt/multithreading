import React, { useState } from 'react';
import { Process } from '../../types/os';
import { PROCESS_COLORS, CPU_PRESETS } from '../../data/presets';
import {
  Plus,
  Trash2,
  RotateCcw,
  Sliders,
  Layers,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface ProcessTableProps {
  processes: Process[];
  onChangeProcesses: (processes: Process[]) => void;
  quantum: number;
  onChangeQuantum: (q: number) => void;
  showQuantum: boolean;
}

export const ProcessTable: React.FC<ProcessTableProps> = ({
  processes,
  onChangeProcesses,
  quantum,
  onChangeQuantum,
  showQuantum,
}) => {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // New process input state
  const [newId, setNewId] = useState(`P${processes.length + 1}`);
  const [newArrival, setNewArrival] = useState(0);
  const [newBurst, setNewBurst] = useState(4);
  const [newPriority, setNewPriority] = useState(1);

  const handleAddProcess = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedId = newId.trim() || `P${processes.length + 1}`;
    if (processes.some((p) => p.id.toLowerCase() === trimmedId.toLowerCase())) {
      setErrorMsg(`Process ID "${trimmedId}" already exists. Please choose a unique ID.`);
      return;
    }
    if (newArrival < 0) {
      setErrorMsg('Arrival Time must be non-negative (>= 0).');
      return;
    }
    if (newBurst <= 0) {
      setErrorMsg('Burst Time must be positive (> 0).');
      return;
    }
    if (newPriority < 0) {
      setErrorMsg('Priority must be non-negative (>= 0).');
      return;
    }

    const nextColor =
      PROCESS_COLORS[processes.length % PROCESS_COLORS.length] || '#3b82f6';

    const newProc: Process = {
      id: trimmedId,
      arrivalTime: Number(newArrival),
      burstTime: Number(newBurst),
      priority: Number(newPriority),
      color: nextColor,
    };

    const updated = [...processes, newProc];
    onChangeProcesses(updated);

    // Auto prep next ID
    setNewId(`P${updated.length + 1}`);
  };

  const handleDeleteProcess = (id: string) => {
    if (processes.length <= 1) {
      setErrorMsg('At least one process is required for simulation.');
      return;
    }
    onChangeProcesses(processes.filter((p) => p.id !== id));
  };

  const handleUpdateProcess = (
    id: string,
    field: 'arrivalTime' | 'burstTime' | 'priority',
    value: number
  ) => {
    setErrorMsg(null);
    if (field === 'burstTime' && value <= 0) {
      setErrorMsg('Burst Time must be at least 1.');
      return;
    }
    if ((field === 'arrivalTime' || field === 'priority') && value < 0) {
      setErrorMsg('Value cannot be negative.');
      return;
    }

    const updated = processes.map((p) => {
      if (p.id === id) {
        return { ...p, [field]: value };
      }
      return p;
    });
    onChangeProcesses(updated);
  };

  const handleLoadPreset = (presetIndex: number) => {
    const selected = CPU_PRESETS[presetIndex];
    if (selected) {
      onChangeProcesses(selected.processes);
      onChangeQuantum(selected.quantum);
      setNewId(`P${selected.processes.length + 1}`);
      setErrorMsg(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header: Presets and Quantum Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
            Workload Presets:
          </span>
          <select
            onChange={(e) => handleLoadPreset(Number(e.target.value))}
            className="text-xs bg-zinc-950 border border-zinc-700 text-zinc-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
          >
            {CPU_PRESETS.map((pr, idx) => (
              <option key={pr.name} value={idx}>
                {pr.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          {showQuantum && (
            <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 px-3 py-1.5 rounded-lg">
              <Sliders className="w-4 h-4 text-blue-400" />
              <label htmlFor="rr-quantum-input" className="text-xs text-blue-200 font-medium">Time Quantum (Q):</label>
              <input
                id="rr-quantum-input"
                type="number"
                min="1"
                max="50"
                value={quantum}
                onChange={(e) => onChangeQuantum(Math.max(1, Number(e.target.value)))}
                className="w-16 px-2 py-0.5 text-xs font-mono bg-zinc-950 text-blue-300 border border-blue-500/40 rounded focus:outline-none"
              />
            </div>
          )}

          <button
            onClick={() => handleLoadPreset(0)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 px-2.5 py-1.5 rounded-lg border border-zinc-700 bg-zinc-800/60 transition"
            title="Reset to default textbook workload"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 text-xs rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Process Table */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden shadow">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-zinc-950/80 border-b border-zinc-800 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                <th className="py-2.5 px-4">PID</th>
                <th className="py-2.5 px-4">Arrival Time (AT)</th>
                <th className="py-2.5 px-4">Burst Time (BT)</th>
                <th className="py-2.5 px-4">
                  <div className="flex items-center gap-1">
                    <span>Priority</span>
                    <span
                      title="Lower number indicates higher priority (e.g. 1 is higher than 3)"
                      className="cursor-help"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-zinc-400" />
                    </span>
                  </div>
                </th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {processes.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-800/30 transition">
                  <td className="py-2 px-4 font-mono font-medium text-zinc-200">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: p.color || '#3b82f6' }}
                      />
                      <span>{p.id}</span>
                    </div>
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      min="0"
                      value={p.arrivalTime}
                      onChange={(e) =>
                        handleUpdateProcess(p.id, 'arrivalTime', Number(e.target.value))
                      }
                      className="w-24 px-2.5 py-1 text-xs font-mono bg-zinc-950 text-zinc-200 border border-zinc-700 rounded-md focus:border-blue-500 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      min="1"
                      value={p.burstTime}
                      onChange={(e) =>
                        handleUpdateProcess(p.id, 'burstTime', Number(e.target.value))
                      }
                      className="w-24 px-2.5 py-1 text-xs font-mono bg-zinc-950 text-zinc-200 border border-zinc-700 rounded-md focus:border-blue-500 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="number"
                      min="0"
                      value={p.priority}
                      onChange={(e) =>
                        handleUpdateProcess(p.id, 'priority', Number(e.target.value))
                      }
                      className="w-24 px-2.5 py-1 text-xs font-mono bg-zinc-950 text-zinc-200 border border-zinc-700 rounded-md focus:border-blue-500 focus:outline-none"
                    />
                  </td>
                  <td className="py-2 px-4 text-right">
                    <button
                      onClick={() => handleDeleteProcess(p.id)}
                      disabled={processes.length <= 1}
                      className="text-zinc-500 hover:text-rose-400 disabled:opacity-30 disabled:cursor-not-allowed transition p-1"
                      title="Remove process"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Process Form Strip */}
        <form
          onSubmit={handleAddProcess}
          className="p-3.5 bg-zinc-950/90 border-t border-zinc-800 flex flex-wrap items-center gap-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-zinc-400">Add Process:</span>
            <input
              type="text"
              placeholder="PID (e.g. P6)"
              value={newId}
              onChange={(e) => setNewId(e.target.value)}
              className="w-24 px-2.5 py-1 text-xs font-mono bg-zinc-900 border border-zinc-700 text-zinc-200 rounded focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-zinc-400">AT:</label>
            <input
              type="number"
              min="0"
              value={newArrival}
              onChange={(e) => setNewArrival(Number(e.target.value))}
              className="w-20 px-2 py-1 text-xs font-mono bg-zinc-900 border border-zinc-700 text-zinc-200 rounded focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-zinc-400">BT:</label>
            <input
              type="number"
              min="1"
              value={newBurst}
              onChange={(e) => setNewBurst(Number(e.target.value))}
              className="w-20 px-2 py-1 text-xs font-mono bg-zinc-900 border border-zinc-700 text-zinc-200 rounded focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-zinc-400">Prio:</label>
            <input
              type="number"
              min="0"
              value={newPriority}
              onChange={(e) => setNewPriority(Number(e.target.value))}
              className="w-20 px-2 py-1 text-xs font-mono bg-zinc-900 border border-zinc-700 text-zinc-200 rounded focus:border-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition shadow ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Process</span>
          </button>
        </form>
      </div>
    </div>
  );
};
