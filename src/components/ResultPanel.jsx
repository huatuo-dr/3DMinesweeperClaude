// Right-side slide-in panel showing game result details (collapsible)

import { useState } from 'react';
import { SIZE_CONFIG, getTileCount } from '../hooks/useGameLogic';

const MODE_LABELS = { sphere: '球体', cube: '方体' };

export function ResultPanel({ phase, timer, gameConfig, mineCount, undoCount, onUndo, onRestart, onMenu }) {
  const [collapsed, setCollapsed] = useState(false);

  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const won = phase === 'won';
  const lost = phase === 'lost';
  const tileCount = getTileCount(gameConfig.mode, gameConfig.size);
  const sizeLabel = SIZE_CONFIG[gameConfig.mode][gameConfig.size].label;
  const densityPct = Math.round(gameConfig.density * 100);

  // Collapsed state: show a small toggle button
  if (collapsed) {
    return (
      <button
        className="result-toggle-btn"
        onClick={() => setCollapsed(false)}
        title="展开详情"
      >
        📊
      </button>
    );
  }

  return (
    <div className={`result-panel ${won ? 'result-win' : 'result-lose'}`}>
      <button
        className="result-collapse-btn"
        onClick={() => setCollapsed(true)}
        title="收起"
      >
        ✕
      </button>

      <h2 className="result-title">{won ? '🎉 胜利！' : '💥 失败！'}</h2>

      <div className="result-details">
        <div className="result-row">
          <span className="result-label">模式</span>
          <span className="result-value">{MODE_LABELS[gameConfig.mode]}</span>
        </div>
        <div className="result-row">
          <span className="result-label">尺寸</span>
          <span className="result-value">{sizeLabel}</span>
        </div>
        <div className="result-row">
          <span className="result-label">密度</span>
          <span className="result-value">{densityPct}%</span>
        </div>
        <div className="result-row">
          <span className="result-label">格数</span>
          <span className="result-value">{tileCount}</span>
        </div>
        <div className="result-row">
          <span className="result-label">雷数</span>
          <span className="result-value">{mineCount}</span>
        </div>
        <div className="result-row">
          <span className="result-label">用时</span>
          <span className="result-value result-time">{formatTime(timer)}</span>
        </div>
        {undoCount > 0 && (
          <div className="result-row">
            <span className="result-label">撤销</span>
            <span className="result-value">{undoCount}次</span>
          </div>
        )}
      </div>

      <div className="result-actions">
        {lost && (
          <button className="btn btn-undo" onClick={onUndo}>
            ↩ 撤销({undoCount})
          </button>
        )}
        <button className="btn btn-primary" onClick={onRestart}>再来一局</button>
        <button className="btn btn-secondary" onClick={onMenu}>返回菜单</button>
      </div>
    </div>
  );
}
