export default function Portfolio() {
    const projects = [
      { title: "VR Security Training", tech: "Unity, Blender", pos: "P1" },
      { title: "Quantum Cryptography", tech: "Python, DRDO", pos: "P2" },
      { title: "Blockchain Trends", tech: "Research", pos: "P3" }
    ];
  
    return (
      <div className="min-h-screen p-10 mt-20">
        <h1 className="f1-font text-7xl mb-10 border-b-8 border-red-600 inline-block">Driver Profile: Mansi</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="glass-panel p-8 f1-border">
            <h2 className="f1-font text-2xl text-red-600 mb-4">Technical Specs (Skills)</h2>
            <div className="space-y-4 font-mono">
              <div>PYTHON <div className="w-full bg-zinc-800 h-2 mt-1"><div className="bg-red-600 h-full w-[95%]"></div></div></div>
              <div>XR DEVELOPMENT <div className="w-full bg-zinc-800 h-2 mt-1"><div className="bg-red-600 h-full w-[90%]"></div></div></div>
              <div>CYBERSECURITY <div className="w-full bg-zinc-800 h-2 mt-1"><div className="bg-red-600 h-full w-[85%]"></div></div></div>
            </div>
          </div>
  
          <div className="glass-panel p-8 f1-border">
            <h2 className="f1-font text-2xl text-red-600 mb-4">Recent Grand Prix (Projects)</h2>
            {projects.map(p => (
              <div key={p.title} className="flex justify-between items-center border-b border-zinc-800 py-3">
                <span>{p.title} <br/><small className="text-zinc-500">{p.tech}</small></span>
                <span className="f1-font text-xl">{p.pos}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }