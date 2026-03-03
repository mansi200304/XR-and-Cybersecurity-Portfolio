import { Canvas } from '@react-three/fiber';
import { Sky, Stars, Environment, PerspectiveCamera } from '@react-three/drei';
import Track from './Track';
import Car from './Car';
import HUD from '../UI/HUD';

export default function RaceEngine({ onFinish }) {
  return (
    <div className="h-screen w-full bg-black">
      <HUD />
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 5, 12]} fov={50} />
        <Sky sunPosition={[100, 20, 100]} />
        <Stars radius={100} depth={50} count={5000} factor={4} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} castShadow />
        
        {/* The World */}
        <Track />
        <Car onFinish={onFinish} />
        
        <Environment preset="night" />
      </Canvas>
    </div>
  );
}