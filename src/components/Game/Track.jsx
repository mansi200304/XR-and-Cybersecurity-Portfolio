import * as THREE from 'three';

export default function Track({ teamColor = '#E8002D' }) {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.5, 0]}>
        <planeGeometry args={[40, 3000]} />
        <meshStandardMaterial color="#0a0a0c" roughness={0.9} metalness={0.1} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-15, -0.49, 0]} receiveShadow>
        <planeGeometry args={[2, 3000]} />
        <meshStandardMaterial color={teamColor} emissive={teamColor} emissiveIntensity={0.3} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[15, -0.49, 0]} receiveShadow>
        <planeGeometry args={[2, 3000]} />
        <meshStandardMaterial color={teamColor} emissive={teamColor} emissiveIntensity={0.3} />
      </mesh>

      {Array.from({ length: 100 }).map((_, i) => (
        <mesh 
          key={i} 
          rotation={[-Math.PI / 2, 0, 0]} 
          position={[0, -0.48, -i * 30]}
        >
          <planeGeometry args={[1, 5]} />
          <meshStandardMaterial 
            color="#ffffff" 
            emissive="#ffffff" 
            emissiveIntensity={0.2}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}

      <gridHelper 
        args={[3000, 150, teamColor, '#1a1a1a']} 
        position={[0, -0.5, 0]} 
      />

      {Array.from({ length: 20 }).map((_, i) => (
        <pointLight
          key={`light-${i}`}
          position={[i % 2 === 0 ? -18 : 18, 3, -i * 150]}
          intensity={1.5}
          distance={30}
          color={teamColor}
          castShadow
        />
      ))}
    </group>
  );
}