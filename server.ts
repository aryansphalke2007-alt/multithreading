import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { Worker } from 'worker_threads';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isDev = process.env.NODE_ENV !== 'production';

  app.use(express.json());

  // Health check & threading info
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      engine: 'Node.js Express + worker_threads',
      pid: process.pid,
      uptime: process.uptime(),
      cpus: process.env.NUMBER_OF_PROCESSORS || 4,
    });
  });

  // Node.js Worker Thread simulation helper
  const runInNodeWorker = (algorithm: string, processes: any[], quantum: number, threadNum: number) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const workerCode = `
        const { parentPort, workerData, threadId } = require('worker_threads');
        
        function runAlgorithm(algo, procs, q) {
          // Internal simulation runner
          const states = procs.map((p, idx) => ({
            id: p.id,
            arrivalTime: Math.max(0, p.arrivalTime),
            burstTime: Math.max(1, p.burstTime),
            priority: p.priority,
            remainingBurst: Math.max(1, p.burstTime),
            firstStartTime: null,
            completionTime: 0,
            originalIndex: idx,
          }));

          const segments = [];
          let currentTime = 0;

          if (algo === 'FCFS') {
            states.sort((a, b) => a.arrivalTime !== b.arrivalTime ? a.arrivalTime - b.arrivalTime : a.originalIndex - b.originalIndex);
            for (const p of states) {
              if (currentTime < p.arrivalTime) {
                segments.push({ processId: 'IDLE', startTime: currentTime, endTime: p.arrivalTime });
                currentTime = p.arrivalTime;
              }
              p.firstStartTime = currentTime;
              const finish = currentTime + p.burstTime;
              segments.push({ processId: p.id, startTime: currentTime, endTime: finish });
              currentTime = finish;
              p.completionTime = finish;
            }
          } else if (algo === 'SJF_NP') {
            let completed = 0;
            const isCompleted = new Array(states.length).fill(false);
            while (completed < states.length) {
              let best = -1;
              for (let i = 0; i < states.length; i++) {
                if (!isCompleted[i] && states[i].arrivalTime <= currentTime) {
                  if (best === -1 || states[i].burstTime < states[best].burstTime ||
                     (states[i].burstTime === states[best].burstTime && states[i].arrivalTime < states[best].arrivalTime)) {
                    best = i;
                  }
                }
              }
              if (best === -1) {
                let nextArr = Infinity;
                for (let i = 0; i < states.length; i++) {
                  if (!isCompleted[i] && states[i].arrivalTime > currentTime) nextArr = Math.min(nextArr, states[i].arrivalTime);
                }
                if (nextArr !== Infinity) {
                  segments.push({ processId: 'IDLE', startTime: currentTime, endTime: nextArr });
                  currentTime = nextArr;
                }
                continue;
              }
              const p = states[best];
              p.firstStartTime = currentTime;
              const finish = currentTime + p.burstTime;
              segments.push({ processId: p.id, startTime: currentTime, endTime: finish });
              currentTime = finish;
              p.completionTime = finish;
              isCompleted[best] = true;
              completed++;
            }
          } else if (algo === 'SRTF') {
            let completed = 0;
            while (completed < states.length) {
              let best = -1;
              for (let i = 0; i < states.length; i++) {
                if (states[i].remainingBurst > 0 && states[i].arrivalTime <= currentTime) {
                  if (best === -1 || states[i].remainingBurst < states[best].remainingBurst ||
                     (states[i].remainingBurst === states[best].remainingBurst && states[i].arrivalTime < states[best].arrivalTime)) {
                    best = i;
                  }
                }
              }
              if (best === -1) {
                let nextArr = Infinity;
                for (let i = 0; i < states.length; i++) {
                  if (states[i].remainingBurst > 0 && states[i].arrivalTime > currentTime) nextArr = Math.min(nextArr, states[i].arrivalTime);
                }
                if (nextArr !== Infinity) {
                  segments.push({ processId: 'IDLE', startTime: currentTime, endTime: nextArr });
                  currentTime = nextArr;
                }
                continue;
              }
              const p = states[best];
              if (p.firstStartTime === null) p.firstStartTime = currentTime;
              let nextEvent = currentTime + p.remainingBurst;
              for (let i = 0; i < states.length; i++) {
                if (states[i].remainingBurst > 0 && states[i].arrivalTime > currentTime && states[i].arrivalTime < nextEvent) {
                  const currRem = p.remainingBurst - (states[i].arrivalTime - currentTime);
                  if (states[i].burstTime < currRem) nextEvent = states[i].arrivalTime;
                }
              }
              const dur = nextEvent - currentTime;
              segments.push({ processId: p.id, startTime: currentTime, endTime: nextEvent });
              p.remainingBurst -= dur;
              currentTime = nextEvent;
              if (p.remainingBurst === 0) { p.completionTime = currentTime; completed++; }
            }
          } else if (algo === 'PRIORITY_NP') {
            let completed = 0;
            const isCompleted = new Array(states.length).fill(false);
            while (completed < states.length) {
              let best = -1;
              for (let i = 0; i < states.length; i++) {
                if (!isCompleted[i] && states[i].arrivalTime <= currentTime) {
                  if (best === -1 || states[i].priority < states[best].priority ||
                     (states[i].priority === states[best].priority && states[i].arrivalTime < states[best].arrivalTime)) {
                    best = i;
                  }
                }
              }
              if (best === -1) {
                let nextArr = Infinity;
                for (let i = 0; i < states.length; i++) {
                  if (!isCompleted[i] && states[i].arrivalTime > currentTime) nextArr = Math.min(nextArr, states[i].arrivalTime);
                }
                if (nextArr !== Infinity) {
                  segments.push({ processId: 'IDLE', startTime: currentTime, endTime: nextArr });
                  currentTime = nextArr;
                }
                continue;
              }
              const p = states[best];
              p.firstStartTime = currentTime;
              const finish = currentTime + p.burstTime;
              segments.push({ processId: p.id, startTime: currentTime, endTime: finish });
              currentTime = finish;
              p.completionTime = finish;
              isCompleted[best] = true;
              completed++;
            }
          } else if (algo === 'PRIORITY_P') {
            let completed = 0;
            while (completed < states.length) {
              let best = -1;
              for (let i = 0; i < states.length; i++) {
                if (states[i].remainingBurst > 0 && states[i].arrivalTime <= currentTime) {
                  if (best === -1 || states[i].priority < states[best].priority ||
                     (states[i].priority === states[best].priority && states[i].arrivalTime < states[best].arrivalTime)) {
                    best = i;
                  }
                }
              }
              if (best === -1) {
                let nextArr = Infinity;
                for (let i = 0; i < states.length; i++) {
                  if (states[i].remainingBurst > 0 && states[i].arrivalTime > currentTime) nextArr = Math.min(nextArr, states[i].arrivalTime);
                }
                if (nextArr !== Infinity) {
                  segments.push({ processId: 'IDLE', startTime: currentTime, endTime: nextArr });
                  currentTime = nextArr;
                }
                continue;
              }
              const p = states[best];
              if (p.firstStartTime === null) p.firstStartTime = currentTime;
              let nextEvent = currentTime + p.remainingBurst;
              for (let i = 0; i < states.length; i++) {
                if (states[i].remainingBurst > 0 && states[i].arrivalTime > currentTime && states[i].arrivalTime < nextEvent) {
                  if (states[i].priority < p.priority) nextEvent = states[i].arrivalTime;
                }
              }
              const dur = nextEvent - currentTime;
              segments.push({ processId: p.id, startTime: currentTime, endTime: nextEvent });
              p.remainingBurst -= dur;
              currentTime = nextEvent;
              if (p.remainingBurst === 0) { p.completionTime = currentTime; completed++; }
            }
          } else if (algo === 'ROUND_ROBIN') {
            const timeQuantum = Math.max(1, q || 2);
            let completed = 0;
            const hasEntered = new Array(states.length).fill(false);
            const readyQueue = [];
            const enqueue = (limit) => {
              const cands = [];
              for (let i = 0; i < states.length; i++) {
                if (!hasEntered[i] && states[i].arrivalTime <= limit) cands.push(i);
              }
              cands.sort((a,b) => states[a].arrivalTime !== states[b].arrivalTime ? states[a].arrivalTime - states[b].arrivalTime : states[a].originalIndex - states[b].originalIndex);
              for (const idx of cands) { hasEntered[idx] = true; readyQueue.push(idx); }
            };
            enqueue(currentTime);
            while (completed < states.length) {
              if (readyQueue.length === 0) {
                let nextArr = Infinity;
                for (let i = 0; i < states.length; i++) {
                  if (!hasEntered[i] && states[i].arrivalTime > currentTime) nextArr = Math.min(nextArr, states[i].arrivalTime);
                }
                if (nextArr !== Infinity) {
                  segments.push({ processId: 'IDLE', startTime: currentTime, endTime: nextArr });
                  currentTime = nextArr;
                  enqueue(currentTime);
                }
                continue;
              }
              const currIdx = readyQueue.shift();
              const p = states[currIdx];
              if (p.firstStartTime === null) p.firstStartTime = currentTime;
              const dur = Math.min(timeQuantum, p.remainingBurst);
              const fin = currentTime + dur;
              segments.push({ processId: p.id, startTime: currentTime, endTime: fin });
              p.remainingBurst -= dur;
              enqueue(fin);
              currentTime = fin;
              if (p.remainingBurst > 0) readyQueue.push(currIdx);
              else { p.completionTime = currentTime; completed++; }
            }
          }

          // Merge adjacent
          const merged = [];
          for (const s of segments) {
            const last = merged[merged.length - 1];
            if (last && last.processId === s.processId && last.endTime === s.startTime) {
              last.endTime = s.endTime;
            } else {
              merged.push({ ...s });
            }
          }

          // Metrics
          const metrics = states.sort((a,b) => a.originalIndex - b.originalIndex).map(p => {
            const tat = Math.max(0, p.completionTime - p.arrivalTime);
            const wt = Math.max(0, tat - p.burstTime);
            const rt = Math.max(0, (p.firstStartTime ?? p.arrivalTime) - p.arrivalTime);
            return {
              id: p.id,
              arrivalTime: p.arrivalTime,
              burstTime: p.burstTime,
              priority: p.priority,
              completionTime: p.completionTime,
              turnaroundTime: tat,
              waitingTime: wt,
              responseTime: rt
            };
          });

          const totalSpan = merged.length > 0 ? merged[merged.length - 1].endTime : 0;
          const totalBusy = merged.filter(s => s.processId !== 'IDLE').reduce((acc, s) => acc + (s.endTime - s.startTime), 0);
          const cpuUtil = totalSpan > 0 ? (totalBusy / totalSpan) * 100 : 100;

          return {
            algorithm: algo,
            ganttChart: merged,
            processMetrics: metrics,
            averageTurnaroundTime: metrics.length ? Number((metrics.reduce((a,b) => a + b.turnaroundTime, 0)/metrics.length).toFixed(3)) : 0,
            averageWaitingTime: metrics.length ? Number((metrics.reduce((a,b) => a + b.waitingTime, 0)/metrics.length).toFixed(3)) : 0,
            averageResponseTime: metrics.length ? Number((metrics.reduce((a,b) => a + b.responseTime, 0)/metrics.length).toFixed(3)) : 0,
            totalExecutionTime: totalSpan,
            cpuUtilization: Number(cpuUtil.toFixed(2)),
            throughput: totalSpan > 0 ? Number((metrics.length / totalSpan).toFixed(4)) : 0,
          };
        }

        const res = runAlgorithm(workerData.algorithm, workerData.processes, workerData.quantum);
        parentPort.postMessage({ result: res, threadId });
      `;

      const worker = new Worker(workerCode, {
        eval: true,
        workerData: { algorithm, processes, quantum },
      });

      worker.on('message', (msg) => {
        const computeTimeMs = Date.now() - startTime;
        resolve({
          ...msg.result,
          threadInfo: {
            engine: 'node-worker',
            threadId: `OS-Thread-${msg.threadId} (Worker #${threadNum})`,
            computeTimeMs,
            isConcurrentWorker: true,
          },
        });
      });

      worker.on('error', (err) => reject(err));
      worker.on('exit', (code) => {
        if (code !== 0) reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
  };

  // POST /api/simulate
  app.post('/api/simulate', async (req, res) => {
    try {
      const { algorithm, processes, quantum } = req.body;
      const result = await runInNodeWorker(algorithm, processes, quantum, 1);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Worker thread failed' });
    }
  });

  // POST /api/simulate-batch (Concurrent execution of all 6 algorithms on separate Node worker threads)
  app.post('/api/simulate-batch', async (req, res) => {
    try {
      const { processes, quantum } = req.body;
      const algorithms = ['FCFS', 'SJF_NP', 'SRTF', 'PRIORITY_NP', 'PRIORITY_P', 'ROUND_ROBIN'];
      const start = Date.now();

      // Launch all concurrently across separate OS threads
      const promises = algorithms.map((algo, index) =>
        runInNodeWorker(algo, processes, quantum, index + 1)
      );

      // Thread join barrier
      const results = await Promise.all(promises);
      const totalDurationMs = Date.now() - start;

      res.json({ results, totalDurationMs });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Batch worker simulation failed' });
    }
  });

  // Vite integration
  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`OS Simulator Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
