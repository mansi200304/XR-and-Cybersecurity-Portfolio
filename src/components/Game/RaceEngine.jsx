import { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Stars, Environment, ContactShadows } from '@react-three/drei';
import Track from './Track';
import Car from './Car';

export default function RaceEngine({ team = 'ferrari', teamColor = '#E8002D', onExit }) {
  const [speed, setSpeed] = useState(0);

  return (
    <div className="race-mode">
      <div className="race-hud">
        <div className="speedometer">
          <div className="speed-value">{Math.round(speed)}</div>
          <div className="speed-label">KM/H</div>
        </div>
        
        <div className="race-controls">
          <div className="control-hint">
            <span className="key">W/↑</span> Accelerate
          </div>
          <div className="control-hint">
            <span className="key">S/↓</span> Brake
          </div>
          <div className="control-hint">
            <span className="key">A/←</span> Left
          </div>
          <div className="control-hint">
            <span className="key">D/→</span> Right
          </div>
          <div className="control-hint">
            <span className="key">SPACE</span> Handbrake
          </div>
        </div>

        <button className="exit-race-btn" onClick={onExit}>
          EXIT RACE MODE
        </button>
      </div>

      <div className="canvas-container">
        <Canvas shadows camera={{ position: [0, 6, 12], fov: 60 }}>
          <Suspense fallback={null}>
            <Car team={team} onSpeedChange={setSpeed} />
            <Track teamColor={teamColor} />
            <Stars radius={200} depth={100} count={8000} factor={6} fade speed={2} />
            <Environment preset="night" />
            <ContactShadows opacity={0.5} scale={30} blur={2} position={[0, -0.5, 0]} />
          </Suspense>
          <ambientLight intensity={0.3} />
          <directionalLight 
            position={[10, 20, 10]} 
            intensity={1.5} 
            castShadow 
            shadow-mapSize={[2048, 2048]}
          />
          <pointLight position={[0, 5, 0]} intensity={1} color={teamColor} />
          <fog attach="fog" args={[teamColor, 50, 150]} />
        </Canvas>
      </div>
    </div>
  );
}