// Renders all tiles as a group

import { Tile } from './Tile';

export function SphereMesh({ tiles, onReveal, onFlag, phase }) {
  return (
    <group>
      {tiles.map(tile => (
        <Tile
          key={tile.id}
          tile={tile}
          onReveal={onReveal}
          onFlag={onFlag}
          phase={phase}
        />
      ))}
    </group>
  );
}
