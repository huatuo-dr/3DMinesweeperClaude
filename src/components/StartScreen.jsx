// Start screen with difficulty selection

import { DIFFICULTIES } from '../hooks/useGameLogic';

export function StartScreen({ onStart }) {
  const diffEntries = Object.entries(DIFFICULTIES);

  return (
    <div className="start-screen">
      <div className="start-content">
        <h1 className="start-title">球面扫雷</h1>
        <p className="start-subtitle">3D Sphere Minesweeper</p>
        <div className="difficulty-list">
          {diffEntries.map(([key, diff]) => {
            const tileCount = 10 * diff.frequency * diff.frequency + 2;
            const mineCount = Math.floor(tileCount * diff.mineRatio);
            return (
              <button
                key={key}
                className={`difficulty-btn difficulty-${key}`}
                onClick={() => onStart(key)}
              >
                <span className="diff-label">{diff.label}</span>
                <span className="diff-detail">
                  {tileCount} 格 &middot; {mineCount} 雷
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
