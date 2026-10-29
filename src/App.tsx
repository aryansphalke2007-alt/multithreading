import React, { useState } from 'react';
import { Navbar, ActiveTab } from './components/common/Navbar';
import { CpuSchedulingTab } from './components/scheduling/CpuSchedulingTab';
import { MemoryAllocationTab } from './components/memory/MemoryAllocationTab';
import { AboutTab } from './components/about/AboutTab';
import { Terminal, ShieldCheck, Cpu } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('cpu');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'cpu' && <CpuSchedulingTab />}
        {activeTab === 'memory' && <MemoryAllocationTab />}
        {activeTab === 'about' && <AboutTab />}
      </main>

      {/* Global OS Dashboard Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950/80 py-5 text-center text-xs text-zinc-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>OS Algorithm Simulator • Real Multithreading Engine Active</span>
          </div>
          <div className="flex items-center gap-4 text-zinc-400">
            <span>FCFS • SJF • SRTF • Priority • Round Robin</span>
            <span>|</span>
            <span>First Fit • Best Fit • Next Fit</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
