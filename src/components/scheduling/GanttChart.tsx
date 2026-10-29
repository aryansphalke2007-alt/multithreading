import React from 'react';
import { GanttSegment, Process } from '../../types/os';
import { Clock, PauseCircle, PlayCircle } from 'lucide-react';

interface GanttChartProps {
  segments: GanttSegment[];
  processes: Process[];
}

export const GanttChart: React.FC<GanttChartProps> = ({ segments, processes }) => {
  if (segments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-dashed border-zinc-700 rounded-xl bg-zinc-900/50 text-zinc-400">
        <Clock className="w-8 h-8 mb-2 text-zinc-500" />
        <p className="text-sm">No scheduling data to render. Run simulation to view Gantt chart.</p>
      </div>
    );
  }

  const totalTime = segments[segments.length - 1]?.endTime || 0;

  // Map process ID to color
  const colorMap = new Map<string, string>();
  processes.forEach((p, idx) => {
    colorMap.set(p.id, p.color || '#3b82f6');
  });

  // Track segment counts to label preemptions
  const processAppearanceCount = new Map<string, number>();

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <PlayCircle className="w-3.5 h-3.5" />
            Execution Timeline (Gantt Chart)
          </span>
          <span className="text-xs text-zinc-400">
            Total Span: <strong className="text-zinc-200">{totalTime} units</strong> ({segments.length} segment{segments.length > 1 ? 's' : ''})
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-zinc-700 border border-zinc-600 inline-block bg-stripes"></span>
            <span>CPU Idle</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block"></span>
            <span>Process Slice</span>
          </div>
        </div>
      </div>

      {/* Gantt Bar Visualizer */}
      <div className="overflow-x-auto pb-4 pt-1">
        <div className="min-w-[680px]">
          {/* Main Segment Strip */}
          <div className="flex h-16 w-full rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 shadow-inner">
            {segments.map((seg, idx) => {
              const duration = seg.endTime - seg.startTime;
              const widthPercent = totalTime > 0 ? (duration / totalTime) * 100 : 0;
              const isIdle = seg.processId === 'IDLE';

              const currentCount = (processAppearanceCount.get(seg.processId) || 0) + 1;
              processAppearanceCount.set(seg.processId, currentCount);
              const isPreemptedResumed = !isIdle && currentCount > 1;

              const bgColor = isIdle ? 'transparent' : colorMap.get(seg.processId) || '#3b82f6';

              return (
                <div
                  key={`${seg.processId}-${seg.startTime}-${idx}`}
                  style={{
                    width: `${Math.max(widthPercent, 2.5)}%`,
                    backgroundColor: isIdle ? undefined : bgColor,
                  }}
                  className={`relative flex flex-col items-center justify-center border-r border-zinc-900/60 transition-all group select-none ${
                    isIdle
                      ? 'bg-zinc-800/60 bg-[repeating-linear-gradient(45deg,#27272a_0,#27272a_6px,#18181b_6px,#18181b_12px)] text-zinc-400'
                      : 'text-white font-medium hover:brightness-110 shadow-sm'
                  }`}
                  title={`${seg.processId}: [${seg.startTime} -> ${seg.endTime}] (Duration: ${duration})`}
                >
                  <div className="flex items-center gap-1 text-xs font-bold tracking-wide drop-shadow">
                    {seg.processId}
                    {isPreemptedResumed && (
                      <span className="text-[10px] px-1 py-0.2 bg-black/40 rounded text-amber-300 font-mono" title="Resumed after preemption">
                        #{currentCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] opacity-80 font-mono">
                    Δ {duration}
                  </span>

                  {/* Tooltip on hover */}
                  <div className="absolute -top-10 hidden group-hover:flex z-20 px-2 py-1 bg-zinc-900 text-zinc-200 border border-zinc-700 text-[11px] rounded shadow-lg whitespace-nowrap pointer-events-none">
                    {isIdle ? 'CPU IDLE' : `Process ${seg.processId}`} | Time {seg.startTime} to {seg.endTime} (Δ{duration})
                  </div>
                </div>
              );
            })}
          </div>

          {/* Timestamp Numbers Below Gantt */}
          <div className="relative flex w-full text-[11px] font-mono text-zinc-400 mt-1 select-none">
            {segments.map((seg, idx) => {
              const duration = seg.endTime - seg.startTime;
              const widthPercent = totalTime > 0 ? (duration / totalTime) * 100 : 0;
              const isLast = idx === segments.length - 1;

              return (
                <div
                  key={`time-${idx}`}
                  style={{ width: `${Math.max(widthPercent, 2.5)}%` }}
                  className="relative flex justify-between px-0.5"
                >
                  <span className="inline-block -ml-1 text-zinc-500 font-medium">
                    {seg.startTime}
                  </span>
                  {isLast && (
                    <span className="absolute right-0 text-emerald-400 font-bold">
                      {seg.endTime}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Segment Breakdown Chips */}
      <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-zinc-800/60">
        <span className="text-xs text-zinc-400 font-medium mr-1">Time Slices:</span>
        {segments.map((seg, idx) => {
          const isIdle = seg.processId === 'IDLE';
          return (
            <span
              key={`chip-${idx}`}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono border ${
                isIdle
                  ? 'bg-zinc-800/80 border-zinc-700 text-zinc-400'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-200'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isIdle ? '#71717a' : colorMap.get(seg.processId) || '#3b82f6' }}
              />
              <strong className={isIdle ? 'text-zinc-400' : 'text-blue-400'}>{seg.processId}</strong>
              <span className="text-zinc-500">[{seg.startTime}→{seg.endTime}]</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};
