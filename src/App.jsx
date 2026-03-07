import React, { Suspense, useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, useGLTF, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';
import { HandTracker } from './HandTracker';
import ErrorBoundary from './components/ErrorBoundary';
import RaceEngine from './components/Game/RaceEngine';

const BREAKPOINT_MOBILE = 767;
const BREAKPOINT_TABLET = 1023;
const TEAM_TRANSITION_MS = 700;
const HAND_TIP_INDEX = 8;
const MODEL_SCALE = 2.8;
const AUTO_ROTATION_SPEED = 0.18;
const CAMERA_LERP = 0.05;
const HAND_ROT_LERP = 0.1;

const CAMERA_POSITIONS = {
  mobile:     { z: 14, y: 2,   x: 0, fov: 50 },
  tablet:     { z: 12, y: 2.5, x: 0 },
  desktop:    { z: 10, y: 2.2, x: 0, fov: 42 },
  transition: { z: 22, y: 3,   x: 0 },
  transitionMobile: { z: 18 },
};

const STAR_CONFIG = {
  normal:     { depth: 50,  count: 4000, factor: 4,  speed: 1 },
  transition: { depth: 120, count: 8000, factor: 18, speed: 3 },
};

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

function SceneLighting({ teamColor, transitionActive }) {
  return (
    <>
      <ambientLight intensity={0.12} />
      <directionalLight position={[-6, 10, -6]} intensity={0.45} color="#9ab8f0" />

      <spotLight
        position={[2, 12, 9]}
        intensity={transitionActive ? 5 : 3}
        color={teamColor}
        angle={0.32}
        penumbra={0.75}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0005}
      />

      <spotLight
        position={[-11, 6, -4]}
        intensity={2.2}
        color="#b8d4ff"
        angle={0.4}
        penumbra={1}
      />

      <spotLight
        position={[11, 6, -4]}
        intensity={1.8}
        color={teamColor}
        angle={0.4}
        penumbra={1}
      />

      <pointLight
        position={[0, -0.7, 0]}
        intensity={transitionActive ? 4 : 1.5}
        color={teamColor}
        distance={7}
        decay={2}
      />

      <pointLight
        position={[0, 4, -9]}
        intensity={1}
        color={teamColor}
        distance={18}
        decay={2}
      />
    </>
  );
}

function SpeedLines({ active, color }) {
  const meshRef = useRef();

  const positions = useMemo(() => {
    const count = 160;
    const arr = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 5 + Math.random() * 22;
      const x = Math.cos(angle) * radius;
      const y = -4 + Math.random() * 10;
      arr[i * 6]     = x;
      arr[i * 6 + 1] = y;
      arr[i * 6 + 2] = -55;
      arr[i * 6 + 3] = x * 0.8;
      arr[i * 6 + 4] = y;
      arr[i * 6 + 5] = 8;
    }
    return arr;
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    const target = active ? 0.45 : 0;
    meshRef.current.material.opacity = THREE.MathUtils.lerp(
      meshRef.current.material.opacity, target, 0.12
    );
  });

  return (
    <lineSegments ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        color={color}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

function GroundGlow({ teamColor, transitionActive }) {
  const meshRef = useRef();

  useFrame(() => {
    if (!meshRef.current) return;
    const target = transitionActive ? 0.7 : 0.35;
    meshRef.current.material.opacity = THREE.MathUtils.lerp(
      meshRef.current.material.opacity, target, 0.06
    );
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.47, 0]}>
      <circleGeometry args={[5, 64]} />
      <meshBasicMaterial
        color={teamColor}
        transparent
        opacity={0.35}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function F1Vehicle({ team, handData, transitionActive }) {
  const group = useRef();
  const { scene } = useGLTF(`/models/${team}.glb`);

  useFrame((state, delta) => {
    if (!group.current) return;

    if (handData?.x && !transitionActive) {
      const targetRot = (handData.x - 0.5) * -3;
      group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetRot + Math.PI, HAND_ROT_LERP);
    } else {
      group.current.rotation.y += delta * AUTO_ROTATION_SPEED;
    }

    const isMobile = window.innerWidth <= BREAKPOINT_MOBILE;
    const isTablet = window.innerWidth > BREAKPOINT_MOBILE && window.innerWidth <= BREAKPOINT_TABLET;

    let cam;
    if (transitionActive) {
      cam = isMobile ? { z: CAMERA_POSITIONS.transitionMobile.z, y: CAMERA_POSITIONS.transition.y, x: CAMERA_POSITIONS.transition.x } : CAMERA_POSITIONS.transition;
    } else if (isMobile) {
      cam = CAMERA_POSITIONS.mobile;
    } else if (isTablet) {
      cam = CAMERA_POSITIONS.tablet;
    } else {
      cam = CAMERA_POSITIONS.desktop;
    }

    state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, cam.z, CAMERA_LERP);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, cam.y, CAMERA_LERP);
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, cam.x, CAMERA_LERP);
    state.camera.lookAt(0, 0.5, 0);
  });

  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.35}>
      <primitive ref={group} object={scene} scale={MODEL_SCALE} />
    </Float>
  );
}

export default function App() {
  const [team, setTeam] = useState('ferrari');
  const [handData, setHandData] = useState({ x: 0.5 });
  const [transitioning, setTransitioning] = useState(false);
  const [raceMode, setRaceMode] = useState(false);
  const [hasScroll, setHasScroll] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef(null);
  const contentScrollRef = useRef(null);
  const selectorRef = useRef(null);

  const changeTeam = (newTeam) => {
    if (newTeam === team) return;
    setTransitioning(true);
    setTimeout(() => { setTeam(newTeam); setTransitioning(false); }, TEAM_TRANSITION_MS);
  };

  const toggleRaceMode = () => {
    setRaceMode(!raceMode);
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
      if (res.multiHandLandmarks?.[0]) setHandData(res.multiHandLandmarks[0][HAND_TIP_INDEX]);
    });
    if (videoRef.current) tracker.start(videoRef.current);
  }, []);

  useEffect(() => {
    const checkScroll = () => {
      const el = contentScrollRef.current;
      if (el) {
        setHasScroll(el.scrollHeight > el.clientHeight);
        setIsScrolled(el.scrollTop > 10);
      }
    };
    checkScroll();
    const el = contentScrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      return () => el.removeEventListener('scroll', checkScroll);
    }
  }, [team]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= BREAKPOINT_MOBILE);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const teams = Object.keys(DOSSIERS);
    const handleKeyDown = (e) => {
      const currentIndex = teams.indexOf(team);
      
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const nextTeam = teams[(currentIndex + 1) % teams.length];
        changeTeam(nextTeam);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prevTeam = teams[(currentIndex - 1 + teams.length) % teams.length];
        changeTeam(prevTeam);
      } else if (e.key >= '1' && e.key <= '7') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (teams[index]) {
          changeTeam(teams[index]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [team]);

  const d = DOSSIERS[team];

  if (raceMode) {
    return <RaceEngine team={team} teamColor={d.theme.main} onExit={() => setRaceMode(false)} />;
  }

  return (
    <div className={`f1-dashboard ${transitioning ? 'warp-active' : ''}`} role="application" aria-label="F1 Style Portfolio Dashboard">
      <video 
        ref={videoRef} 
        className="camera-view" 
        aria-label="Hand tracking camera feed"
        aria-hidden="true"
      />
      
      <button 
        className="race-mode-toggle" 
        onClick={toggleRaceMode}
        aria-label="Toggle race mode"
        type="button"
      >
        🏁 RACE MODE
      </button>

      <section 
        className={`hud-panel left overflow-y-auto max-h-75vh ${isScrolled ? 'scrolled' : ''} ${leftPanelCollapsed ? 'collapsed' : ''}`}
        aria-label="Main portfolio content"
        role="region"
      >
        <header>
          <div 
            className="label" 
            aria-label={`Section ${d.id}: ${d.tag}`}
            onClick={() => isMobile && setLeftPanelCollapsed(!leftPanelCollapsed)}
            role={isMobile ? 'button' : undefined}
            tabIndex={isMobile ? 0 : undefined}
            onKeyDown={(e) => isMobile && (e.key === 'Enter' || e.key === ' ') && setLeftPanelCollapsed(!leftPanelCollapsed)}
          >
            {d.id} // {d.tag}
          </div>
          <h1 className="name">{d.title}</h1>
          <div className="divider" role="separator" aria-hidden="true" />
        </header>
        
        <div 
          className={`content-scroll ${hasScroll ? 'has-scroll' : ''}`} 
          ref={contentScrollRef}
          role="article"
          tabIndex="0"
          aria-label={`${d.tag} details`}
        >
          {team === 'ferrari' && (
            <>
              <p className="sub mb-4">{d.team} • {d.specialty}</p>
              <p className="content-body mb-6">{d.bio}</p>
              <div className="flex flex-wrap gap-2 mb-6" role="list" aria-label="Key statistics">
                {d.stats.map(s => (
                  <div key={s.label} className="stat-box" role="listitem" aria-label={`${s.val} ${s.label}`}>
                    <strong>{s.val}</strong>
                    <span>{s.label}</span>
                  </div>
                ))}
              </div>
              <div role="list" aria-label="Education history">
                {d.education.map(e => (
                  <div key={e.degree} className="edu-item" role="listitem">
                    🎓 {e.degree}<br/>
                    <small>{e.school} | {e.date}</small>
                  </div>
                ))}
              </div>
            </>
          )}

          {team === 'mercedes' && (
            <div role="list" aria-label="Major projects">
              {d.projects.map(p => (
                <article key={p.name} className="project-card" role="listitem">
                  <div className="project-header"><span>{p.name}</span><span>{p.lap}</span></div>
                  <p className="project-desc">{p.desc}</p>
                  <div className="project-tech" aria-label={`Technologies: ${p.tech}`}>{p.tech}</div>
                </article>
              ))}
            </div>
          )}

          {team === 'redbull' && (
            <div role="list" aria-label="Technical skills">
              {d.skills.map(s => (
                <div key={s.name} className="skill-row" role="listitem">
                  <div className="skill-header"><span>{s.name}</span><span>{s.p}</span></div>
                  <div className="bar" role="progressbar" aria-valuenow={parseInt(s.p)} aria-valuemin="0" aria-valuemax="100" aria-label={`${s.name} proficiency`}>
                    <div className="bar-fill" style={{width: s.p}}/>
                  </div>
                </div>
              ))}
            </div>
          )}

          {team === 'mclaren' && (
            <div role="list" aria-label="Publications and patents">
              {d.list.map(l => (
                <article key={l.title} className="list-item" role="listitem">
                  <div className="list-item-title">📄 {l.title}</div>
                  <div className="list-item-venue">{l.venue}</div>
                </article>
              ))}
            </div>
          )}

          {team === 'alpine' && (
            <div role="list" aria-label="Work experience">
              {d.history.map(h => (
                <article key={h.co} className="list-item" role="listitem">
                  <div className="list-item-role">🏆 {h.role}</div>
                  <div className="list-item-company">{h.co} • {h.date}</div>
                </article>
              ))}
            </div>
          )}

          {team === 'aston' && (
             <address className="contact-info" aria-label="Contact information">
               <p className="mb-2">
                 <span aria-label="Email">📧</span> 
                 <a href={`mailto:${d.contact.email}`} aria-label={`Email: ${d.contact.email}`}>{d.contact.email}</a>
               </p>
               <p className="mb-2">
                 <span aria-label="Phone">📱</span> 
                 <a href={`tel:${d.contact.phone.replace(/[^0-9]/g, '')}`} aria-label={`Phone: ${d.contact.phone}`}>{d.contact.phone}</a>
               </p>
               <p className="contact-location">
                 <span aria-label="Location">📍</span> {d.contact.loc} • {d.contact.availability}
               </p>
               <div className="flex flex-col gap-2">
                 <button 
                   className="nav-btn" 
                   onClick={downloadResume}
                   type="button"
                   aria-label="Download resume as PDF"
                 >
                   DOWNLOAD RESUME
                 </button>
               </div>
             </address>
          )}
        </div>
      </section>

      <aside className={`hud-panel right ${rightPanelCollapsed ? 'collapsed' : ''}`} role="complementary" aria-label="Status information">
        <div 
          className="label"
          onClick={() => isMobile && setRightPanelCollapsed(!rightPanelCollapsed)}
          role={isMobile ? 'button' : undefined}
          tabIndex={isMobile ? 0 : undefined}
          onKeyDown={(e) => isMobile && (e.key === 'Enter' || e.key === ' ') && setRightPanelCollapsed(!rightPanelCollapsed)}
        >
          STATUS
        </div>
        <div className="content-scroll">
          <div className="skill-meter mt-4">
            <span className="status-label">SKILLS_LOADED</span>
            <div className="bar" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" aria-label="System status">
              <div className="bar-fill" style={{width: '100%'}}/>
            </div>
          </div>
          <p className="status-tagline">ENGINEERING PRECISION<br/>MEETS CREATIVE SPEED</p>
        </div>
      </aside>

      <nav className="bottom-bar" aria-label="Team navigation">
        <div 
          className="selector" 
          ref={selectorRef}
          role="tablist" 
          aria-label="Select team to view different portfolio sections"
        >
          {Object.keys(DOSSIERS).map((t, index) => (
            <button 
              key={t} 
              onClick={() => changeTeam(t)} 
              className={team === t ? 'active' : ''}
              type="button"
              role="tab"
              aria-selected={team === t}
              aria-controls={`${t}-content`}
              aria-label={`${t.charAt(0).toUpperCase() + t.slice(1)} team - ${DOSSIERS[t].tag} (Press ${index + 1})`}
              tabIndex={team === t ? 0 : -1}
            >
              {t.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>

      <div className="canvas-container">
        <ErrorBoundary key={team}>
          <Canvas
            shadows
            gl={{ antialias: true, powerPreference: 'high-performance' }}
            camera={{
              position: [0, isMobile ? CAMERA_POSITIONS.mobile.y : CAMERA_POSITIONS.desktop.y, isMobile ? CAMERA_POSITIONS.mobile.z : CAMERA_POSITIONS.desktop.z],
              fov: isMobile ? CAMERA_POSITIONS.mobile.fov : CAMERA_POSITIONS.desktop.fov
            }}
          >
            <Suspense fallback={null}>
              <SceneLighting teamColor={d.theme.main} transitionActive={transitioning} />
              <F1Vehicle team={team} handData={handData} transitionActive={transitioning} />
              <GroundGlow teamColor={d.theme.main} transitionActive={transitioning} />
              <SpeedLines active={transitioning} color={d.theme.main} />
              <Stars
                radius={120}
                depth={transitioning ? STAR_CONFIG.transition.depth : STAR_CONFIG.normal.depth}
                count={transitioning ? STAR_CONFIG.transition.count : STAR_CONFIG.normal.count}
                factor={transitioning ? STAR_CONFIG.transition.factor : STAR_CONFIG.normal.factor}
                saturation={0.5}
                fade
                speed={transitioning ? STAR_CONFIG.transition.speed : STAR_CONFIG.normal.speed}
              />
              <Environment preset="night" />
              <ContactShadows
                opacity={0.6}
                scale={18}
                blur={3}
                far={1.5}
                resolution={512}
                color={d.theme.main}
              />
              <gridHelper args={[80, 40, d.theme.main, "#111"]} position={[0, -0.49, 0]} />
            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </div>
    </div>
  );
}