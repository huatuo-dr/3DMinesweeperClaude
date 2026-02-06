// Cube surface tile generator
// Creates n×n square tiles on each of the 6 faces of a unit cube [-1,1]³
// Total tiles = 6n², with 8-neighbor connectivity (including diagonals and cross-face)

// 6 faces defined by origin, two direction vectors, and outward normal
const FACES = [
  { origin: [-1, -1,  1], uDir: [1, 0, 0], vDir: [0, 1, 0], normal: [ 0,  0,  1] }, // +Z front
  { origin: [ 1, -1, -1], uDir: [-1, 0, 0], vDir: [0, 1, 0], normal: [ 0,  0, -1] }, // -Z back
  { origin: [-1, -1, -1], uDir: [0, 0, 1],  vDir: [0, 1, 0], normal: [-1,  0,  0] }, // -X left
  { origin: [ 1, -1,  1], uDir: [0, 0, -1], vDir: [0, 1, 0], normal: [ 1,  0,  0] }, // +X right
  { origin: [-1,  1,  1], uDir: [1, 0, 0],  vDir: [0, 0, -1], normal: [ 0,  1,  0] }, // +Y top
  { origin: [-1, -1, -1], uDir: [1, 0, 0],  vDir: [0, 0, 1], normal: [ 0, -1,  0] }, // -Y bottom
];

/**
 * Generate cube surface tiles for minesweeper.
 * @param {number} n - Grid size per face. Total tiles = 6n²
 * @returns {Array} tiles with { id, center, vertices, neighbors, sides, normal }
 */
export function generateCubeSurface(n) {
  const cellSize = 2 / n;
  const tiles = [];
  let id = 0;

  // Generate tile positions and geometry for each face
  for (const face of FACES) {
    for (let row = 0; row < n; row++) {
      for (let col = 0; col < n; col++) {
        // 4 corners: top-left, top-right, bottom-right, bottom-left
        const corners = [[col, row], [col + 1, row], [col + 1, row + 1], [col, row + 1]];
        const vertices = corners.map(([u, v]) => [
          face.origin[0] + u * cellSize * face.uDir[0] + v * cellSize * face.vDir[0],
          face.origin[1] + u * cellSize * face.uDir[1] + v * cellSize * face.vDir[1],
          face.origin[2] + u * cellSize * face.uDir[2] + v * cellSize * face.vDir[2],
        ]);

        const center = [0, 1, 2].map(axis =>
          vertices.reduce((sum, v) => sum + v[axis], 0) / 4
        );

        tiles.push({
          id,
          center,
          vertices,
          neighbors: [],
          sides: 4,
          normal: [...face.normal],
        });
        id++;
      }
    }
  }

  // Detect 8-neighbors via 3D center distance
  // Threshold covers same-face and cross-face orthogonal/diagonal neighbors
  const threshold = cellSize * Math.SQRT2 + cellSize * 0.01;
  const thresholdSq = threshold * threshold;

  for (let i = 0; i < tiles.length; i++) {
    const ci = tiles[i].center;
    for (let j = i + 1; j < tiles.length; j++) {
      const cj = tiles[j].center;
      const dx = ci[0] - cj[0];
      const dy = ci[1] - cj[1];
      const dz = ci[2] - cj[2];
      const distSq = dx * dx + dy * dy + dz * dz;
      if (distSq <= thresholdSq) {
        tiles[i].neighbors.push(j);
        tiles[j].neighbors.push(i);
      }
    }
  }

  return tiles;
}
