// Individual tile mesh on the sphere/cube surface

import { useMemo, useRef, useCallback } from 'react';
import { BufferGeometry, Float32BufferAttribute, Vector3 } from 'three';
import { Html } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';

const COLORS = {
  unrevealed: '#4A90D9',
  revealed:   '#D4D4D8',
  mine:       '#FF4757',
  flagged:    '#FFA502',
};

// Emoji digits for adjacent mine counts
const NUMBER_EMOJIS = ['', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣'];

// Html label that hides when facing away, with manual distance-based scaling
function FacingHtml({ position, tileCenter, tileNormal, scaleFactor, children }) {
  const spanRef = useRef();

  useFrame(({ camera }) => {
    if (!spanRef.current) return;

    // Visibility: dot product of tile normal vs camera direction
    const dx = camera.position.x - tileCenter[0];
    const dy = camera.position.y - tileCenter[1];
    const dz = camera.position.z - tileCenter[2];
    const dot = dx * tileNormal[0] + dy * tileNormal[1] + dz * tileNormal[2];

    if (dot <= 0) {
      spanRef.current.style.display = 'none';
      return;
    }

    spanRef.current.style.display = 'inline-block';

    // Manual scale: proportional to tile size, inversely to camera distance
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const scale = scaleFactor / dist;
    spanRef.current.style.transform = `scale(${scale})`;
  });

  return (
    <Html
      position={position}
      center
      style={{ pointerEvents: 'none', userSelect: 'none' }}
    >
      <span ref={spanRef} className="tile-emoji" style={{ display: 'none' }}>{children}</span>
    </Html>
  );
}

export function Tile({ tile, onReveal, onFlag, phase }) {
  const lastClickTime = useRef(0);
  const singleClickTimer = useRef(null);
  const meshRef = useRef();

  // Pre-compute tile normal as array (for FacingHtml)
  const tileNormal = useMemo(() => {
    if (tile.normal) return tile.normal;
    const c = new Vector3(...tile.center).normalize();
    return [c.x, c.y, c.z];
  }, [tile.center, tile.normal]);

  // Scale factor based on average edge length (manual scaling, bypasses distanceFactor)
  const scaleFactor = useMemo(() => {
    const v = tile.vertices;
    let sum = 0;
    for (let i = 0; i < v.length; i++) {
      const next = (i + 1) % v.length;
      const dx = v[next][0] - v[i][0];
      const dy = v[next][1] - v[i][1];
      const dz = v[next][2] - v[i][2];
      sum += Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    const edgeLen = sum / v.length;
    return Math.max(edgeLen * 40, 6);
  }, [tile.vertices]);

  // Build tile geometry once (fan triangulation from center)
  const geometry = useMemo(() => {
    const geo = new BufferGeometry();
    const center = new Vector3(...tile.center);
    const verts = tile.vertices.map(v => new Vector3(...v));

    // Shrink toward center for visual gaps between tiles
    const shrinkFactor = 0.93;
    const shrunk = verts.map(v =>
      new Vector3().lerpVectors(center, v, shrinkFactor)
    );

    const positions = [];
    const normals = [];
    const normal = new Vector3(...tileNormal);

    for (let i = 0; i < shrunk.length; i++) {
      const next = (i + 1) % shrunk.length;
      positions.push(center.x, center.y, center.z);
      positions.push(shrunk[i].x, shrunk[i].y, shrunk[i].z);
      positions.push(shrunk[next].x, shrunk[next].y, shrunk[next].z);
      for (let j = 0; j < 3; j++) {
        normals.push(normal.x, normal.y, normal.z);
      }
    }

    geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new Float32BufferAttribute(normals, 3));
    geo.computeBoundingSphere();
    return geo;
  }, [tile.center, tile.vertices, tileNormal]);

  // Pre-compute label position (slightly above surface along normal)
  const labelPosition = useMemo(() => {
    const c = new Vector3(...tile.center);
    const norm = new Vector3(...tileNormal);
    const pos = c.clone().add(norm.clone().multiplyScalar(0.05));
    return [pos.x, pos.y, pos.z];
  }, [tile.center, tileNormal]);

  // Determine tile color
  const color = useMemo(() => {
    if (tile.isFlagged) return COLORS.flagged;
    if (!tile.isRevealed) return COLORS.unrevealed;
    if (tile.isMine) return COLORS.mine;
    return COLORS.revealed;
  }, [tile.isFlagged, tile.isRevealed, tile.isMine]);

  // Right-click → flag (desktop)
  const handlePointerDown = useCallback((e) => {
    e.stopPropagation();
    if (e.button === 2) {
      onFlag(tile.id);
    }
  }, [tile.id, onFlag]);

  // Single click → reveal (delayed 300ms), double click → flag
  const handleClick = useCallback((e) => {
    e.stopPropagation();
    const now = Date.now();
    const elapsed = now - lastClickTime.current;
    lastClickTime.current = now;

    if (elapsed < 300 && singleClickTimer.current) {
      // Double tap → flag
      clearTimeout(singleClickTimer.current);
      singleClickTimer.current = null;
      onFlag(tile.id);
    } else {
      // Single tap → reveal after delay
      singleClickTimer.current = setTimeout(() => {
        singleClickTimer.current = null;
        onReveal(tile.id);
      }, 300);
    }
  }, [tile.id, onReveal, onFlag]);

  const handlePointerOver = useCallback(() => {
    if (!tile.isRevealed && !tile.isFlagged && meshRef.current) {
      meshRef.current.material.emissive.setHex(0x222244);
    }
  }, [tile.isRevealed, tile.isFlagged]);

  const handlePointerOut = useCallback(() => {
    if (meshRef.current) {
      meshRef.current.material.emissive.setHex(0x000000);
    }
  }, []);

  const showNumber = tile.isRevealed && !tile.isMine && tile.adjacentMines > 0;
  const showFlag = tile.isFlagged;
  const showMine = tile.isRevealed && tile.isMine;
  const showLabel = showNumber || showFlag || showMine;
  const interactive = phase === 'playing' && !tile.isRevealed;

  let labelContent = null;
  if (showFlag) labelContent = '🚩';
  else if (showMine) labelContent = '💣';
  else if (showNumber) labelContent = NUMBER_EMOJIS[tile.adjacentMines];

  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={geometry}
        onPointerDown={interactive ? handlePointerDown : undefined}
        onClick={interactive ? handleClick : undefined}
        onPointerOver={interactive ? handlePointerOver : undefined}
        onPointerOut={interactive ? handlePointerOut : undefined}
      >
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>

      {showLabel && (
        <FacingHtml
          position={labelPosition}
          tileCenter={tile.center}
          tileNormal={tileNormal}
          scaleFactor={scaleFactor}
        >
          {labelContent}
        </FacingHtml>
      )}
    </group>
  );
}
