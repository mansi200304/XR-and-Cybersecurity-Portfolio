export default function ProceduralF1Car({ color = '#FF8000', scale = 1 }) {
  const dark = '#0a0a0a';
  const carbon = '#1a1a1a';

  return (
    <group scale={scale}>
      <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.55, 0.26, 4.1]} />
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.15} />
      </mesh>

      <mesh position={[0, 0.12, 2.42]} castShadow>
        <boxGeometry args={[0.62, 0.15, 0.72]} />
        <meshStandardMaterial color={color} metalness={0.85} roughness={0.15} />
      </mesh>

      <mesh position={[0, 0.43, 0.3]} castShadow>
        <boxGeometry args={[0.7, 0.35, 1.05]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[0, 0.55, 0.82]}>
        <boxGeometry args={[0.55, 0.13, 0.36]} />
        <meshStandardMaterial color="#1a4a8a" transparent opacity={0.65} metalness={0.9} roughness={0.05} />
      </mesh>

      <mesh position={[0, 0.7, 0.3]}>
        <torusGeometry args={[0.3, 0.035, 8, 24, Math.PI]} />
        <meshStandardMaterial color={carbon} metalness={0.9} roughness={0.1} />
      </mesh>

      <mesh position={[0, -0.02, 2.85]} castShadow>
        <boxGeometry args={[2.35, 0.055, 0.4]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>

      <mesh position={[0, 0.065, 2.68]}>
        <boxGeometry args={[2.15, 0.04, 0.24]} />
        <meshStandardMaterial color={dark} metalness={0.6} roughness={0.3} />
      </mesh>

      <mesh position={[-1.15, 0.05, 2.7]} castShadow>
        <boxGeometry args={[0.035, 0.25, 0.48]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[1.15, 0.05, 2.7]} castShadow>
        <boxGeometry args={[0.035, 0.25, 0.48]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} />
      </mesh>

      <mesh position={[-0.93, 0.12, 0.05]} castShadow>
        <boxGeometry args={[0.37, 0.28, 2.15]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0.93, 0.12, 0.05]} castShadow>
        <boxGeometry args={[0.37, 0.28, 2.15]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
      </mesh>

      <mesh position={[-0.93, 0.18, 1.15]}>
        <boxGeometry args={[0.07, 0.2, 0.16]} />
        <meshStandardMaterial color={dark} />
      </mesh>
      <mesh position={[0.93, 0.18, 1.15]}>
        <boxGeometry args={[0.07, 0.2, 0.16]} />
        <meshStandardMaterial color={dark} />
      </mesh>

      <mesh position={[0, 0.84, -2.06]} castShadow>
        <boxGeometry args={[1.88, 0.055, 0.33]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0, 0.73, -1.93]}>
        <boxGeometry args={[1.7, 0.04, 0.26]} />
        <meshStandardMaterial color={dark} metalness={0.6} roughness={0.3} />
      </mesh>

      <mesh position={[-0.73, 0.5, -2.06]}>
        <boxGeometry args={[0.055, 0.63, 0.09]} />
        <meshStandardMaterial color={carbon} metalness={0.9} />
      </mesh>
      <mesh position={[0.73, 0.5, -2.06]}>
        <boxGeometry args={[0.055, 0.63, 0.09]} />
        <meshStandardMaterial color={carbon} metalness={0.9} />
      </mesh>

      <mesh position={[0, -0.02, -2.25]}>
        <boxGeometry args={[1.4, 0.12, 0.55]} />
        <meshStandardMaterial color={carbon} metalness={0.7} roughness={0.3} />
      </mesh>

      {[[-0.9, -0.12, 1.63], [0.9, -0.12, 1.63], [-0.96, -0.1, -1.53], [0.96, -0.1, -1.53]].map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[i >= 2 ? 0.43 : 0.37, i >= 2 ? 0.43 : 0.37, i >= 2 ? 0.44 : 0.37, 20]} />
            <meshStandardMaterial color={dark} roughness={0.88} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[i >= 2 ? 0.21 : 0.17, i >= 2 ? 0.21 : 0.17, i >= 2 ? 0.47 : 0.41, 12]} />
            <meshStandardMaterial color={carbon} metalness={0.85} roughness={0.1} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.33, 0.2]}>
        <boxGeometry args={[0.26, 0.018, 3.8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>

      <mesh position={[-0.28, 0.32, -2.12]} rotation={[0.12, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.075, 0.38, 8]} />
        <meshStandardMaterial color={carbon} metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.28, 0.32, -2.12]} rotation={[0.12, 0, 0]}>
        <cylinderGeometry args={[0.055, 0.075, 0.38, 8]} />
        <meshStandardMaterial color={carbon} metalness={0.9} roughness={0.1} />
      </mesh>

      <pointLight position={[0, -0.32, 0]} intensity={1.5} color={color} distance={3.8} decay={2} />
    </group>
  );
}
