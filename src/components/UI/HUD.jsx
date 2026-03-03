import { useEffect, useState } from 'react';

export default function HUD() {
  const [speed, setSpeed] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate telemetry speed
      setSpeed(Math.floor(Math.random() * (310 - 290 + 1)) + 290);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-10 font-mono">
      <div className="flex justify-between items-start">
        <div className="glass-panel p-4 f1-skew border-l-4 border-red-600">
          <p className="text-xs text-zinc-400">POSITION</p>
          <p className="text-4xl font-bold italic">P1 <span className="text-sm text-zinc-500">/ 08</span></p>
        </div>
        <div className="text-right glass-panel p-4 f1-skew border-r-4 border-red-600">
          <p className="text-xs text-zinc-400">LAP TIME</p>
          <p className="text-2xl">01:14.332</p>
        </div>
      </div>

      <div className="flex justify-center items-end pb-10">
        <div className="text-center">
          <p className="text-6xl font-black italic text-white leading-none">{speed}</p>
          <p className="text-red-600 font-bold">KM/H</p>
          <div className="w-64 h-2 bg-zinc-800 mt-2 flex">
            <div className="h-full bg-red-600 animate-pulse" style={{ width: '85%' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}