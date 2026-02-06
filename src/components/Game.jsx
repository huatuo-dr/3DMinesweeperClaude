// Main game container: routes between start screen and game scene

import { useGameLogic } from '../hooks/useGameLogic';
import { StartScreen } from './StartScreen';
import { GameScene } from './GameScene';
import { HUD } from './HUD';

export function Game() {
  const game = useGameLogic();

  if (game.phase === 'start') {
    return <StartScreen onStart={game.startGame} />;
  }

  const handleRestart = () => {
    game.startGame(game.gameConfig);
  };

  return (
    <div className="game-container">
      <HUD
        timer={game.timer}
        mineCount={game.mineCount}
        flagCount={game.flagCount}
        phase={game.phase}
        onReset={game.resetGame}
        onRestart={handleRestart}
      />
      <GameScene
        tiles={game.tiles}
        onReveal={game.handleReveal}
        onFlag={game.handleFlag}
        phase={game.phase}
        mode={game.gameConfig.mode}
      />
    </div>
  );
}
