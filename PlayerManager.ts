import * as hz from "horizon/core";
import {
  Events,
  GameState,
  MatchPlayers,
  PlayerRoles,
  WinState,
} from "./GameUtil";
import LeaderboardEvents from "./LeaderboardEvents";
import { PlayerSettings } from "Player";

class PlayerManager extends hz.Component<typeof PlayerManager> {
  static propsDefinition = {
    lobbySpawnPoint: { type: hz.PropTypes.Entity },
    gameSpawnPoint: { type: hz.PropTypes.Entity },
    stunUI: { type: hz.PropTypes.Entity },
  };

  public matchPlayers: MatchPlayers = new MatchPlayers();
  public PlayerRoles: PlayerRoles = new PlayerRoles();
  public selectedMurderer!: hz.Player;

  preStart(): void {
    this.connectLocalBroadcastEvent(
      Events.gameStateChanged,
      (data: { fromState: GameState; toState: GameState }) =>
        this.handleGameStateChanged(data.fromState, data.toState)
    );

    this.connectLocalBroadcastEvent(Events.assignPlayerRoles, () => {
      // Assign roles to all players in the match
      this.handleRoleAssignment();
    });

    this.connectNetworkBroadcastEvent(
      Events.playerShot,
      (data: { playerShooting: hz.Player; playerShot: hz.Player }) => {
        console.log("Player shot event received:", data);
        this.shouldStunPlayer(data.playerShooting, data.playerShot);
        this.playerEliminated(data.playerShot, data.playerShooting);
      }
    );

    this.connectNetworkBroadcastEvent(
      Events.playerEliminated,
      (data: { player: hz.Player; killer: hz.Player }) => {
        this.playerEliminated(data.player, data.killer);
      }
    );

    this.connectNetworkBroadcastEvent(Events.checkForEndCondition, () => {
      this.checkForEndConditions();
    });
  }

  start() {
    this.connectCodeBlockEvent(
      this.entity,
      hz.CodeBlockEvents.OnPlayerEnterWorld,
      (player: hz.Player) => this.handleOnPlayerEnterWorld(player)
    );

    /** Fires any time a user leaves the world */
    this.connectCodeBlockEvent(
      this.entity,
      hz.CodeBlockEvents.OnPlayerExitWorld,
      (player: hz.Player) => this.handleOnPlayerExitWorld(player)
    );
  }

  private handleOnPlayerEnterWorld(player: hz.Player): void {
    this.matchPlayers.addNewPlayer(player);
    player.locomotionSpeed.set(PlayerSettings.WalkSpeed);
    player.jumpSpeed.set(PlayerSettings.JumpHeight); }

  /** When a player leaves the world,
   * Remove that player from the PlayerMap.
   */
  private handleOnPlayerExitWorld(player: hz.Player): void {
    this.matchPlayers.removePlayer(player);
    this.checkForEndConditions();
  }

  teleportPlayerToLobby(player: hz.Player) {
    // Teleport the player to the lobby spawn point
    this.props.lobbySpawnPoint!.as(hz.SpawnPointGizmo).teleportPlayer(player);
  }

  private handleGameStateChanged(fromState: GameState, toState: GameState) {
    switch (toState) {
      case GameState.PreRound:
        if (fromState === GameState.Starting) {
          this.moveAllLobbyPlayersToMatch();
        }

        break;
      case GameState.GameOver:
        if (toState === GameState.GameOver) {
          this.moveAllMatchPlayersToLobby();
          // TODO: reset the world back to the original game state
        }
        break;
    }
  }

  private moveAllLobbyPlayersToMatch() {
    /* Gets all Lobby players using our helper classes*/
    const lobbyPlayers = this.matchPlayers.getPlayersInLobby();
    lobbyPlayers.list.forEach((p: hz.Player) => {
      this.movePlayerFromLobbyToMatch(p);
    });
  }

  /* Physically move a player and keep our data sets updated*/
  private movePlayerFromLobbyToMatch(player: hz.Player) {
    (this.props.gameSpawnPoint as hz.Entity)
      .as(hz.SpawnPointGizmo)
      .teleportPlayer(player);
    this.matchPlayers.moveToMatch(player);
  }

  private moveAllMatchPlayersToLobby() {
    /* Gets all Match players using our helper classes*/
    const matchPlayers = this.matchPlayers.getPlayersInMatch(); //this.matchPlayers.getPlayersInMatch();
    matchPlayers.forEach((p: hz.Player) => {
      this.movePlayerFromMatchToLobby(p);
      this.sendLocalBroadcastEvent(LeaderboardEvents.IncrementRoundsPlayed, {
        player: p,
      });
    });
  }

  private movePlayerFromMatchToLobby(player: hz.Player) {
    (this.props.lobbySpawnPoint as any)
      .as(hz.SpawnPointGizmo)
      .teleportPlayer(player);
    this.matchPlayers.moveToLobby(player);
  }

  private handleRoleAssignment() {
    const matchPlayers = this.matchPlayers.getPlayersInMatch();
    console.log("Assigning roles to match players:", matchPlayers.list);
    for (let i = 0; i < matchPlayers.size(); i++) {
      const player = matchPlayers.list[i];
      this.PlayerRoles.assignRole(player, PlayerRoles.Innocent);
    }

    const randomIndex = Math.floor(Math.random() * matchPlayers.size());
    this.PlayerRoles.assignRole(
      matchPlayers.list[randomIndex],
      PlayerRoles.Murderer
    );
    this.selectedMurderer = matchPlayers.list[randomIndex];

    // show popup for roles innocent & murderer
    for (const player of matchPlayers.list) {
      const role = this.PlayerRoles.getRole(player);
      this.world.ui.showPopupForPlayer(player, `You are the ${role}!`, 5);
    }

    console.log(
      "Player roles have been assigned:",
      Array.from(this.PlayerRoles.getRoles().values())
    );

    // Broadcast the selected murderer
    this.sendNetworkBroadcastEvent<{ player: hz.Player }>(
      Events.selectedMurderer,
      { player: matchPlayers.list[randomIndex] }
    );
  }

  shouldStunPlayer(playerShooting: hz.Player, playerShot: hz.Player) {
    const role = this.PlayerRoles.getRole(playerShot);
    if (role === PlayerRoles.Innocent) {
      // Stun the player for 3 seconds
      playerShooting.focusUI(this.props.stunUI as hz.Entity);
      playerShooting.throwHeldItem();
      this.world.ui.showPopupForPlayer(
        playerShooting,
        "You have been stunned for being shot!",
        3
      );
      this.async.setTimeout(() => {
        playerShooting.unfocusUI();
      }, 3000);
    }
  }

  playerEliminated(player: hz.Player, killer: hz.Player | null) {
    if (!player) {
      console.warn("playerEliminated called with undefined player");
      return;
    }

    if (this.matchPlayers.getPlayersInMatch().includes(player)) {
      this.PlayerRoles.assignRole(player, PlayerRoles.Spectator);
      player.playAvatarGripPoseAnimationByName("Die");
      // add a delay before teleporting to lobby
      this.async.setTimeout(() => {
        this.matchPlayers.moveToLobby(player);
        this.teleportPlayerToLobby(player);
        player.stopAvatarAnimation();
      }, 1000);

      this.checkForEndConditions();
    }

    if (this.PlayerRoles.getRole(player) === PlayerRoles.Murderer && killer) {
      this.sendLocalBroadcastEvent(
        LeaderboardEvents.IncrementMurdererEliminations,
        {
          player: killer,
          role: "Murderer",
        }
      );
    } else if (
      this.PlayerRoles.getRole(player) === PlayerRoles.Innocent &&
      killer
    ) {
      this.sendLocalBroadcastEvent(LeaderboardEvents.IncrementEliminations, {
        player: killer,
        role: "Innocent",
      });
    }
  }

  checkForEndConditions() {
    // If no innocent players are left, the game is over
    // If murderer is killed, game is over
    const innocentPlayers = Array.from(this.PlayerRoles.getRoles().entries())
      .filter(([player, role]) => role === PlayerRoles.Innocent)
      .map(([player]) => player);

    const murdererPlayers = Array.from(this.PlayerRoles.getRoles().entries())
      .filter(([player, role]) => role === PlayerRoles.Murderer)
      .map(([player]) => player);

    if (innocentPlayers.length === 0) {
      // No innocent players left
      this.sendLocalBroadcastEvent(
        LeaderboardEvents.IncrementRoundsWonAsMurderer,
        {
          player: this.selectedMurderer,
        }
      );

      this.sendLocalBroadcastEvent(Events.gameOver, {
        winState: WinState.MurdererWins,
      });
    }

    if (murdererPlayers.length === 0) {
      // Murderer has been killed

      // foreach loop that grabs the remaining players and increments RoundsWonAsInnocent
      this.matchPlayers.getPlayersInMatch().forEach((player) => {
        if (this.PlayerRoles.getRole(player) === PlayerRoles.Innocent) {
          this.sendLocalBroadcastEvent(
            LeaderboardEvents.IncrementRoundsWonAsInnocent,
            {
              player,
            }
          );
        }
      });

      this.sendLocalBroadcastEvent(Events.gameOver, {
        winState: WinState.InnocentsWin,
      });
    }
  }
}

hz.Component.register(PlayerManager);
