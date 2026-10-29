import React from 'react';
import {
  Cpu,
  Layers,
  ShieldCheck,
  BookOpen,
  Clock,
  HardDrive,
  Activity,
  Code2,
  CheckCircle2,
} from 'lucide-react';

export const AboutTab: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Intro Hero */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-blue-950/30 border border-zinc-800 shadow-xl space-y-3">
        <div className="flex items-center gap-2.5 text-blue-400">
          <BookOpen className="w-5 h-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Operating Systems Reference Manual
          </span>
        </div>
        <h2 className="text-2xl font-bold text-zinc-100">
          OS Algorithm Simulator & Multi-Core Concurrency Lab
        </h2>
        <p className="text-sm text-zinc-300 leading-relaxed">
          An interactive laboratory built to explore fundamental Operating System principles:
          CPU scheduling with preemption and Gantt charting, contiguous fixed/variable memory
          partitioning with internal fragmentation analysis, and true multi-threaded background
          worker execution.
        </p>
      </div>

      {/* Multithreading Section */}
      <div className="p-6 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-4 shadow-lg">
        <div className="flex items-center gap-2.5 text-emerald-400">
          <Cpu className="w-5 h-5" />
          <h3 className="text-base font-bold text-zinc-100">
            Multithreading Architecture & Thread Safety
          </h3>
        </div>
        <p className="text-sm text-zinc-300 leading-relaxed">
          JavaScript in browsers natively runs on a single event loop thread. To satisfy authentic
          Operating System multithreading requirements, this simulator avoids fake asynchronous
          delays and instead provisions actual OS threads:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs uppercase tracking-wider">
              <Code2 className="w-4 h-4" />
              <span>Browser Web Workers</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Spawns independent OS threads managed by the browser runtime. Each worker thread runs
              its own JavaScript global context and execution queue without contending with the DOM
              or UI thread.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Zero-Race Memory Isolation</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Worker threads communicate via message-passing using the{' '}
              <strong className="text-zinc-300">Structured Clone Algorithm</strong>. Deep copies of
              the process array are transferred, guaranteeing that concurrent algorithm executions
              never corrupt shared state or suffer from race conditions.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-900/40 text-xs text-zinc-300 space-y-2">
          <strong className="text-blue-300">Parallel Execution & Barrier Synchronization:</strong>
          <p className="text-zinc-400 leading-relaxed">
            When you trigger the <strong className="text-zinc-200">Concurrent Multi-Thread Benchmark</strong>,
            all 6 algorithms are mapped across 6 separate worker threads simultaneously. The main
            thread sets an asynchronous join barrier (<code className="text-blue-300 font-mono">Promise.all</code>),
            suspending metric rendering until every worker reports thread completion.
          </p>
        </div>
      </div>

      {/* CPU Scheduling Algorithms Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-blue-400">
          <Activity className="w-5 h-5" />
          <h3 className="text-lg font-bold text-zinc-100">CPU Scheduling Algorithms</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* FCFS */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-zinc-200">First Come First Serve (FCFS)</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">Non-Preemptive</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Processes are dispatched strictly according to arrival time. Once allocated CPU, a job
              runs to completion. Susceptible to the <em>convoy effect</em> where short jobs queue
              behind heavy burst jobs.
            </p>
            <div className="text-[11px] font-mono text-zinc-500 pt-1">
              Time Complexity: O(N log N) | Space: O(N)
            </div>
          </div>

          {/* SJF NP */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-zinc-200">Shortest Job First (SJF)</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">Non-Preemptive</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Selects the process with smallest burst time among all arrived uncompleted jobs. Once
              started, it cannot be interrupted. Minimizes average waiting time among non-preemptive
              schedulers.
            </p>
            <div className="text-[11px] font-mono text-zinc-500 pt-1">
              Time Complexity: O(N²) | Space: O(N)
            </div>
          </div>

          {/* SRTF */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-zinc-200">Shortest Remaining Time First (SRTF)</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">Preemptive SJF</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              At any point in time, the CPU runs the process with the shortest remaining burst time.
              If a new process arrives with a shorter burst than the current job's remaining time, the
              current job is preempted and returned to ready state.
            </p>
            <div className="text-[11px] font-mono text-zinc-500 pt-1">
              Time Complexity: O(N²) event driven | Space: O(N)
            </div>
          </div>

          {/* Priority NP */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-zinc-200">Priority Scheduling</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">Non-Preemptive</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Allocates CPU to the arrived process with highest priority (defined here as smallest integer
              value: 1 &gt; 2 &gt; 3). Once started, the job runs uninterrupted to finish.
            </p>
            <div className="text-[11px] font-mono text-zinc-500 pt-1">
              Tie-Breaker: Earlier Arrival Time → Lower PID
            </div>
          </div>

          {/* Priority P */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-zinc-200">Priority Scheduling</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-mono">Preemptive</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              The running process is immediately preempted whenever an arriving process possesses a
              strictly higher priority (smaller number). The preempted job retains its remaining
              burst time.
            </p>
            <div className="text-[11px] font-mono text-zinc-500 pt-1">
              Time Complexity: O(N²) | Space: O(N)
            </div>
          </div>

          {/* Round Robin */}
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-zinc-200">Round Robin (RR)</h4>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-mono">Time Quantum</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Fair-share scheduling where ready processes reside in a circular FIFO queue. Each job
              runs for at most time quantum <em>Q</em>. Newly arriving jobs enter the tail of the
              ready queue before any preempted job is re-enqueued.
            </p>
            <div className="text-[11px] font-mono text-zinc-500 pt-1">
              Time Complexity: O(Total Burst / Q) | Space: O(N)
            </div>
          </div>
        </div>
      </div>

      {/* Memory Allocation Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-emerald-400">
          <HardDrive className="w-5 h-5" />
          <h3 className="text-lg font-bold text-zinc-100">Contiguous Memory Allocation</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <h4 className="text-sm font-bold text-zinc-200">First Fit</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Scans memory from the very first block and places the process in the first available
              block whose capacity is at least equal to the process size. Fast search performance.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <h4 className="text-sm font-bold text-zinc-200">Best Fit</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Examines every available block and places the process in the smallest available block
              that is large enough. Leaves the smallest leftover hole, preserving large blocks for
              subsequent large requests.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2">
            <h4 className="text-sm font-bold text-zinc-200">Next Fit</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              A modified First Fit that continues searching from the block immediately following the
              previous successful allocation. Wraps around circularly to distribute allocations across
              memory.
            </p>
          </div>
        </div>
      </div>

      {/* Mathematical Reference Cheat Sheet */}
      <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800 space-y-3 shadow-lg">
        <h4 className="text-sm font-bold text-zinc-200 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-400" />
          <span>Formula & Metric Definitions Reference</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-amber-400 block font-bold mb-1">Turnaround Time (TAT)</span>
            <span className="text-zinc-200">TAT = Completion Time (CT) − Arrival Time (AT)</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-emerald-400 block font-bold mb-1">Waiting Time (WT)</span>
            <span className="text-zinc-200">WT = Turnaround Time (TAT) − Burst Time (BT)</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-cyan-400 block font-bold mb-1">Response Time (RT)</span>
            <span className="text-zinc-200">RT = First CPU Start Time − Arrival Time (AT)</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-blue-400 block font-bold mb-1">CPU Utilization</span>
            <span className="text-zinc-200">(Total Busy Time / Total Span) × 100%</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-purple-400 block font-bold mb-1">Internal Fragmentation</span>
            <span className="text-zinc-200">Allocated Block Size − Process Request Size</span>
          </div>

          <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-rose-400 block font-bold mb-1">Throughput</span>
            <span className="text-zinc-200">Completed Processes / Total Execution Time</span>
          </div>
        </div>
      </div>
    </div>
  );
};
