// HUD overlay: timer, mine counter, back button, game result

export function HUD({ timer, mineCount, flagCount, phase, onReset, onRestart }) {
  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const gameOver = phase === 'won' || phase === 'lost';

  return (
    <div className="hud">
      <button className="hud-btn" onClick={onReset}>
        &larr; 返回
      </button>

      {/* Game result banner (replaces modal) */}
      {gameOver && (
        <div className={`hud-result ${phase === 'won' ? 'hud-result-win' : 'hud-result-lose'}`}>
          <span className="hud-result-text">
            {phase === 'won' ? '🎉 胜利' : '💥 失败'}
          </span>
          <span className="hud-result-time">{formatTime(timer)}</span>
          <button className="hud-btn hud-btn-restart" onClick={onRestart}>
            再来一局
          </button>
        </div>
      )}

      {!gameOver && (
        <div className="hud-info">
          <span className="hud-mines">
            💣 {mineCount - flagCount}
          </span>
          <span className="hud-timer">
            ⏱ {formatTime(timer)}
          </span>
        </div>
      )}
    </div>
  );
}
