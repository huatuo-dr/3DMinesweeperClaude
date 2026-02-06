// Game state management with useReducer

import { useReducer, useCallback, useRef, useEffect } from 'react';
import { generateGoldberg } from '../utils/goldberg';
import {
  initGameTiles, placeMines, revealTile,
  toggleFlag, checkWin, revealAllMines,
} from '../utils/minesweeper';

export const DIFFICULTIES = {
  easy:   { frequency: 3, mineRatio: 0.15, label: '简单' },
  medium: { frequency: 5, mineRatio: 0.18, label: '中等' },
  hard:   { frequency: 7, mineRatio: 0.20, label: '困难' },
};

const initialState = {
  phase: 'start',
  difficulty: null,
  tiles: [],
  mineCount: 0,
  flagCount: 0,
  timer: 0,
  firstClick: true,
};

function reducer(state, action) {
  switch (action.type) {
    case 'START_GAME': {
      const { tiles, mineCount, difficulty } = action.payload;
      return { ...initialState, phase: 'playing', difficulty, tiles, mineCount };
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

  const startGame = useCallback((diffKey) => {
    const diff = DIFFICULTIES[diffKey];
    const goldberg = generateGoldberg(diff.frequency);
    const tiles = initGameTiles(goldberg);
    const mineCount = Math.floor(tiles.length * diff.mineRatio);
    dispatch({
      type: 'START_GAME',
      payload: { tiles, mineCount, difficulty: { ...diff, key: diffKey } },
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
