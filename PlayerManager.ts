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
    maxPlayers: { type: hz.PropTypes.Number, default: 8 },
    playerScript1: { type: hz.PropTypes.Entity },
    playerScript2: { type: hz.PropTypes.Entity },
    playerScript3: { type: hz.PropTypes.Entity },
    playerScript4: { type: hz.PropTypes.Entity },
    playerScript5: { type: hz.PropTypes.Entity },
    playerScript6: { type: hz.PropTypes.Entity },
    playerScript7: { type: hz.PropTypes.Entity },
    playerScript8: { type: hz.PropTypes.Entity },
  };

  public matchPlayers: MatchPlayers = new MatchPlayers();
  public PlayerRoles: PlayerRoles = new PlayerRoles();
  public selectedMurderer!: hz.Player;
  public selectedDetective!: hz.Player;

  // Player script management
  private playerScripts: (hz.Entity | undefined)[] = [];
  private playerScriptAssignments: Map<hz.Player, number> = new Map();
  private serverPlayer?: hz.Player; 

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

    this.connectLocalBroadcastEvent(Events.equipRoleWeapons, () => {
      this.equipRoleWeapons();
    });
  }

  start() {
    this.serverPlayer = this.world.getServerPlayer();

    // Initialize player scripts array
    this.playerScripts = [
      this.props.playerScript1,
      this.props.playerScript2,
      this.props.playerScript3,
      this.props.playerScript4,
      this.props.playerScript5,
      this.props.playerScript6,
      this.props.playerScript7,
      this.props.playerScript8,
    ];

    // Ensure all player scripts are owned by server initially
    this.initializePlayerScripts();

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
    // Return player script if they had one
    this.returnPlayerScript(player);
    
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
          // Assign player scripts when moving to PreRound
          this.assignPlayerScripts();
        }

        break;
      case GameState.GameOver:
        if (toState === GameState.GameOver) {
          // Return all player scripts before moving players
          this.returnAllPlayerScripts();
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
    
    // First, assign everyone as Innocent
    for (let i = 0; i < matchPlayers.size(); i++) {
      const player = matchPlayers.list[i];
      this.PlayerRoles.assignRole(player, PlayerRoles.Innocent);
    }

    // Select a random Murderer
    const murdererIndex = Math.floor(Math.random() * matchPlayers.size());
    this.PlayerRoles.assignRole(
      matchPlayers.list[murdererIndex],
      PlayerRoles.Murderer
    );
    this.selectedMurderer = matchPlayers.list[murdererIndex];

    // Select a random Detective (different from Murderer)
    // Only assign Detective if there are at least 3 players
    if (matchPlayers.size() >= 2) {
      let detectiveIndex: number;
      do {
        detectiveIndex = Math.floor(Math.random() * matchPlayers.size());
      } while (detectiveIndex === murdererIndex);
      
      this.PlayerRoles.assignRole(
        matchPlayers.list[detectiveIndex],
        PlayerRoles.Detective
      );
      this.selectedDetective = matchPlayers.list[detectiveIndex];
      
      console.log(`Detective selected: ${this.selectedDetective.name.get()}`);
      
      // Broadcast the selected detective
      this.sendNetworkBroadcastEvent<{ player: hz.Player }>(
        Events.selectedDetective,
        { player: matchPlayers.list[detectiveIndex] }
      );
    }

    // Show popup for roles
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
      { player: matchPlayers.list[murdererIndex] }
    );
  }

  private equipRoleWeapons() {
    console.log("[PlayerManager] Equipping role-specific weapons...");

    // Find knife and revolver entities in the world
    const knifeEntities = this.world.getEntitiesWithTags(["knife"]);
    const revolverEntities = this.world.getEntitiesWithTags(["revolver"]);

    if (knifeEntities.length === 0) {
      console.warn("[PlayerManager] No knife entities found with tag 'knife'");
    }

    if (revolverEntities.length === 0) {
      console.warn("[PlayerManager] No revolver entities found with tag 'revolver'");
    }

    // Equip knife to Murderer
    if (this.selectedMurderer && knifeEntities.length > 0) {
      const knife = knifeEntities[0];
      knife.owner.set(this.selectedMurderer);
      
      // Use a small delay to ensure player is ready
      this.async.setTimeout(() => {
        // Holster the knife instead of forcing them to hold it
        knife.as(hz.AttachableEntity).attachToPlayer(
          this.selectedMurderer,
          hz.AttachablePlayerAnchor.Torso
        );
      
        console.log(`[PlayerManager] Holstered knife to Murderer: ${this.selectedMurderer.name.get()}`);
        
        // Send event to notify knife holder updated
        this.sendLocalBroadcastEvent(Events.knifeHeldUpdated, {
          player: this.selectedMurderer,
          holdingKnife: false, // Set to false since it's holstered, not held
          tag: "knife"
        });
      }, 100);
    }

    // Equip revolver to Detective
    if (this.selectedDetective && revolverEntities.length > 0) {
      const revolver = revolverEntities[0];
      revolver.owner.set(this.selectedDetective);
      
      // Use a small delay to ensure player is ready
      this.async.setTimeout(() => {
        revolver.as(hz.GrabbableEntity).forceHold(
          this.selectedDetective,
          hz.Handedness.Right,
          true
        );
        console.log(`[PlayerManager] Equipped revolver to Detective: ${this.selectedDetective.name.get()}`);
      }, 100);
    }
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
      
      // Return player script ownership to server
      this.returnPlayerScript(player);
      
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
    } else if (
      this.PlayerRoles.getRole(player) === PlayerRoles.Detective &&
      killer
    ) {
      this.sendLocalBroadcastEvent(LeaderboardEvents.IncrementEliminations, {
        player: killer,
        role: "Detective",
      });
    }
  }

  checkForEndConditions() {
    // If no innocent/detective players are left, the game is over
    // If murderer is killed, game is over
    const innocentPlayers = Array.from(this.PlayerRoles.getRoles().entries())
      .filter(([player, role]) => role === PlayerRoles.Innocent)
      .map(([player]) => player);

    const detectivePlayers = Array.from(this.PlayerRoles.getRoles().entries())
      .filter(([player, role]) => role === PlayerRoles.Detective)
      .map(([player]) => player);

    const murdererPlayers = Array.from(this.PlayerRoles.getRoles().entries())
      .filter(([player, role]) => role === PlayerRoles.Murderer)
      .map(([player]) => player);

    // Check if all innocents and detectives are eliminated
    if (innocentPlayers.length === 0 && detectivePlayers.length === 0) {
      // No innocent or detective players left
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
        const role = this.PlayerRoles.getRole(player);
        if (role === PlayerRoles.Innocent || role === PlayerRoles.Detective) {
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

  // ========================================
  // PLAYER SCRIPT MANAGEMENT
  // ========================================

  private initializePlayerScripts(): void {
    if (!this.serverPlayer) return;

    // Set all player scripts to server ownership initially
    for (const script of this.playerScripts) {
      if (script) {
        script.owner.set(this.serverPlayer);
      }
    }

    console.log("Player scripts initialized and assigned to server");
  }

  private assignPlayerScripts(): void {
    const playersInMatch = this.matchPlayers.getPlayersInMatch().list;
    const maxAssignments = Math.min(
      playersInMatch.length,
      this.playerScripts.length,
      this.props.maxPlayers!
    );

    console.log(`Assigning ${maxAssignments} player scripts`);

    for (let i = 0; i < maxAssignments; i++) {
      const player = playersInMatch[i];
      const script = this.playerScripts[i];

      if (player && script) {
        this.playerScriptAssignments.set(player, i);
        this.sendLocalBroadcastEvent(Events.assignPlayerScript, {
          player,
          playerIndex: i,
        });
        console.log(
          `Assigned player script ${i} to ${player.name.get()}`
        );
      }
    }
  }

  private returnPlayerScript(player: hz.Player): void {
    const scriptIndex = this.playerScriptAssignments.get(player);

    if (scriptIndex !== undefined) {
      console.log(
        `Returning player script ${scriptIndex} from ${player.name.get()}`
      );
      this.sendLocalBroadcastEvent(Events.returnPlayerScript, {});
      this.playerScriptAssignments.delete(player);
    }
  }

  private returnAllPlayerScripts(): void {
    console.log("Returning all player scripts to server");

    // Clear all assignments
    this.playerScriptAssignments.clear();

    // Broadcast return event
    this.sendLocalBroadcastEvent(Events.returnPlayerScript, {});

    // Re-initialize to ensure server ownership
    this.initializePlayerScripts();
  }
}

hz.Component.register(PlayerManager);
