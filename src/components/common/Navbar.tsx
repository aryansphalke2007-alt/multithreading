import React from 'react';
import { Cpu, HardDrive, Info, Activity, Terminal } from 'lucide-react';

export type ActiveTab = 'cpu' | 'memory' | 'about';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab }) => {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base text-zinc-100 tracking-tight">
                  OS Algorithm Simulator
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono font-medium">
                  v2.0 Multithreaded
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 hidden sm:block">
                CPU Preemptive Scheduling & Contiguous Memory Allocation Lab
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => onSelectTab('cpu')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'cpu'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Cpu className="w-4 h-4" />
              <span>CPU Scheduling</span>
            </button>

            <button
              onClick={() => onSelectTab('memory')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'memory'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Memory Allocation</span>
            </button>

            <button
              onClick={() => onSelectTab('about')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'about'
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>About / Theory</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
