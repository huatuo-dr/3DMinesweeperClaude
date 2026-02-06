// HUD overlay: timer, mine counter, back button

export function HUD({ timer, mineCount, flagCount, onReset }) {
  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="hud">
      <button className="hud-btn" onClick={onReset}>
        &larr; 返回
      </button>
      <div className="hud-info">
        <span className="hud-mines">💣 {mineCount - flagCount}</span>
        <span className="hud-timer">⏱ {formatTime(timer)}</span>
      </div>
    </div>
  );
}
