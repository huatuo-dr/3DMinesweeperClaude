// Main game container

import { useState } from 'react';
import { useGameLogic } from '../hooks/useGameLogic';
import { StartScreen } from './StartScreen';
import { GameScene } from './GameScene';
import { HUD } from './HUD';
import { ResultPanel } from './ResultPanel';
import { Fireworks } from './Fireworks';

export function Game() {
  const game = useGameLogic();
  const [showHelp, setShowHelp] = useState(false);

  if (game.phase === 'start') {
    return <StartScreen onStart={game.startGame} />;
  }

  const handleRestart = () => game.startGame(game.gameConfig);
  const gameOver = game.phase === 'won' || game.phase === 'lost';

  return (
    <div className={`game-container ${game.phase === 'lost' ? 'game-explode' : ''}`}>
      {/* Red flash overlay for defeat */}
      {game.phase === 'lost' && <div className="explode-flash" />}

      {/* Fireworks for victory */}
      {game.phase === 'won' && <Fireworks />}

      <HUD
        timer={game.timer}
        mineCount={game.mineCount}
        flagCount={game.flagCount}
        onReset={game.resetGame}
        onHelp={() => setShowHelp(h => !h)}
      />
      <GameScene
        tiles={game.tiles}
        onReveal={game.handleReveal}
        onFlag={game.handleFlag}
        phase={game.phase}
        mode={game.gameConfig.mode}
      />

      {gameOver && (
        <ResultPanel
          phase={game.phase}
          timer={game.timer}
          gameConfig={game.gameConfig}
          mineCount={game.mineCount}
          undoCount={game.undoCount}
          onUndo={game.handleUndo}
          onRestart={handleRestart}
          onMenu={game.resetGame}
        />
      )}

      {/* Help overlay */}
      {showHelp && (
        <div className="help-overlay" onClick={() => setShowHelp(false)}>
          <div className="help-content" onClick={e => e.stopPropagation()}>
            <div className="help-title">操作指南</div>
            <div className="help-items">
              <p>点击 — 揭开格子</p>
              <p>双击 — 标记/取消旗帜</p>
              <p>右键 — 标记旗帜（PC）</p>
              <p>拖动 — 旋转视角</p>
              <p>滚轮/双指 — 缩放</p>
            </div>
            <button className="btn btn-secondary help-close" onClick={() => setShowHelp(false)}>
              知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
