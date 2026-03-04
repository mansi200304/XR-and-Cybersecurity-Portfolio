import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Float } from '@react-three/drei';
import * as THREE from 'three';

export default function Car({ team = 'ferrari', onSpeedChange }) {
  const carRef = useRef();
  const speed = useRef(0);
  const velocity = useRef(new THREE.Vector3());
  const keys = useRef({});

  const { scene } = useGLTF(`/models/${team}.glb`);

  useEffect(() => {
    const handleKey = (e) => { 
      keys.current[e.key.toLowerCase()] = e.type === 'keydown';
    };
    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKey);
    return () => { 
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKey);
    };
  }, []);

  useFrame((state, delta) => {
    if (!carRef.current) return;

    const maxSpeed = 2.5;
    const acceleration = 0.08;
    const braking = 0.12;
    const friction = 0.03;
    const turnSpeed = 0.04;

    if (keys.current['w'] || keys.current['arrowup']) {
      speed.current = Math.min(speed.current + acceleration, maxSpeed);
    } else if (keys.current['s'] || keys.current['arrowdown']) {
      speed.current = Math.max(speed.current - braking, -maxSpeed * 0.5);
    } else {
      if (speed.current > 0) speed.current = Math.max(speed.current - friction, 0);
      else if (speed.current < 0) speed.current = Math.min(speed.current + friction, 0);
    }

    if (keys.current['a'] || keys.current['arrowleft']) {
      carRef.current.rotation.y += turnSpeed * (speed.current / maxSpeed);
    }
    if (keys.current['d'] || keys.current['arrowright']) {
      carRef.current.rotation.y -= turnSpeed * (speed.current / maxSpeed);
    }

    if (keys.current[' ']) {
      speed.current *= 0.95;
    }

    const forward = new THREE.Vector3(0, 0, -1);
    forward.applyQuaternion(carRef.current.quaternion);
    forward.multiplyScalar(speed.current);
    
    carRef.current.position.add(forward);

    carRef.current.position.x = Math.max(-15, Math.min(15, carRef.current.position.x));

    const targetCamPos = new THREE.Vector3(
      carRef.current.position.x,
      carRef.current.position.y + 6,
      carRef.current.position.z + 12
    );
    state.camera.position.lerp(targetCamPos, 0.1);
    state.camera.lookAt(
      carRef.current.position.x,
      carRef.current.position.y + 1,
      carRef.current.position.z - 5
    );

    if (onSpeedChange) {
      onSpeedChange(Math.abs(speed.current * 100));
    }
  });

  return (
    <group ref={carRef} position={[0, 0, 0]}>
      <Float speed={0.5} rotationIntensity={0.05} floatIntensity={0.1}>
        <primitive object={scene.clone()} scale={2.8} />
      </Float>
      <pointLight 
        position={[0, 2, 0]} 
        intensity={2} 
        distance={10} 
        color="#ff0000" 
      />
    </group>
  );
}