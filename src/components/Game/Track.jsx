import * as THREE from 'three';

export default function Track() {
  return (
    <group>
      {/* Main Asphalt */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[20, 2000]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.8} />
      </mesh>

      {/* Rumble Strips (Left) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-10.5, 0.01, 0]}>
        <planeGeometry args={[1, 2000]} />
        <meshStandardMaterial color="#DC0000" />
      </mesh>

      {/* Rumble Strips (Right) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[10.5, 0.01, 0]}>
        <planeGeometry args={[1, 2000]} />
        <meshStandardMaterial color="#DC0000" />
      </mesh>

      {/* Grid Lines */}
      <gridHelper args={[2000, 100, 0x333333, 0x333333]} rotation={[0, 0, 0]} />
    </group>
  );
}