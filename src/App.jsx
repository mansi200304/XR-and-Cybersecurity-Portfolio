import React, { Suspense, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, useGLTF, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';
import { HandTracker } from './HandTracker';
import ErrorBoundary from './components/ErrorBoundary';

const DOSSIERS = {
  ferrari: {
    id: "02",
    tag: "DRIVER PROFILE",
    title: "MANSI NAYAK",
    team: "ASU Mesh Labs",
    specialty: "XR + Security",
    bio: "Engineering immersive experiences at the intersection of art, code, and security. Master's student specializing in XR development with expertise in Unity, Unreal Engine, and real-time rendering.",
    stats: [
      { label: "Publications", val: "6" },
      { label: "Patent", val: "1" },
      { label: "Internships", val: "4" },
      { label: "Projects", val: "3" }
    ],
    education: [
      { degree: "MS Cybersecurity", school: "Arizona State University", date: "2027" },
      { degree: "B.Tech CSE", school: "KIIT University", date: "2025", extra: "GPA: 7.32/10" }
    ],
    theme: { main: "#E8002D", bg: "rgba(232, 0, 45, 0.2)" }
  },
  mercedes: {
    id: "03",
    tag: "THE PODIUM",
    title: "MAJOR PROJECTS",
    projects: [
      { name: "P1: VR Security Training", tech: "Unity • VFX Graph • Blender", lap: "6 Months", desc: "Created particle effects, custom shaders, and optimized for 90fps VR." },
      { name: "P2: Real-Time Env Sim", tech: "Unreal • Niagara • 3ds Max", lap: "8 Months", desc: "Built procedural environmental effects for AV perception testing (Springer 2026)." },
      { name: "P3: Automated Asset Pipeline", tech: "Unity • Python • C#", lap: "3 Months", desc: "Developed Python scripts for texture compression and LOD generation." }
    ],
    theme: { main: "#27F4D2", bg: "rgba(39, 244, 210, 0.2)" }
  },
  mclaren: {
    id: "04",
    tag: "CHAMPIONSHIP POINTS",
    title: "PUBLICATIONS",
    list: [
      { title: "AV Situational Awareness", venue: "Springer 2026" },
      { title: "Privacy-Preserving Techniques", venue: "IJARESM 2024" },
      { title: "Cybersecurity & Blockchain", venue: "Springer 2026" },
      { title: "Quantum Cryptographic Robot P2P", venue: "DRDO India 2024" },
      { title: "Patent: Safe Count Voting System", venue: "Patent 2025" }
    ],
    theme: { main: "#FF8000", bg: "rgba(255, 128, 0, 0.2)" }
  },
  redbull: {
    id: "05",
    tag: "PIT CREW SETUP",
    title: "SKILL TELEMETRY",
    skills: [
      { name: "Unity & VFX Graph", p: "85%" },
      { name: "Python & Automation", p: "95%" },
      { name: "Unreal & Niagara", p: "75%" },
      { name: "Research & Publishing", p: "100%" },
      { name: "3D Tools (Blender)", p: "80%" }
    ],
    theme: { main: "#3671C6", bg: "rgba(54, 113, 198, 0.2)" }
  },
  alpine: {
    id: "06",
    tag: "RACE HISTORY",
    title: "EXPERIENCE",
    history: [
      { role: "Research Intern", co: "IIT Kanpur", date: "2024-25" },
      { role: "Technical Intern", co: "Celebal Tech", date: "2024" },
      { role: "Software Intern", co: "CSM Tech", date: "2021-22" },
      { role: "Digital Marketing", co: "Renison", date: "2021" }
    ],
    theme: { main: "#00A1E8", bg: "rgba(0, 161, 232, 0.2)" }
  },
  aston: {
    id: "07",
    tag: "PIT RADIO",
    title: "CONTACT",
    contact: {
      email: "nmansiganga@gmail.com",
      phone: "(480) 761-5828",
      loc: "Tempe, Arizona",
      availability: "F-1 Holder | 10-20 hrs/week"
    },
    theme: { main: "#229971", bg: "rgba(34, 153, 113, 0.2)" }
  }
};

function F1Vehicle({ team, handData, transitionActive }) {
  const group = useRef();
  const { scene } = useGLTF(`/models/${team}.glb`);

  useFrame((state) => {
    if (!group.current) return;
    if (handData?.x && !transitionActive) {
      const targetRot = (handData.x - 0.5) * -3;
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRot + Math.PI, 0.1);
    }
    const targetCamZ = transitionActive ? 22 : 11;
    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, targetCamZ, 0.05);
  });

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
      <primitive ref={group} object={scene} scale={2.8} />
    </Float>
  );
}

export default function App() {
  const [team, setTeam] = useState('ferrari');
  const [handData, setHandData] = useState({ x: 0.5 });
  const [transitioning, setTransitioning] = useState(false);
  const videoRef = useRef(null);

  const changeTeam = (newTeam) => {
    if (newTeam === team) return;
    setTransitioning(true);
    setTimeout(() => { setTeam(newTeam); setTransitioning(false); }, 700);
  };

  const downloadResume = () => {
    const link = document.createElement('a');
    link.href = '/resume.pdf';
    link.download = 'Mansi_Nayak_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  useEffect(() => {
    const root = document.documentElement;
    const theme = DOSSIERS[team].theme;
    root.style.setProperty('--team-color', theme.main);
    root.style.setProperty('--team-bg', theme.bg);
  }, [team]);

  useEffect(() => {
    const tracker = new HandTracker((res) => {
      if (res.multiHandLandmarks?.[0]) setHandData(res.multiHandLandmarks[0][8]);
    });
    if (videoRef.current) tracker.start(videoRef.current);
  }, []);

  const d = DOSSIERS[team];

  return (
    <div className={`f1-dashboard ${transitioning ? 'warp-active' : ''}`}>
      <video ref={videoRef} className="camera-view" />

      <div className="hud-panel left overflow-y-auto max-h-75vh">
        <div className="label">{d.id} // {d.tag}</div>
        <h1 className="name">{d.title}</h1>
        <div className="divider" />
        
        <div className="content-scroll">
          {team === 'ferrari' && (
            <>
              <p className="sub mb-4">{d.team} • {d.specialty}</p>
              <p className="content-body mb-6">{d.bio}</p>
              <div className="flex flex-wrap gap-2 mb-6">
                {d.stats.map(s => <div key={s.label} className="stat-box"><strong>{s.val}</strong><span>{s.label}</span></div>)}
              </div>
              {d.education.map(e => <div key={e.degree} className="edu-item">🎓 {e.degree}<br/><small>{e.school} | {e.date}</small></div>)}
            </>
          )}

          {team === 'mercedes' && d.projects.map(p => (
            <div key={p.name} className="project-card">
              <div className="project-header"><span>{p.name}</span><span>{p.lap}</span></div>
              <p className="project-desc">{p.desc}</p>
              <div className="project-tech">{p.tech}</div>
            </div>
          ))}

          {team === 'redbull' && d.skills.map(s => (
            <div key={s.name} className="skill-row">
              <div className="skill-header"><span>{s.name}</span><span>{s.p}</span></div>
              <div className="bar"><div className="bar-fill" style={{width: s.p}}/></div>
            </div>
          ))}

          {team === 'mclaren' && d.list.map(l => (
            <div key={l.title} className="list-item">
               <div className="list-item-title">📄 {l.title}</div>
               <div className="list-item-venue">{l.venue}</div>
            </div>
          ))}

          {team === 'alpine' && d.history.map(h => (
            <div key={h.co} className="list-item">
              <div className="list-item-role">🏆 {h.role}</div>
              <div className="list-item-company">{h.co} • {h.date}</div>
            </div>
          ))}

          {team === 'aston' && (
             <div className="contact-info">
               <p className="mb-2">📧 {d.contact.email}</p>
               <p className="mb-2">📱 {d.contact.phone}</p>
               <p className="contact-location">📍 {d.contact.loc} • {d.contact.availability}</p>
               <div className="flex flex-col gap-2">
                 <button className="nav-btn" onClick={downloadResume}>DOWNLOAD RESUME</button>
               </div>
             </div>
          )}
        </div>
      </div>

      <div className="hud-panel right">
        <div className="label">STATUS</div>
        <div className="skill-meter mt-4">
          <span className="status-label">SKILLS_LOADED</span>
          <div className="bar"><div className="bar-fill" style={{width: '100%'}}/></div>
        </div>
        <p className="status-tagline">ENGINEERING PRECISION<br/>MEETS CREATIVE SPEED</p>
      </div>

      <div className="bottom-bar">
        <div className="selector">
          {Object.keys(DOSSIERS).map(t => (
            <button key={t} onClick={() => changeTeam(t)} className={team === t ? 'active' : ''}>
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="canvas-container">
        <ErrorBoundary>
          <Canvas shadows camera={{ position: [0, 3, 11], fov: 45 }}>
            <Suspense fallback={null}>
              <F1Vehicle team={team} handData={handData} transitionActive={transitioning} />
              <Stars radius={100} depth={transitioning ? 200 : 50} count={transitioning ? 15000 : 5000} factor={transitioning ? 25 : 4} fade />
              <Environment preset="night" />
              <ContactShadows opacity={0.4} scale={20} blur={2.4} />
              <gridHelper args={[100, 50, "#333", "#0a0a0a"]} position={[0, -0.5, 0]} />
            </Suspense>
            <ambientLight intensity={0.4} />
            <pointLight position={[5, 5, 5]} intensity={1.5} color={d.theme.main} />
          </Canvas>
        </ErrorBoundary>
      </div>
    </div>
  );
}