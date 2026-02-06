// Goldberg polyhedron generator
// Creates a dual of a geodesic sphere (subdivided icosahedron)
// Result: 12 pentagons + (10n²-10) hexagons = 10n²+2 total tiles

const PHI = (1 + Math.sqrt(5)) / 2;

function normalize(v) {
  const len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
  if (len === 0) return [0, 0, 0];
  return [v[0] / len, v[1] / len, v[2] / len];
}

function cross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

// Build a regular icosahedron with vertices on the unit sphere
function createIcosahedron() {
  const t = PHI;
  const raw = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ];
  const vertices = raw.map(normalize);

  const faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];

  return { vertices, faces };
}

/**
 * Generate a Goldberg polyhedron by subdividing an icosahedron
 * and computing its dual.
 * @param {number} frequency - Subdivision level (n). Tiles = 10n²+2
 * @returns {Array} tiles - Array of tile objects with id, center, vertices, neighbors, sides
 */
export function generateGoldberg(frequency) {
  const { vertices: icoVerts, faces: icoFaces } = createIcosahedron();

  const allVertices = [];
  const allTriangles = [];
  const vertexMap = new Map();

  // Add a vertex, deduplicating by rounded coordinates
  function addVertex(v) {
    const key = v.map(c => c.toFixed(8)).join(',');
    if (vertexMap.has(key)) return vertexMap.get(key);
    const idx = allVertices.length;
    allVertices.push(v);
    vertexMap.set(key, idx);
    return idx;
  }

  // Subdivide each icosahedron face using barycentric interpolation
  for (const face of icoFaces) {
    const vA = icoVerts[face[0]];
    const vB = icoVerts[face[1]];
    const vC = icoVerts[face[2]];

    // Create grid of interpolated points: P(i,j) = normalize((i*A + j*B + k*C) / n)
    const grid = [];
    for (let i = 0; i <= frequency; i++) {
      grid[i] = [];
      for (let j = 0; j <= frequency - i; j++) {
        const k = frequency - i - j;
        const point = normalize([
          (i * vA[0] + j * vB[0] + k * vC[0]) / frequency,
          (i * vA[1] + j * vB[1] + k * vC[1]) / frequency,
          (i * vA[2] + j * vB[2] + k * vC[2]) / frequency,
        ]);
        grid[i][j] = addVertex(point);
      }
    }

    // Triangulate the grid
    for (let i = 0; i < frequency; i++) {
      for (let j = 0; j < frequency - i; j++) {
        allTriangles.push([grid[i][j], grid[i + 1][j], grid[i][j + 1]]);
        if (i + j < frequency - 1) {
          allTriangles.push([grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]]);
        }
      }
    }
  }

  // Build vertex -> triangle adjacency
  const vertexTriangles = allVertices.map(() => []);
  allTriangles.forEach((tri, tIdx) => {
    tri.forEach(vIdx => vertexTriangles[vIdx].push(tIdx));
  });

  // Compute triangle centroids projected to unit sphere
  const centroids = allTriangles.map(tri => {
    const cx = (allVertices[tri[0]][0] + allVertices[tri[1]][0] + allVertices[tri[2]][0]) / 3;
    const cy = (allVertices[tri[0]][1] + allVertices[tri[1]][1] + allVertices[tri[2]][1]) / 3;
    const cz = (allVertices[tri[0]][2] + allVertices[tri[1]][2] + allVertices[tri[2]][2]) / 3;
    return normalize([cx, cy, cz]);
  });

  // Collect unique edges for neighbor computation
  const edgeSet = new Set();
  const edgeList = [];
  allTriangles.forEach(tri => {
    for (let i = 0; i < 3; i++) {
      const a = tri[i];
      const b = tri[(i + 1) % 3];
      const key = a < b ? `${a}-${b}` : `${b}-${a}`;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edgeList.push([a, b]);
      }
    }
  });

  // Create dual tiles: each geodesic vertex becomes a polygon face
  const tiles = allVertices.map((vertex, vIdx) => {
    const adjTriIndices = vertexTriangles[vIdx];

    // Sort surrounding triangle centroids by angle in the tangent plane
    const normal = vertex;
    const arbitrary = Math.abs(normal[1]) < 0.9 ? [0, 1, 0] : [1, 0, 0];
    const tangentU = normalize(cross(normal, arbitrary));
    const tangentV = cross(normal, tangentU);

    const ordered = adjTriIndices.map(tIdx => {
      const c = centroids[tIdx];
      const dx = c[0] - vertex[0];
      const dy = c[1] - vertex[1];
      const dz = c[2] - vertex[2];
      const u = dx * tangentU[0] + dy * tangentU[1] + dz * tangentU[2];
      const v = dx * tangentV[0] + dy * tangentV[1] + dz * tangentV[2];
      return { centroid: c, angle: Math.atan2(v, u) };
    });
    ordered.sort((a, b) => a.angle - b.angle);

    return {
      id: vIdx,
      center: vertex,
      vertices: ordered.map(o => o.centroid),
      neighbors: [],
      sides: adjTriIndices.length,
    };
  });

  // Neighbors: two tiles are adjacent if their geodesic vertices share an edge
  edgeList.forEach(([a, b]) => {
    tiles[a].neighbors.push(b);
    tiles[b].neighbors.push(a);
  });

  return tiles;
}
