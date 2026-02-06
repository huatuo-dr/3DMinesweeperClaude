// 3D scene with Three.js canvas

import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { SphereMesh } from './SphereMesh';

export function GameScene({ tiles, onReveal, onFlag, phase }) {
  return (
    <Canvas
      camera={{ position: [0, 0, 3], fov: 60 }}
      style={{ width: '100%', height: '100%' }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      <directionalLight position={[-3, -3, 2]} intensity={0.3} />
      <SphereMesh
        tiles={tiles}
        onReveal={onReveal}
        onFlag={onFlag}
        phase={phase}
      />
      <OrbitControls
        enablePan={false}
        minDistance={1.8}
        maxDistance={6}
        enableDamping
        dampingFactor={0.1}
      />
    </Canvas>
  );
}
