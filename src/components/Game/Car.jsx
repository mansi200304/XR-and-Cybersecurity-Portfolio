import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';

export default function Car({ onFinish }) {
  const carRef = useRef();
  const [speed, setSpeed] = useState(0);
  const keys = useRef({});

  // 1. Safe Model Loading
  const { scene } = useGLTF('/models/f1_car.glb', true); // 'true' allows it to fail gracefully

  useEffect(() => {
    const handleKey = (e) => { keys.current[e.key.toLowerCase()] = e.type === 'keydown'; };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    return () => { 
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
  }, []);

  useFrame((state, delta) => {
    if (!carRef.current) return;

    // 2. High-Performance Logic (No State updates in useFrame!)
    if (keys.current['w']) setSpeed(s => Math.min(s + 0.05, 1.5));
    else setSpeed(s => Math.max(s - 0.02, 0));

    if (keys.current['a']) carRef.current.rotation.y += 0.05;
    if (keys.current['d']) carRef.current.rotation.y -= 0.05;

    carRef.current.translateZ(speed);

    // 3. Camera Follow (The "PS5" Feel)
    state.camera.position.lerp(
      new THREE.Vector3(carRef.current.position.x, carRef.current.position.y + 4, carRef.current.position.z + 10), 
      0.1
    );
    state.camera.lookAt(carRef.current.position);
  });

  return (
    <group ref={carRef}>
      {scene ? <primitive object={scene} /> : (
        <mesh>
          <boxGeometry args={[1, 0.5, 2]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
    </group>
  );
}