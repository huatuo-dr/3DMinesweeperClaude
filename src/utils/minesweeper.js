// Minesweeper game logic for sphere tiles

// Initialize tiles with default game state
export function initGameTiles(goldbergTiles) {
  return goldbergTiles.map(tile => ({
    ...tile,
    isMine: false,
    isRevealed: false,
    isFlagged: false,
    adjacentMines: 0,
  }));
}

// Place mines randomly, avoiding the first-click tile and its neighbors
export function placeMines(tiles, mineCount, excludeId) {
  const excludeSet = new Set([excludeId, ...tiles[excludeId].neighbors]);
  const candidates = tiles
    .map(t => t.id)
    .filter(id => !excludeSet.has(id));

  // Fisher-Yates shuffle
  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [candidates[i], candidates[j]] = [candidates[j], candidates[i]];
  }

  const actualCount = Math.min(mineCount, candidates.length);
  const mineIds = new Set(candidates.slice(0, actualCount));
  const newTiles = tiles.map(t => ({ ...t, isMine: mineIds.has(t.id) }));

  // Calculate adjacent mine counts
  newTiles.forEach(tile => {
    tile.adjacentMines = tile.neighbors.filter(nId => newTiles[nId].isMine).length;
  });

  return newTiles;
}

// Reveal a tile with BFS flood fill for empty regions
export function revealTile(tiles, tileId) {
  const newTiles = tiles.map(t => ({ ...t }));
  const queue = [tileId];
  const visited = new Set();

  while (queue.length > 0) {
    const id = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);

    const tile = newTiles[id];
    if (tile.isFlagged || tile.isMine) continue;

    tile.isRevealed = true;

    // Expand if no adjacent mines
    if (tile.adjacentMines === 0) {
      for (const nId of tile.neighbors) {
        if (!visited.has(nId) && !newTiles[nId].isRevealed) {
          queue.push(nId);
        }
      }
    }
  }

  return newTiles;
}

// Toggle flag on a tile
export function toggleFlag(tiles, tileId) {
  return tiles.map(t =>
    t.id === tileId ? { ...t, isFlagged: !t.isFlagged } : t
  );
}

// Check if all non-mine tiles are revealed
export function checkWin(tiles) {
  return tiles.every(t => t.isMine || t.isRevealed);
}

// Reveal all mines (on game over)
export function revealAllMines(tiles) {
  return tiles.map(t => t.isMine ? { ...t, isRevealed: true } : t);
}
