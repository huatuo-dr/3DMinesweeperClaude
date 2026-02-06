// Game over modal overlay

export function GameOverModal({ won, timer, onRestart }) {
  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay">
      <div className={`modal ${won ? 'modal-win' : 'modal-lose'}`}>
        <h2>{won ? '胜利！' : '踩雷了！'}</h2>
        <p className="modal-time">用时 {formatTime(timer)}</p>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={() => onRestart('restart')}>
            再来一局
          </button>
          <button className="btn btn-secondary" onClick={() => onRestart('menu')}>
            返回菜单
          </button>
        </div>
      </div>
    </div>
  );
}
