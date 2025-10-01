import * as hz from "horizon/core";
import { GameState, Events, WinState } from "./GameUtil";
import { SFXEvents } from "./SFXEvents";
import { WeatherEvents } from "WeatherManager";

// Define network events
// Moved to Events.ts

class GameManager extends hz.Component<typeof GameManager> {
  static propsDefinition = {
    startGameTrigger: { type: hz.PropTypes.Entity },
    gameStateText: { type: hz.PropTypes.Entity },
  };

  private gameState = GameState.WaitingForPlayers;
  private roundStartDuration = 30; // seconds, adjusted to match instructions
  private preRoundDuration = 15; // seconds
  private roundInProgressDuration = 420; // 7 minutes
  private roundEndDuration = 15; // seconds
  private minPlayersToStart = 1; // will be overridden based on debug mode
  private gameStarted: boolean = false;
  private countdownActive: boolean = false;
  private gameEndingCooldown: boolean = false;

  timerID: number = 0;
  countdownTimeInMS: number = 3000;

  preStart(): void {
    this.connectLocalBroadcastEvent(
      Events.registerNewMatch,
      (data: { player: hz.Player }) => {
        this.setGameState(GameState.Starting);
      }
    );

    this.connectLocalBroadcastEvent(
      Events.playerRolesAssigned,
      (data: { playerRoles: any }) => {
        // Handle player roles assigned event
        console.log("Player roles have been assigned:", data.playerRoles);
      }
    );

    this.connectLocalBroadcastEvent(
      Events.gameStateChanged,
      (data: { fromState: GameState; toState: GameState }) => {
        console.log(
          `Game state changed from ${GameState[data.fromState]} to ${
            GameState[data.toState]
          }`
        );
      }
    );

    this.connectLocalBroadcastEvent(
      Events.gameOver,
      (data: { winState: any }) => {
        console.log("Game over event received with win state:", data.winState);
        this.handleGameOver(data.winState);
      }
    );
  }

  start() {
    this.connectCodeBlockEvent(
      this.props.startGameTrigger as any as hz.TriggerGizmo,
      hz.CodeBlockEvents.OnPlayerEnterTrigger,
      (player: hz.Player) => {
        if (player) {
          if (this.world.getPlayers().length >= this.minPlayersToStart) {
            if (this.gameStarted || this.countdownActive) {
              this.world.ui.showPopupForPlayer(
                player,
                `Game is already starting or in progress. Please wait.`,
                3
              );
              return;
            }
            this.sendLocalBroadcastEvent(Events.registerNewMatch, { player });
          } else {
            this.world.ui.showPopupForPlayer(
              player,
              `Not enough players to start the game. Minimum required: ${this.minPlayersToStart}`,
              3
            );
          }
        }
      }
    );

    this.props
      .gameStateText!.as(hz.TextGizmo)
      .text.set("Waiting for Players...");
  }

  public setGameState(state: GameState): void {
    if (this.gameState === state) {
      return;
    }

    const previousSate = this.gameState;
    switch (state) {
      case GameState.WaitingForPlayers:
        this.gameState = GameState.WaitingForPlayers;
        break;
      case GameState.Starting:
        this.gameState = GameState.Starting;
        this.handleNewMatchStarting();
        break;
      case GameState.PreRound:
        this.gameState = GameState.PreRound;
        this.handlePreRoundStarted();
        break;
      case GameState.RoundInProgress:
        this.gameState = GameState.RoundInProgress;
        this.handleRoundStarted();
        break;
      case GameState.GameOver:
        this.gameState = GameState.GameOver;
        this.handleGameOver();
        break;
    }

    this.sendLocalBroadcastEvent(Events.gameStateChanged, {
      fromState: previousSate,
      toState: this.gameState,
    });
  }

  handleNewMatchStarting() {
    if (this.countdownActive) {
      return;
    }
    if (this.gameStarted) {
      return;
    }

    this.sendLocalBroadcastEvent(SFXEvents.PreRoundStartSFX, {});

    this.timerID = this.async.setInterval(() => {
      if (this.countdownTimeInMS > 0) {
        this.world.ui.showPopupForEveryone(
          `Match starting in... \n ${this.countdownTimeInMS / 1000}`,
          1
        );
        this.props
          .gameStateText!.as(hz.TextGizmo)
          .text.set(`Match starting in... \n ${this.countdownTimeInMS / 1000}`);
        this.countdownTimeInMS -= 1000;
      } else {
        if (this.timerID !== 0) {
          this.async.clearInterval(this.timerID);
          this.timerID = 0;
          this.setGameState(GameState.PreRound);
          this.countdownTimeInMS = 3000; // reset the initial countdown value
          this.countdownActive = false;
        }
      }
    }, 1000);

  }

  handlePreRoundStarted() {
    this.gameStarted = true;
    this.world.ui.showPopupForEveryone(`Pre-Round Started!`, 3);
    this.props.gameStateText!.as(hz.TextGizmo).text.set(`Pre-Round Started!`);
    this.sendLocalBroadcastEvent(SFXEvents.PlayersSpawnedSFX, {});
    this.sendLocalBroadcastEvent(WeatherEvents.stormStart, {});
    // implement pre-round timer
    this.timerID = this.async.setTimeout(() => {
      this.setGameState(GameState.RoundInProgress);
      this.async.clearTimeout(this.timerID);
      this.timerID = 0;
    }, this.preRoundDuration * 1000);

    this.sendLocalBroadcastEvent(Events.gameStateChanged, {
      fromState: GameState.Starting,
      toState: GameState.PreRound,
    });
  }

  handleRoundStarted() {
    this.world.ui.showPopupForEveryone(`Round Started!`, 3);
    this.props.gameStateText!.as(hz.TextGizmo).text.set(`Round Started!`);
    this.sendLocalBroadcastEvent(SFXEvents.RoundStartSFX, {});
    this.sendLocalBroadcastEvent(Events.assignPlayerRoles, {});

    // implement 30 second cooldown before parts spawn
    this.timerID = this.async.setTimeout(() => {
      this.sendLocalBroadcastEvent(Events.spawnParts, {});
      this.sendLocalBroadcastEvent(SFXEvents.PartsSpawnedSFX, {});
      this.world.ui.showPopupForEveryone(`Parts have spawned!`, 3);
      this.async.clearTimeout(this.timerID);
      this.timerID = 0;
    }, 3000);

    // implement round timer
    this.timerID = this.async.setTimeout(() => {
      this.setGameState(GameState.GameOver);
      this.async.clearTimeout(this.timerID);
      this.timerID = 0;
    }, this.roundInProgressDuration * 1000);
  }

  handleGameOver(winState?: WinState) {
    if (this.gameEndingCooldown) {
      return;
    }

    if (this.gameStarted) {
      this.gameEndingCooldown = true;

      if (winState === WinState.InnocentsWin) {
        this.world.ui.showPopupForEveryone(`Innocents Win!`, 3);
        this.props.gameStateText!.as(hz.TextGizmo).text.set(`Innocents Win!`);
        this.sendLocalBroadcastEvent(SFXEvents.InnocentWinSFX, {});
      } else if (winState === WinState.MurdererWins) {
        this.world.ui.showPopupForEveryone(`Murderer Wins!`, 3);
        this.props.gameStateText!.as(hz.TextGizmo).text.set(`Murderer Wins!`);
        this.sendLocalBroadcastEvent(SFXEvents.MurdererWinSFX, {});
      } else if (winState === WinState.Draw) {
        this.world.ui.showPopupForEveryone(`It's a Draw!`, 3);
        this.props.gameStateText!.as(hz.TextGizmo).text.set(`It's a Draw!`);
        this.sendLocalBroadcastEvent(SFXEvents.InnocentWinSFX, {});
      }
      if (this.timerID === 0) {
        this.world.ui.showPopupForEveryone(
          `Game Over! \n Teleporting back to Lobby`,
          3
        );

        this.props.gameStateText!.as(hz.TextGizmo).text.set(`Game Over!`);
        this.timerID = this.async.setTimeout(() => {
          this.setGameState(GameState.GameOver);
          this.resetForNextGame();
          this.async.clearTimeout(this.timerID);
          this.timerID = 0;
        }, 10000);
      }
    }
  }

  resetForNextGame() {
    this.gameStarted = false;
    this.countdownActive = false;
    this.countdownTimeInMS = 3000;
    this.gameEndingCooldown = false;
    if (this.timerID !== 0) {
      this.async.clearTimeout(this.timerID);
      this.timerID = 0;
    }
    // after reset, go to waiting for players state
    this.async.setTimeout(() => {
      this.setGameState(GameState.WaitingForPlayers);
    }, 10000);
  }
}

hz.Component.register(GameManager);
