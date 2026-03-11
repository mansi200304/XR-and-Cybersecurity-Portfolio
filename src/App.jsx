import React, { Suspense, useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, useGLTF, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { HandTracker } from './HandTracker';
import ErrorBoundary from './components/ErrorBoundary';
import ProceduralF1Car from './components/Game/ProceduralF1Car';

function detectGesture(lm) {
  if (!lm || lm.length < 21) return { gesture: 'none', pinchDist: 0.1 };
  // y: 0=top 1=bottom in image coords. Finger extended = tip higher (lower y) than MCP base knuckle
  const ext = (tip, mcp) => lm[tip].y < lm[mcp].y;
  const iUp = ext(8, 5);   // index
  const mUp = ext(12, 9);  // middle
  const rUp = ext(16, 13); // ring
  const pUp = ext(20, 17); // pinky
  const pinchDist = Math.hypot(lm[4].x - lm[8].x, lm[4].y - lm[8].y);
  if (!iUp && !mUp && !rUp && !pUp) return { gesture: 'fist', pinchDist };
  if (iUp && mUp && rUp && pUp)    return { gesture: 'open', pinchDist };
  if (iUp && !mUp && !rUp && !pUp) return { gesture: 'point', pinchDist };
  if (iUp && mUp && !rUp && !pUp)  return { gesture: 'peace', pinchDist };
  if (iUp && !mUp && !rUp && pUp)  return { gesture: 'rock', pinchDist };
  return { gesture: 'none', pinchDist };
}

const GESTURE_LABELS = {
  fist:  '✊ FIST — EXHAUST SMOKE',
  open:  '🖐 OPEN PALM — CONTROL',
  point: '☝️ POINT — LIGHT BEAM',
  peace: '✌️ PEACE — SPARK BURST',
  rock:  '🤘 ROCK — ENERGY RINGS',
  none:  '',
};

function makeParticleSystem(count, color, size, additive) {
  const arr = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) arr[i * 3 + 1] = -500;
  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(arr, 3));
  const mat = new THREE.PointsMaterial({
    size, color, transparent: true, opacity: 0, depthWrite: false, sizeAttenuation: true,
    blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
  return new THREE.Points(geom, mat);
}

function ExhaustSmoke({ active }) {
  const COUNT = 150;
  const obj = useMemo(() => makeParticleSystem(COUNT, '#e8e8e8', 0.65, false), []);
  const pts = useRef(Array.from({ length: COUNT }, () => ({ x: 0, y: -500, z: 0, vx: 0, vy: 0, vz: 0, life: 0 })));
  useEffect(() => () => { obj.geometry.dispose(); obj.material.dispose(); }, [obj]);

  useFrame((_, delta) => {
    const arr = obj.geometry.attributes.position.array;
    const p = pts.current;
    if (active) {
      for (let i = 0; i < COUNT; i++) {
        if (p[i].life <= 0 && Math.random() < 0.45) {
          const side = Math.random() > 0.5 ? 0.3 : -0.3;
          p[i] = { x: side + (Math.random()-0.5)*0.15, y: 0.35, z: -1.6, vx: (Math.random()-0.5)*0.016, vy: 0.028+Math.random()*0.032, vz: -Math.random()*0.01, life: 1.0 };
        }
      }
    }
    for (let i = 0; i < COUNT; i++) {
      if (p[i].life > 0) {
        p[i].life -= delta * 0.5; p[i].x += p[i].vx; p[i].y += p[i].vy; p[i].z += p[i].vz;
        p[i].vx += (Math.random()-0.5)*0.002;
        arr[i*3]=p[i].x; arr[i*3+1]=p[i].y; arr[i*3+2]=p[i].z;
      } else { arr[i*3+1]=-500; }
    }
    obj.geometry.attributes.position.needsUpdate = true;
    obj.material.opacity = THREE.MathUtils.lerp(obj.material.opacity, active ? 0.75 : 0, 0.1);
  });
  return <primitive object={obj} />;
}

function SparkBurst({ active, color }) {
  const COUNT = 120;
  const obj = useMemo(() => makeParticleSystem(COUNT, color, 0.22, true), [color]);
  const vels = useRef(Array.from({ length: COUNT }, () => ({ x: 0, y: -500, z: 0, vx: 0, vy: 0, vz: 0, life: 0 })));
  useEffect(() => () => { obj.geometry.dispose(); obj.material.dispose(); }, [obj]);

  useFrame((_, delta) => {
    const arr = obj.geometry.attributes.position.array;
    if (active) {
      for (let i = 0; i < COUNT; i++) {
        if (vels.current[i].life <= 0 && Math.random() < 0.35) {
          const angle = Math.random() * Math.PI * 2;
          const pitch = (Math.random() - 0.15) * Math.PI;
          const speed = 0.05 + Math.random() * 0.09;
          vels.current[i] = { x: 0, y: 0.6 + Math.random()*0.5, z: 0, vx: Math.cos(angle)*Math.cos(pitch)*speed, vy: Math.abs(Math.sin(pitch))*speed*2.5, vz: Math.sin(angle)*Math.cos(pitch)*speed, life: 0.7+Math.random()*0.4 };
        }
      }
    }
    let anyAlive = false;
    for (let i = 0; i < COUNT; i++) {
      const v = vels.current[i];
      if (v.life > 0) {
        v.life -= delta*1.1; v.x+=v.vx; v.y+=v.vy; v.z+=v.vz; v.vy-=0.004;
        arr[i*3]=v.x; arr[i*3+1]=v.y; arr[i*3+2]=v.z; anyAlive=true;
      } else { arr[i*3+1]=-500; }
    }
    obj.geometry.attributes.position.needsUpdate = true;
    obj.material.opacity = THREE.MathUtils.lerp(obj.material.opacity, anyAlive ? 1.0 : 0, 0.15);
    obj.material.color.set(color);
  });
  return <primitive object={obj} />;
}

function BeamLight({ active, color }) {
  const groupRef = useRef();
  const coneRef = useRef();
  const glowRef = useRef();
  const pulseRef = useRef();

  useFrame((state, delta) => {
    if (!coneRef.current) return;
    coneRef.current.material.opacity = THREE.MathUtils.lerp(coneRef.current.material.opacity, active ? 0.38 : 0, 0.12);
    if (glowRef.current) glowRef.current.material.opacity = THREE.MathUtils.lerp(glowRef.current.material.opacity, active ? 0.75 : 0, 0.12);
    if (pulseRef.current) {
      const p = active ? 0.28 + Math.sin(state.clock.elapsedTime * 4) * 0.14 : 0;
      pulseRef.current.material.opacity = THREE.MathUtils.lerp(pulseRef.current.material.opacity, p, 0.15);
    }
    if (active) coneRef.current.rotation.y += delta * 0.6;
    if (coneRef.current) { coneRef.current.material.color.set(color); }
    if (glowRef.current) { glowRef.current.material.color.set(color); }
    if (pulseRef.current) { pulseRef.current.material.color.set(color); }
  });

  return (
    <group ref={groupRef}>
      <mesh ref={coneRef} position={[0, 7, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[3, 16, 32, 1, true]} />
        <meshBasicMaterial color={color} transparent opacity={0} side={THREE.BackSide} depthWrite={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh ref={glowRef} position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[2.2, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={pulseRef} position={[0, 0.15, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.2, 3.5, 48]} />
        <meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function EnergyRing({ active, color }) {
  const r1 = useRef(); const r2 = useRef(); const r3 = useRef();

  useFrame((_, delta) => {
    if (!r1.current) return;
    r1.current.rotation.x += delta*2.5; r1.current.rotation.z += delta*1.8;
    if (r2.current) { r2.current.rotation.y += delta*3.2; r2.current.rotation.z += delta*2.1; }
    if (r3.current) { r3.current.rotation.x += delta*1.5; r3.current.rotation.y += delta*2.8; }
    r1.current.material.opacity = THREE.MathUtils.lerp(r1.current.material.opacity, active ? 0.85 : 0, 0.12);
    r1.current.material.color.set(color);
    if (r2.current) { r2.current.material.opacity = THREE.MathUtils.lerp(r2.current.material.opacity, active ? 0.6 : 0, 0.12); r2.current.material.color.set(color); }
    if (r3.current) { r3.current.material.opacity = THREE.MathUtils.lerp(r3.current.material.opacity, active ? 0.4 : 0, 0.12); r3.current.material.color.set(color); }
  });

  return (
    <group position={[0, 0.8, 0]}>
      <mesh ref={r1}><torusGeometry args={[3.0, 0.08, 8, 80]} /><meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
      <mesh ref={r2}><torusGeometry args={[2.3, 0.05, 8, 80]} /><meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
      <mesh ref={r3}><torusGeometry args={[1.6, 0.04, 8, 64]} /><meshBasicMaterial color={color} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} /></mesh>
    </group>
  );
}

const BREAKPOINT_MOBILE = 767;
const BREAKPOINT_TABLET = 1023;
const TEAM_TRANSITION_MS = 700;
const HAND_TIP_INDEX = 8;
const MODEL_SCALE = 2.8;
const AUTO_ROTATION_SPEED = 0.18;
const CAMERA_LERP = 0.05;
const HAND_ROT_LERP = 0.1;
const PROCEDURAL_TEAMS = [];

const CAMERA_POSITIONS = {
  mobile:           { z: 14, y: 2,   x: 0, fov: 50 },
  tablet:           { z: 12, y: 2.5, x: 0 },
  desktop:          { z: 10, y: 2.2, x: 0, fov: 42 },
  transition:       { z: 22, y: 3,   x: 0 },
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
    specialty: "XR + Security",
    quote: "Straight roads are for fast cars, turns are for fast drivers.",
    bio: "Engineering immersive experiences at the intersection of art, code, and security. Master's student at Arizona State University specializing in XR development with expertise in Unity, Unreal Engine, and real-time rendering.",
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
    quote: "Racing, competing, it's in my blood. It's part of me, it's part of my life; I have been doing it all my life and it stands out above everything else.",
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
      { title: "Improving Situational Awareness of Autonomous Vehicles to Ensure Safe Navigation", venue: "Springer 2026", url: "https://link.springer.com/chapter/10.1007/978-3-032-14156-9_35" },
      { title: "Enhancing Data Verification through Privacy-Preserving Techniques", venue: "IJARESM 2024", url: "https://www.ijaresm.com/uploaded_files/document_file/Mohammed_Emad_Sultan_SiddiqipInA.pdf" },
      { title: "Future Trends in Cybersecurity and Blockchain", venue: "Springer 2026", url: "https://link.springer.com/chapter/10.1007/978-3-032-14156-9_37" },
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
      <spotLight position={[-11, 6, -4]} intensity={2.2} color="#b8d4ff" angle={0.4} penumbra={1} />
      <spotLight position={[11, 6, -4]} intensity={1.8} color={teamColor} angle={0.4} penumbra={1} />
      <pointLight position={[0, -0.7, 0]} intensity={transitionActive ? 4 : 1.5} color={teamColor} distance={7} decay={2} />
      <pointLight position={[0, 4, -9]} intensity={1} color={teamColor} distance={18} decay={2} />
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
    meshRef.current.material.opacity = THREE.MathUtils.lerp(meshRef.current.material.opacity, target, 0.12);
  });

  return (
    <lineSegments ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
    </lineSegments>
  );
}

function GroundGlow({ teamColor, transitionActive }) {
  const meshRef = useRef();
  useFrame(() => {
    if (!meshRef.current) return;
    const target = transitionActive ? 0.7 : 0.35;
    meshRef.current.material.opacity = THREE.MathUtils.lerp(meshRef.current.material.opacity, target, 0.06);
  });
  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.47, 0]}>
      <circleGeometry args={[5, 64]} />
      <meshBasicMaterial color={teamColor} transparent opacity={0.35} depthWrite={false} blending={THREE.AdditiveBlending} />
    </mesh>
  );
}

function VehicleGLB({ team }) {
  const { scene } = useGLTF(`${import.meta.env.BASE_URL}models/${team}.glb`);
  return <primitive object={scene} scale={MODEL_SCALE} />;
}

function VehicleContent({ team }) {
  if (PROCEDURAL_TEAMS.includes(team)) {
    return <ProceduralF1Car color={DOSSIERS[team].theme.main} scale={2.5} />;
  }
  return <VehicleGLB team={team} />;
}

function F1Vehicle({ team, teamColor, handData, transitionActive, freeRoamRef, onFreeRoamChange, zoomRef }) {
  const outerRef = useRef();
  const wasdKeys = useRef({});
  const carSpeed = useRef(0);
  const carPosX = useRef(0);
  const carPosZ = useRef(0);
  const carRot = useRef(0);
  const floatTime = useRef(0);

  useEffect(() => {
    const onKeyDown = (e) => {
      wasdKeys.current[e.code] = true;
      if (['KeyW', 'KeyS', 'KeyA', 'KeyD'].includes(e.code)) {
        freeRoamRef.current = true;
        onFreeRoamChange(true);
      }
      if (e.code === 'Escape') {
        freeRoamRef.current = false;
        carPosX.current = 0;
        carPosZ.current = 0;
        carRot.current = 0;
        carSpeed.current = 0;
        onFreeRoamChange(false);
      }
    };
    const onKeyUp = (e) => { wasdKeys.current[e.code] = false; };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [freeRoamRef, onFreeRoamChange]);

  useFrame((state, delta) => {
    if (!outerRef.current) return;

    if (freeRoamRef.current) {
      const maxSpeed = 0.14;
      if (wasdKeys.current['KeyW']) {
        carSpeed.current = Math.min(carSpeed.current + 0.007, maxSpeed);
      } else if (wasdKeys.current['KeyS']) {
        carSpeed.current = Math.max(carSpeed.current - 0.009, -maxSpeed * 0.4);
      } else {
        carSpeed.current *= 0.97;
        if (Math.abs(carSpeed.current) < 0.0005) carSpeed.current = 0;
      }

      if (wasdKeys.current['KeyA']) carRot.current += 0.034;
      if (wasdKeys.current['KeyD']) carRot.current -= 0.034;

      carPosX.current -= Math.sin(carRot.current) * carSpeed.current;
      carPosZ.current -= Math.cos(carRot.current) * carSpeed.current;
      carPosX.current = THREE.MathUtils.clamp(carPosX.current, -35, 35);
      carPosZ.current = THREE.MathUtils.clamp(carPosZ.current, -35, 35);

      outerRef.current.position.set(carPosX.current, 0, carPosZ.current);
      outerRef.current.rotation.y = carRot.current;

      const camX = carPosX.current + Math.sin(carRot.current) * 9;
      const camZ = carPosZ.current + Math.cos(carRot.current) * 9;
      state.camera.position.lerp(new THREE.Vector3(camX, 4.5, camZ), 0.07);
      state.camera.lookAt(
        carPosX.current - Math.sin(carRot.current) * 4,
        0.5,
        carPosZ.current - Math.cos(carRot.current) * 4
      );
    } else {
      floatTime.current += delta;
      outerRef.current.position.set(0, Math.sin(floatTime.current * 1.2) * 0.18, 0);

      if (handData.detected && !transitionActive) {
        const targetRot = (handData.x - 0.5) * -3;
        const pitchTarget = handData.y !== undefined ? (handData.y - 0.5) * 0.25 : 0;
        outerRef.current.rotation.y = THREE.MathUtils.lerp(outerRef.current.rotation.y, targetRot + Math.PI, HAND_ROT_LERP);
        outerRef.current.rotation.x = THREE.MathUtils.lerp(outerRef.current.rotation.x, pitchTarget, 0.05);
      } else {
        outerRef.current.rotation.y += delta * AUTO_ROTATION_SPEED;
        outerRef.current.rotation.x = THREE.MathUtils.lerp(outerRef.current.rotation.x, 0, 0.05);
      }

      const isMobile = window.innerWidth <= BREAKPOINT_MOBILE;
      const isTablet = window.innerWidth > BREAKPOINT_MOBILE && window.innerWidth <= BREAKPOINT_TABLET;
      let cam;
      if (transitionActive) {
        cam = isMobile
          ? { z: CAMERA_POSITIONS.transitionMobile.z, y: CAMERA_POSITIONS.transition.y, x: 0 }
          : CAMERA_POSITIONS.transition;
      } else if (isMobile) {
        cam = CAMERA_POSITIONS.mobile;
      } else if (isTablet) {
        cam = CAMERA_POSITIONS.tablet;
      } else {
        cam = CAMERA_POSITIONS.desktop;
      }
      const zoom = zoomRef ? zoomRef.current : 1.0;
      state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, cam.x, CAMERA_LERP);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, cam.y * (0.5 + zoom * 0.5), CAMERA_LERP);
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, cam.z * zoom, CAMERA_LERP);
      state.camera.lookAt(0, 0.5, 0);
    }
  });

  return (
    <group ref={outerRef}>
      <VehicleContent team={team} />
      {!freeRoamRef.current && (
        <>
          <ExhaustSmoke active={handData.detected && handData.gesture === 'fist'} />
          <SparkBurst active={handData.detected && handData.gesture === 'peace'} color={teamColor} />
          <EnergyRing active={handData.detected && handData.gesture === 'rock'} color={teamColor} />
        </>
      )}
    </group>
  );
}

export default function App() {
  const [team, setTeam] = useState('ferrari');
  const [handData, setHandData] = useState({ detected: false, x: 0.5, y: 0.5, gesture: 'none', pinchDist: 0.1 });
  const [transitioning, setTransitioning] = useState(false);
  const [hasScroll, setHasScroll] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [freeRoaming, setFreeRoaming] = useState(false);

  const videoRef = useRef(null);
  const contentScrollRef = useRef(null);
  const selectorRef = useRef(null);
  const freeRoamRef = useRef(false);
  const handTimeoutRef = useRef(null);
  const zoomRef = useRef(1.0);
  const gestureBufferRef = useRef({ gesture: 'none', count: 0 });

  const handleFreeRoamChange = useCallback((val) => {
    freeRoamRef.current = val;
    setFreeRoaming(val);
  }, []);

  const changeTeam = (newTeam) => {
    if (newTeam === team) return;
    setTransitioning(true);
    setTimeout(() => { setTeam(newTeam); setTransitioning(false); }, TEAM_TRANSITION_MS);
  };

  const downloadResume = () => {
    const link = document.createElement('a');
    link.href = `${import.meta.env.BASE_URL}resume.pdf`;
    link.download = 'Mansi_Nayak_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fireMobileKey = useCallback((code, down) => {
    window.dispatchEvent(new KeyboardEvent(down ? 'keydown' : 'keyup', { code, bubbles: true }));
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const theme = DOSSIERS[team].theme;
    root.style.setProperty('--team-color', theme.main);
    root.style.setProperty('--team-bg', theme.bg);
  }, [team]);

  useEffect(() => {
    const tracker = new HandTracker((res) => {
      if (res.multiHandLandmarks?.[0]) {
        const lm = res.multiHandLandmarks[0];
        const tip = lm[HAND_TIP_INDEX];
        const { gesture, pinchDist } = detectGesture(lm);
        const buf = gestureBufferRef.current;
        if (gesture === buf.gesture) {
          buf.count = Math.min(buf.count + 1, 10);
        } else {
          buf.gesture = gesture;
          buf.count = 1;
        }
        const stableGesture = buf.count >= 3 ? buf.gesture : 'none';
        clearTimeout(handTimeoutRef.current);
        handTimeoutRef.current = setTimeout(() => {
          gestureBufferRef.current = { gesture: 'none', count: 0 };
          setHandData(prev => ({ ...prev, detected: false, gesture: 'none' }));
        }, 800);
        setHandData({ detected: true, x: tip.x, y: tip.y, gesture: stableGesture, pinchDist, landmarks: lm });
      }
    });
    if (videoRef.current) tracker.start(videoRef.current);
    return () => clearTimeout(handTimeoutRef.current);
  }, []);

  useEffect(() => {
    const onWheel = (e) => {
      if (freeRoamRef.current) return;
      if (e.target.closest('.hud-panel, .hand-tracking-box, .bottom-bar')) return;
      e.preventDefault();
      zoomRef.current = THREE.MathUtils.clamp(
        zoomRef.current * (1 + e.deltaY * 0.001),
        0.3, 2.8
      );
    };
    window.addEventListener('wheel', onWheel, { passive: false });
    return () => window.removeEventListener('wheel', onWheel);
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
    const checkMobile = () => setIsMobile(window.innerWidth <= BREAKPOINT_MOBILE);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const teams = Object.keys(DOSSIERS);
    let touchStartX = 0;
    let touchStartY = 0;
    const onTouchStart = (e) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };
    const onTouchEnd = (e) => {
      if (freeRoamRef.current) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;
      if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
        const currentIndex = teams.indexOf(team);
        if (dx < 0) changeTeam(teams[(currentIndex + 1) % teams.length]);
        else changeTeam(teams[(currentIndex - 1 + teams.length) % teams.length]);
      }
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [team]);

  useEffect(() => {
    const teams = Object.keys(DOSSIERS);
    const handleKeyDown = (e) => {
      if (freeRoamRef.current) return;
      const currentIndex = teams.indexOf(team);
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        changeTeam(teams[(currentIndex + 1) % teams.length]);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        changeTeam(teams[(currentIndex - 1 + teams.length) % teams.length]);
      } else if (e.key >= '1' && e.key <= '7') {
        e.preventDefault();
        const index = parseInt(e.key) - 1;
        if (teams[index]) changeTeam(teams[index]);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [team]);

  const d = DOSSIERS[team];

  return (
    <div className={`f1-dashboard ${transitioning ? 'warp-active' : ''}`} role="application" aria-label="F1 Style Portfolio Dashboard">
      <video
        ref={videoRef}
        className="camera-view"
        aria-label="Hand tracking camera feed"
        aria-hidden="true"
        autoPlay
        muted
        playsInline
      />

      <div className={`hand-tracking-box ${handData.detected ? 'hand-active' : ''} ${freeRoaming ? 'drive-mode' : ''}`}>
        {freeRoaming ? (
          <>
            <div className="ht-header drive">🏎 DRIVE MODE</div>
            <div className="ht-keys">
              <span><kbd>W</kbd> Forward</span>
              <span><kbd>S</kbd> Brake</span>
              <span><kbd>A</kbd><kbd>D</kbd> Steer</span>
              <span><kbd>ESC</kbd> Exit</span>
            </div>
          </>
        ) : (
          <>
            <div className="ht-header">
              <span className={`ht-dot ${handData.detected ? 'live' : ''}`} />
              HAND CONTROL
            </div>
            <div className="ht-status">{handData.detected ? 'HAND DETECTED' : 'STANDBY'}</div>
            {handData.detected && (
              <>
                <div className="ht-bar-wrap">
                  <span className="ht-bar-label">← INDEX →</span>
                  <div className="ht-bar">
                    <div className="ht-bar-fill" style={{ left: `${handData.x * 100}%` }} />
                  </div>
                </div>
                {handData.gesture && handData.gesture !== 'none' && (
                  <div className="ht-gesture">{GESTURE_LABELS[handData.gesture]}</div>
                )}
              </>
            )}
            <div className="ht-divider" />
            <div className="ht-keys">
              <span><kbd>WASD</kbd> Drive car</span>
              <span><kbd>← →</kbd> Switch team</span>
              <span><kbd>SCROLL</kbd> Zoom</span>
            </div>
            <div className="ht-divider" />
            <div className="ht-gestures-hint">
              <span>✊ Smoke  ✌️ Sparks</span>
              <span>☝️ Beam  🤘 Rings</span>
            </div>
          </>
        )}
      </div>

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
              <blockquote className="f1-quote">"{d.quote}"</blockquote>
              <p className="sub mb-4">Arizona State University • {d.specialty}</p>
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
                    🎓 {e.degree}<br />
                    <small>{e.school} | {e.date}</small>
                  </div>
                ))}
              </div>
            </>
          )}

          {team === 'mercedes' && (
            <>
              <blockquote className="f1-quote">"{d.quote}"</blockquote>
              <div role="list" aria-label="Major projects">
                {d.projects.map(p => (
                  <article key={p.name} className="project-card" role="listitem">
                    <div className="project-header"><span>{p.name}</span><span>{p.lap}</span></div>
                    <p className="project-desc">{p.desc}</p>
                    <div className="project-tech" aria-label={`Technologies: ${p.tech}`}>{p.tech}</div>
                  </article>
                ))}
              </div>
            </>
          )}

          {team === 'redbull' && (
            <div role="list" aria-label="Technical skills">
              {d.skills.map(s => (
                <div key={s.name} className="skill-row" role="listitem">
                  <div className="skill-header"><span>{s.name}</span><span>{s.p}</span></div>
                  <div className="bar" role="progressbar" aria-valuenow={parseInt(s.p)} aria-valuemin="0" aria-valuemax="100" aria-label={`${s.name} proficiency`}>
                    <div className="bar-fill" style={{ width: s.p }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {team === 'mclaren' && (
            <div role="list" aria-label="Publications and patents">
              {d.list.map(l => (
                <article key={l.title} className="list-item" role="listitem">
                  <div className="list-item-title">
                    {l.url
                      ? <a href={l.url} target="_blank" rel="noopener noreferrer" className="pub-link">📄 {l.title}</a>
                      : <>📄 {l.title}</>
                    }
                  </div>
                  <div className="list-item-venue">{l.venue}{l.url && <span className="pub-badge"> ↗ VIEW</span>}</div>
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
                <button className="nav-btn" onClick={downloadResume} type="button" aria-label="Download resume as PDF">
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
              <div className="bar-fill" style={{ width: '100%' }} />
            </div>
          </div>
          <p className="status-tagline">ENGINEERING PRECISION<br />MEETS CREATIVE SPEED</p>
        </div>
      </aside>

      <nav className="bottom-bar" aria-label="Team navigation">
        <div className="selector" ref={selectorRef} role="tablist" aria-label="Select team to view different portfolio sections">
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

      {isMobile && !freeRoaming && (
        <button
          className="mobile-drive-toggle"
          onTouchStart={(e) => { e.preventDefault(); fireMobileKey('KeyW', true); }}
          onTouchEnd={(e) => { e.preventDefault(); fireMobileKey('KeyW', false); }}
          aria-label="Enter drive mode"
        >🏎 DRIVE</button>
      )}

      {isMobile && freeRoaming && (
        <div className="mobile-dpad" aria-label="Drive controls">
          <button className="dpad-btn dpad-up"
            onTouchStart={(e) => { e.preventDefault(); fireMobileKey('KeyW', true); }}
            onTouchEnd={(e) => { e.preventDefault(); fireMobileKey('KeyW', false); }}
            aria-label="Accelerate">▲</button>
          <button className="dpad-btn dpad-left"
            onTouchStart={(e) => { e.preventDefault(); fireMobileKey('KeyA', true); }}
            onTouchEnd={(e) => { e.preventDefault(); fireMobileKey('KeyA', false); }}
            aria-label="Steer left">◀</button>
          <button className="dpad-btn dpad-right"
            onTouchStart={(e) => { e.preventDefault(); fireMobileKey('KeyD', true); }}
            onTouchEnd={(e) => { e.preventDefault(); fireMobileKey('KeyD', false); }}
            aria-label="Steer right">▶</button>
          <button className="dpad-btn dpad-down"
            onTouchStart={(e) => { e.preventDefault(); fireMobileKey('KeyS', true); }}
            onTouchEnd={(e) => { e.preventDefault(); fireMobileKey('KeyS', false); }}
            aria-label="Brake">▼</button>
          <button className="dpad-btn dpad-esc"
            onTouchStart={(e) => { e.preventDefault(); fireMobileKey('Escape', true); }}
            onTouchEnd={(e) => { e.preventDefault(); fireMobileKey('Escape', false); }}
            aria-label="Exit drive mode">✕</button>
        </div>
      )}

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
              <F1Vehicle
                team={team}
                teamColor={d.theme.main}
                handData={handData}
                transitionActive={transitioning}
                freeRoamRef={freeRoamRef}
                onFreeRoamChange={handleFreeRoamChange}
                zoomRef={zoomRef}
              />
              <BeamLight active={!freeRoaming && handData.detected && handData.gesture === 'point'} color={d.theme.main} />
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
              <ContactShadows opacity={0.6} scale={18} blur={3} far={1.5} resolution={512} color={d.theme.main} />
              <gridHelper args={[80, 40, d.theme.main, "#111"]} position={[0, -0.49, 0]} />
            </Suspense>
          </Canvas>
        </ErrorBoundary>
      </div>
    </div>
  );
}
