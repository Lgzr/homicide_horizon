import * as hz from "horizon/core";

export enum GameState {
  "WaitingForPlayers",
  "Starting",
  "PreRound",
  "RoundInProgress",
  "RoundEnding",
  "GameOver",
}

export enum WinState {
  "InnocentsWin",
  "MurdererWins",
  "Draw",
}

export const Events = {
  gameStateChanged: new hz.LocalEvent<{
    fromState: GameState;
    toState: GameState;
  }>("gameStateChanged"),
  registerNewMatch: new hz.LocalEvent<{}>("registerNewMatch"),
  gameOver: new hz.LocalEvent<{ winState: WinState }>("gameOver"),
  setGameState: new hz.LocalEvent<{ newState: GameState }>("setGameState"),

  assignPlayerRoles: new hz.LocalEvent<{}>("assignPlayerRoles"),
  playerRolesAssigned: new hz.LocalEvent<{ playerRoles: PlayerRoles }>(
    "playerRolesAssigned"
  ),

  playerEliminated: new hz.LocalEvent<{
    player: hz.Player;
    killer: hz.Player | null;
  }>("playerEliminated"),
  checkForEndCondition: new hz.LocalEvent<{ player: hz.Player }>(
    "checkForEndCondition"
  ),

  selectedMurderer: new hz.LocalEvent<{ player: hz.Player }>(
    "selectedMurderer"
  ),

  knifeHeldUpdated: new hz.LocalEvent<{
    player: hz.Player;
    holdingKnife: boolean;
    tag: string;
  }>("knifeHeldUpdated"),

  knifeSkinUpdated: new hz.LocalEvent<{ player: hz.Player; knife_tag: String }>(
    "knifeSkinUpdated"
  ),

  toggleKnifeToPlayer: new hz.LocalEvent<{
    entity: hz.Entity;
    player: hz.Player;
    holdingKnife: boolean;
  }>("toggleKnifeToPlayer"),

  spawnParts: new hz.LocalEvent<{}>("spawnParts"),
  partCollected: new hz.LocalEvent<{ player: hz.Player; part: hz.Entity }>(
    "partCollected"
  ),
  spawnRevolver: new hz.LocalEvent<{ player: hz.Player }>("spawnRevolver"),

  playerShot: new hz.LocalEvent<{
    playerShooting: hz.Player;
    playerShot: hz.Player;
  }>("playerShot"),

  resetDoors: new hz.LocalEvent<{}>("resetDoors"),
  openDoor: new hz.LocalEvent<{ entity: hz.Entity }>("openDoor"),

  startPhoneRinging: new hz.LocalEvent<{}>("startPhoneRinging"),

  transferPropOwnership: new hz.LocalEvent<{
    entity: hz.Entity;
    player: hz.Player;
  }>("transferPropOwnership"),

  exitSpectateMode: new hz.LocalEvent<{
    player: hz.Player;
  }>("exitSpectateMode"),

  spectateModeEnded: new hz.LocalEvent<{
    player: hz.Player;
    entity: hz.Entity;
  }>("spectateModeEnded"),
};

export function playersEqual(
  a: hz.Player | undefined,
  b: hz.Player | undefined
): boolean {
  if (!a || !b) return false;
  return a.id == b.id;
}

export class PlayerRoles {
  static Innocent: string = "Innocent";
  static Murderer: string = "Murderer";
  static Spectator: string = "Spectator";

  static map: Map<hz.Player, string> = new Map();

  getRole(player: hz.Player): string | undefined {
    return PlayerRoles.map.get(player);
  }

  assignRole(player: hz.Player, role: string): void {
    PlayerRoles.map.set(player, role);
  }

  clearRoles(): void {
    PlayerRoles.map.clear();
  }

  getRoles(): Map<hz.Player, string> {
    return PlayerRoles.map;
  }
}

export class PlayerList {
  forEach(arg0: (p: hz.Player) => void) {
    throw new Error("Method not implemented.");
  }
  list: hz.Player[] = [];

  size(): number {
    return this.list.length;
  }

  add(p: hz.Player): void {
    if (!this.includes(p)) {
      this.list.push(p);
    }
  }

  includes(p: hz.Player): boolean {
    return this.indexOf(p) >= 0;
  }

  indexOf(p: hz.Player): number {
    for (let i = 0; i < this.list.length; ++i) {
      if (playersEqual(this.list[i], p)) {
        return i;
      }
    }
    return -1;
  }

  remove(p: hz.Player): void {
    const i = this.indexOf(p);
    if (i >= 0) {
      this.list.splice(i, 1);
    }
  }
}

export class MatchPlayers {
  all: PlayerList = new PlayerList();
  inLobby: PlayerList = new PlayerList();
  inMatch: PlayerList = new PlayerList();

  isInLobby(p: hz.Player): boolean {
    return this.inLobby.includes(p);
  }

  isInMatch(p: hz.Player): boolean {
    return this.inMatch.includes(p);
  }

  playersInLobby(): number {
    return this.inLobby.size();
  }

  playersInMatch(): number {
    return this.inMatch.size();
  }

  playersInWorld(): number {
    return this.all.size();
  }

  getPlayersInLobby(): PlayerList {
    return this.inLobby;
  }

  getPlayersInMatch(): PlayerList {
    return this.inMatch;
  }

  moveToLobby(p: hz.Player): void {
    if (!this.all.includes(p)) {
      this.all.add(p);
    }

    if (!this.inLobby.includes(p)) {
      this.inLobby.add(p);
    }

    if (this.inMatch.includes(p)) {
      this.inMatch.remove(p);
    }
  }

  moveToMatch(p: hz.Player): void {
    if (!this.all.includes(p)) {
      this.all.add(p);
    }

    if (!this.inMatch.includes(p)) {
      this.inMatch.add(p);
    }

    if (this.inLobby.includes(p)) {
      this.inLobby.remove(p);
    }
  }

  addNewPlayer(p: hz.Player): void {
    this.moveToLobby(p);
  }

  removePlayer(p: hz.Player): void {
    if (this.all.includes(p)) {
      this.all.remove(p);
    }

    if (this.inLobby.includes(p)) {
      this.inLobby.remove(p);
    }

    if (this.inMatch.includes(p)) {
      this.inMatch.remove(p);
    }
  }
}

export default Events;
