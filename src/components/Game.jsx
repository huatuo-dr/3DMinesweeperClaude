// Main game container: routes between start screen and game scene

import { useGameLogic } from '../hooks/useGameLogic';
import { StartScreen } from './StartScreen';
import { GameScene } from './GameScene';
import { HUD } from './HUD';
import { GameOverModal } from './GameOverModal';

export function Game() {
  const game = useGameLogic();

  if (game.phase === 'start') {
    return <StartScreen onStart={game.startGame} />;
  }

  const handleGameOver = (action) => {
    if (action === 'restart') {
      game.startGame(game.difficulty.key);
    } else {
      game.resetGame();
    }
  };

  return (
    <div className="game-container">
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
      />
      {(game.phase === 'won' || game.phase === 'lost') && (
        <GameOverModal
          won={game.phase === 'won'}
          timer={game.timer}
          onRestart={handleGameOver}
        />
      )}
    </div>
  );
}
