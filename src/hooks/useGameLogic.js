// Game state management with useReducer

import { useReducer, useCallback, useRef, useEffect } from 'react';
import { generateGoldberg } from '../utils/goldberg';
import { generateCubeSurface } from '../utils/cubeSurface';
import {
  initGameTiles, placeMines, revealTile,
  toggleFlag, checkWin, revealAllMines,
} from '../utils/minesweeper';

// Size configurations for each mode
export const SIZE_CONFIG = {
  sphere: {
    tiny:   { param: 2, label: '迷你' },   // 10*4+2 = 42
    small:  { param: 3, label: '小' },      // 10*9+2 = 92
    medium: { param: 5, label: '中' },      // 10*25+2 = 252
    large:  { param: 7, label: '大' },      // 10*49+2 = 492
    huge:   { param: 10, label: '巨大' },   // 10*100+2 = 1002
  },
  cube: {
    tiny:   { param: 3, label: '迷你' },    // 6*9 = 54
    small:  { param: 5, label: '小' },      // 6*25 = 150
    medium: { param: 8, label: '中' },      // 6*64 = 384
    large:  { param: 12, label: '大' },     // 6*144 = 864
    huge:   { param: 16, label: '巨大' },   // 6*256 = 1536
  },
};

// Compute tile count for a given mode and size
export function getTileCount(mode, sizeKey) {
  const p = SIZE_CONFIG[mode][sizeKey].param;
  return mode === 'sphere' ? 10 * p * p + 2 : 6 * p * p;
}

const initialState = {
  phase: 'start',
  gameConfig: null,
  tiles: [],
  mineCount: 0,
  flagCount: 0,
  timer: 0,
  firstClick: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'START_GAME': {
      const { tiles, mineCount, gameConfig } = action.payload;
      return { ...initialState, phase: 'playing', gameConfig, tiles, mineCount };
    }

    case 'REVEAL': {
      if (state.phase !== 'playing') return state;
      const { tileId } = action.payload;
      let { tiles, firstClick } = state;

      if (tiles[tileId].isRevealed || tiles[tileId].isFlagged) return state;

      // Place mines on first click
      if (firstClick) {
        tiles = placeMines(tiles, state.mineCount, tileId);
        firstClick = false;
      }

      // Hit a mine
      if (tiles[tileId].isMine) {
        return { ...state, tiles: revealAllMines(tiles), phase: 'lost', firstClick };
      }

      // Normal reveal
      const newTiles = revealTile(tiles, tileId);
      return {
        ...state,
        tiles: newTiles,
        phase: checkWin(newTiles) ? 'won' : 'playing',
        firstClick,
      };
    }

    case 'FLAG': {
      if (state.phase !== 'playing') return state;
      const { tileId } = action.payload;
      const tile = state.tiles[tileId];
      if (tile.isRevealed) return state;
      return {
        ...state,
        tiles: toggleFlag(state.tiles, tileId),
        flagCount: state.flagCount + (tile.isFlagged ? -1 : 1),
      };
    }

    case 'TICK':
      return state.phase === 'playing'
        ? { ...state, timer: state.timer + 1 }
        : state;

    case 'RESET':
      return initialState;

    default:
      return state;
  }
}

export function useGameLogic() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const timerRef = useRef(null);

  const startGame = useCallback(({ mode, size, density }) => {
    const param = SIZE_CONFIG[mode][size].param;
    const geometryTiles = mode === 'sphere'
      ? generateGoldberg(param)
      : generateCubeSurface(param);
    const tiles = initGameTiles(geometryTiles);
    const mineCount = Math.floor(tiles.length * density);
    dispatch({
      type: 'START_GAME',
      payload: { tiles, mineCount, gameConfig: { mode, size, density } },
    });
  }, []);

  const handleReveal = useCallback((tileId) => {
    dispatch({ type: 'REVEAL', payload: { tileId } });
  }, []);

  const handleFlag = useCallback((tileId) => {
    dispatch({ type: 'FLAG', payload: { tileId } });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  // Timer management
  useEffect(() => {
    if (state.phase === 'playing') {
      timerRef.current = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [state.phase]);

  return { ...state, startGame, handleReveal, handleFlag, resetGame };
}
