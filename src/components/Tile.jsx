// Individual tile mesh on the sphere surface

import { useMemo, useRef, useCallback } from 'react';
import { BufferGeometry, Float32BufferAttribute, Vector3, Object3D } from 'three';
import { Text } from '@react-three/drei';

const COLORS = {
  unrevealed: '#4A90D9',
  revealed:   '#D4D4D8',
  mine:       '#FF4757',
  flagged:    '#FFA502',
  hover:      '#6BB0F0',
};

const NUMBER_COLORS = [
  '', '#2563EB', '#16A34A', '#DC2626', '#7C3AED',
  '#EA580C', '#0891B2', '#1E293B', '#6B7280',
];

export function Tile({ tile, onReveal, onFlag, phase }) {
  const longPressTimer = useRef(null);
  const longPressFired = useRef(false);
  const hoverRef = useRef(false);
  const meshRef = useRef();

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
    const normal = center.clone().normalize();

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
  }, [tile.center, tile.vertices]);

  // Pre-compute text orientation (face outward from sphere)
  const textProps = useMemo(() => {
    const c = new Vector3(...tile.center);
    const pos = c.clone().multiplyScalar(1.02);
    const dummy = new Object3D();
    dummy.position.copy(pos);
    dummy.lookAt(c.clone().multiplyScalar(2));
    const q = dummy.quaternion;
    return {
      position: [pos.x, pos.y, pos.z],
      quaternion: [q.x, q.y, q.z, q.w],
    };
  }, [tile.center]);

  // Determine tile color
  const color = useMemo(() => {
    if (tile.isFlagged) return COLORS.flagged;
    if (!tile.isRevealed) return COLORS.unrevealed;
    if (tile.isMine) return COLORS.mine;
    return COLORS.revealed;
  }, [tile.isFlagged, tile.isRevealed, tile.isMine]);

  // Pointer handlers: click to reveal, right-click or long-press to flag
  const handlePointerDown = useCallback((e) => {
    e.stopPropagation();
    longPressFired.current = false;

    if (e.button === 2) {
      onFlag(tile.id);
      return;
    }

    longPressTimer.current = setTimeout(() => {
      longPressFired.current = true;
      onFlag(tile.id);
    }, 450);
  }, [tile.id, onFlag]);

  const handlePointerUp = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handlePointerLeave = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    if (meshRef.current) {
      meshRef.current.material.emissive.setHex(0x000000);
    }
  }, []);

  const handleClick = useCallback((e) => {
    e.stopPropagation();
    if (longPressFired.current) return;
    onReveal(tile.id);
  }, [tile.id, onReveal]);

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
  const interactive = phase === 'playing' && !tile.isRevealed;

  return (
    <group>
      <mesh
        ref={meshRef}
        geometry={geometry}
        onPointerDown={interactive ? handlePointerDown : undefined}
        onPointerUp={interactive ? handlePointerUp : undefined}
        onPointerLeave={interactive ? handlePointerLeave : undefined}
        onClick={interactive ? handleClick : undefined}
        onPointerOver={interactive ? handlePointerOver : undefined}
        onPointerOut={interactive ? handlePointerOut : undefined}
      >
        <meshStandardMaterial color={color} roughness={0.6} metalness={0.1} />
      </mesh>

      {showNumber && (
        <Text
          position={textProps.position}
          quaternion={textProps.quaternion}
          fontSize={0.055}
          color={NUMBER_COLORS[tile.adjacentMines] || '#000'}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          {tile.adjacentMines}
        </Text>
      )}

      {showFlag && (
        <Text
          position={textProps.position}
          quaternion={textProps.quaternion}
          fontSize={0.06}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          F
        </Text>
      )}

      {showMine && (
        <Text
          position={textProps.position}
          quaternion={textProps.quaternion}
          fontSize={0.06}
          color="#FFFFFF"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          X
        </Text>
      )}
    </group>
  );
}
