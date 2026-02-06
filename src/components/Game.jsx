// Main game container

import { useGameLogic } from '../hooks/useGameLogic';
import { StartScreen } from './StartScreen';
import { GameScene } from './GameScene';
import { HUD } from './HUD';
import { ResultPanel } from './ResultPanel';
import { Fireworks } from './Fireworks';

export function Game() {
  const game = useGameLogic();

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
          onRestart={handleRestart}
          onMenu={game.resetGame}
        />
      )}
    </div>
  );
}
