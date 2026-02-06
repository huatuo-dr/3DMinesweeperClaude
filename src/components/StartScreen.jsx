// Start screen with mode, size, and density configuration

import { useState } from 'react';
import { SIZE_CONFIG, getTileCount } from '../hooks/useGameLogic';

const SIZE_KEYS = ['tiny', 'small', 'medium', 'large', 'huge'];

export function StartScreen({ onStart }) {
  const [mode, setMode] = useState('sphere');
  const [size, setSize] = useState('medium');
  const [density, setDensity] = useState(18);

  const tileCount = getTileCount(mode, size);
  const mineCount = Math.floor(tileCount * density / 100);

  return (
    <div className="start-screen">
      <div className="start-content">
        <h1 className="start-title">3D 扫雷</h1>
        <p className="start-subtitle">3D Minesweeper</p>

        {/* Mode selector */}
        <div className="config-section">
          <h3 className="config-label">模式选择</h3>
          <div className="mode-selector">
            <button
              className={`mode-btn ${mode === 'sphere' ? 'mode-active' : ''}`}
              onClick={() => setMode('sphere')}
            >
              球体
            </button>
            <button
              className={`mode-btn ${mode === 'cube' ? 'mode-active' : ''}`}
              onClick={() => setMode('cube')}
            >
              方体
            </button>
          </div>
        </div>

        {/* Size selector */}
        <div className="config-section">
          <h3 className="config-label">尺寸选择</h3>
          <div className="size-selector">
            {SIZE_KEYS.map(key => {
              const count = getTileCount(mode, key);
              return (
                <button
                  key={key}
                  className={`size-btn ${size === key ? 'size-active' : ''}`}
                  onClick={() => setSize(key)}
                >
                  <span className="size-name">{SIZE_CONFIG[mode][key].label}</span>
                  <span className="size-count">{count}格</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Density slider */}
        <div className="config-section">
          <h3 className="config-label">
            雷点密度 <span className="density-value">{density}%</span>
          </h3>
          <input
            type="range"
            className="density-slider"
            min="10"
            max="30"
            step="1"
            value={density}
            onChange={(e) => setDensity(Number(e.target.value))}
          />
          <div className="density-range">
            <span>10%</span>
            <span>30%</span>
          </div>
        </div>

        {/* Start button */}
        <button
          className="start-btn"
          onClick={() => onStart({ mode, size, density: density / 100 })}
        >
          <span className="start-btn-label">开始游戏</span>
          <span className="start-btn-detail">{tileCount}格 &middot; {mineCount}雷</span>
        </button>
      </div>
    </div>
  );
}
