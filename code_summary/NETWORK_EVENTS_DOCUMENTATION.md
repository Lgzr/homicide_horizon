# Network Events Documentation

## Overview

This document provides a comprehensive list of all network events used in the Homicide Horizon project, categorized by their purpose and type.

---

## Event Types

### LocalEvent

Events that are only triggered and handled locally on the same client.

### NetworkEvent (Broadcast)

Events that are sent across the network to all clients or specific players.

---

## 1. Game State & Flow Events

**Source:** `GameUtil.ts`

| Event Name             | Type       | Payload                                        | Description                                        |
| ---------------------- | ---------- | ---------------------------------------------- | -------------------------------------------------- |
| `gameStateChanged`     | LocalEvent | `{ fromState: GameState, toState: GameState }` | Triggered when the game transitions between states |
| `registerNewMatch`     | LocalEvent | `{}`                                           | Registers a new match session                      |
| `gameOver`             | LocalEvent | `{ winState: WinState }`                       | Signals the end of the game with win/loss state    |
| `setGameState`         | LocalEvent | `{ newState: GameState }`                      | Requests a game state change                       |
| `assignPlayerRoles`    | LocalEvent | `{}`                                           | Initiates the player role assignment process       |
| `playerRolesAssigned`  | LocalEvent | `{ playerRoles: PlayerRoles }`                 | Confirms roles have been assigned to players       |
| `checkForEndCondition` | LocalEvent | `{ player: hz.Player }`                        | Checks if game ending conditions are met           |

### Game States

```typescript
enum GameState {
  WaitingForPlayers,
  Starting,
  PreRound,
  RoundInProgress,
  RoundEnding,
  GameOver,
}
```

### Win States

```typescript
enum WinState {
  InnocentsWin,
  MurdererWins,
  Draw,
}
```

---

## 2. Player Events

**Source:** `GameUtil.ts`

| Event Name          | Type       | Payload                                                | Description                                   |
| ------------------- | ---------- | ------------------------------------------------------ | --------------------------------------------- |
| `playerEliminated`  | LocalEvent | `{ player: hz.Player, killer: hz.Player \| null }`     | Triggered when a player is eliminated         |
| `selectedMurderer`  | LocalEvent | `{ player: hz.Player }`                                | Announces the selected murderer for the round |
| `playerShot`        | LocalEvent | `{ playerShooting: hz.Player, playerShot: hz.Player }` | Triggered when a player shoots another player |
| `exitSpectateMode`  | LocalEvent | `{ player: hz.Player }`                                | Player exits spectator mode                   |
| `spectateModeEnded` | LocalEvent | `{ player: hz.Player, entity: hz.Entity }`             | Spectator mode has ended for a player         |

---

## 3. Weapon & Combat Events

**Source:** `GameUtil.ts`

| Event Name            | Type       | Payload                                                           | Description                          |
| --------------------- | ---------- | ----------------------------------------------------------------- | ------------------------------------ |
| `knifeHeldUpdated`    | LocalEvent | `{ player: hz.Player, holdingKnife: boolean, tag: string }`       | Updates knife holding state          |
| `knifeSkinUpdated`    | LocalEvent | `{ player: hz.Player, knife_tag: String }`                        | Updates the knife skin/appearance    |
| `toggleKnifeToPlayer` | LocalEvent | `{ entity: hz.Entity, player: hz.Player, holdingKnife: boolean }` | Toggles knife assignment to a player |
| `spawnRevolver`       | LocalEvent | `{ player: hz.Player }`                                           | Spawns a revolver for the player     |

---

## 4. Collectibles & Parts Events

**Source:** `GameUtil.ts`

| Event Name      | Type       | Payload                                  | Description                                |
| --------------- | ---------- | ---------------------------------------- | ------------------------------------------ |
| `spawnParts`    | LocalEvent | `{}`                                     | Spawns collectible parts in the game world |
| `partCollected` | LocalEvent | `{ player: hz.Player, part: hz.Entity }` | Triggered when a player collects a part    |

---

## 5. Environment & World Events

**Source:** `GameUtil.ts`

| Event Name              | Type       | Payload                                    | Description                               |
| ----------------------- | ---------- | ------------------------------------------ | ----------------------------------------- |
| `resetDoors`            | LocalEvent | `{}`                                       | Resets all doors to initial state         |
| `openDoor`              | LocalEvent | `{ entity: hz.Entity }`                    | Opens a specific door                     |
| `startPhoneRinging`     | LocalEvent | `{}`                                       | Starts the phone ringing sound/event      |
| `transferPropOwnership` | LocalEvent | `{ entity: hz.Entity, player: hz.Player }` | Transfers ownership of a prop to a player |

---

## 6. Leaderboard Events

**Source:** `LeaderboardEvents.ts`

| Event Name                      | Type       | Payload                                 | Description                           |
| ------------------------------- | ---------- | --------------------------------------- | ------------------------------------- |
| `IncrementEliminations`         | LocalEvent | `{ player: hz.Player }`                 | Increments player's elimination count |
| `IncrementTimePlayed`           | LocalEvent | `{ player: hz.Player, amount: number }` | Increments time played stat           |
| `IncrementMurdererEliminations` | LocalEvent | `{ player: hz.Player }`                 | Increments eliminations as murderer   |
| `IncrementRoundsWonAsMurderer`  | LocalEvent | `{ player: hz.Player }`                 | Increments rounds won as murderer     |
| `IncrementRoundsWonAsInnocent`  | LocalEvent | `{ player: hz.Player }`                 | Increments rounds won as innocent     |
| `IncrementRoundsPlayed`         | LocalEvent | `{ player: hz.Player }`                 | Increments total rounds played        |
| `SetGold`                       | LocalEvent | `{ player: hz.Player, amount: number }` | Sets player's gold/currency amount    |

### Leaderboard Types

```typescript
enum Leaderboards {
  EliminationsAsMurderer,
  EliminationsAsInnocent,
  RoundsWonAsMurderer,
  RoundsWonAsInnocent,
  PartsCollected,
  TimePlayed,
  RoundsPlayed,
}
```

---

## 7. Sound Effects Events

**Source:** `SFXEvents.ts`

| Event Name          | Type       | Payload | Description                    |
| ------------------- | ---------- | ------- | ------------------------------ |
| `PlayersSpawnedSFX` | LocalEvent | `{}`    | Plays sound when players spawn |
| `PreRoundStartSFX`  | LocalEvent | `{}`    | Plays pre-round start sound    |
| `RoundStartSFX`     | LocalEvent | `{}`    | Plays round start sound        |
| `MurdererWinSFX`    | LocalEvent | `{}`    | Plays murderer victory sound   |
| `InnocentWinSFX`    | LocalEvent | `{}`    | Plays innocent victory sound   |
| `CrossbowSpawnSFX`  | LocalEvent | `{}`    | Plays crossbow spawn sound     |
| `PartsSpawnedSFX`   | LocalEvent | `{}`    | Plays parts spawned sound      |
| `PartCollectSFX`    | LocalEvent | `{}`    | Plays part collection sound    |

---

## 8. Weather System Events

**Source:** `WeatherManager.ts`

| Event Name               | Type       | Payload | Description                  |
| ------------------------ | ---------- | ------- | ---------------------------- |
| `stormStart`             | LocalEvent | `{}`    | Starts a storm weather event |
| `stormEnd`               | LocalEvent | `{}`    | Ends the current storm       |
| `stormIncreaseIntensity` | LocalEvent | `{}`    | Increases storm intensity    |
| `stormTriggerLightning`  | LocalEvent | `{}`    | Triggers a lightning strike  |
| `stormTriggerThunder`    | LocalEvent | `{}`    | Triggers thunder sound       |

---

## 9. Lighting System Events

**Source:** `LightManager.ts`

| Event Name         | Type       | Payload                                 | Description                              |
| ------------------ | ---------- | --------------------------------------- | ---------------------------------------- |
| `toggleLightGroup` | LocalEvent | `{ groupName: string, state: boolean }` | Toggles a group of lights on/off         |
| `powerOutage`      | LocalEvent | `{}`                                    | Triggers a power outage (all lights off) |
| `powerRestored`    | LocalEvent | `{}`                                    | Restores power (lights back on)          |

---

## 10. Shop & Cosmetics Events

**Source:** `ShopUtil.ts`

| Event Name         | Type       | Payload                                      | Description                      |
| ------------------ | ---------- | -------------------------------------------- | -------------------------------- |
| `knifeSkinUpdated` | LocalEvent | `{ player: hz.Player, knife_index: number }` | Updates the knife skin selection |

---

## Network Event Usage Patterns

### Sending Network Broadcast Events

```typescript
this.sendNetworkBroadcastEvent(Events.playerEliminated, {
  player: eliminatedPlayer,
  killer: killerPlayer,
});
```

### Connecting to Network Broadcast Events

```typescript
this.connectNetworkBroadcastEvent(Events.selectedMurderer, (data) => {
  console.log(`Murderer selected: ${data.player.name.get()}`);
});
```

### Sending Local Broadcast Events

```typescript
this.sendLocalBroadcastEvent(Events.gameStateChanged, {
  fromState: GameState.Starting,
  toState: GameState.RoundInProgress,
});
```

### Connecting to Local Broadcast Events

```typescript
this.connectLocalBroadcastEvent(Events.gameOver, (data) => {
  if (data.winState === WinState.InnocentsWin) {
    // Handle innocent victory
  }
});
```

---

## Event Categories Summary

| Category             | Event Count | Event Type     |
| -------------------- | ----------- | -------------- |
| Game State & Flow    | 7           | LocalEvent     |
| Player Events        | 5           | LocalEvent     |
| Weapon & Combat      | 4           | LocalEvent     |
| Collectibles & Parts | 2           | LocalEvent     |
| Environment & World  | 4           | LocalEvent     |
| Leaderboard          | 7           | LocalEvent     |
| Sound Effects        | 8           | LocalEvent     |
| Weather System       | 5           | LocalEvent     |
| Lighting System      | 3           | LocalEvent     |
| Shop & Cosmetics     | 1           | LocalEvent     |
| **Total**            | **46**      | **LocalEvent** |

---

## Files Using Network Events

### Primary Event Senders (sendNetworkBroadcastEvent)

1. `KnifeController.ts` - Sends player elimination events
2. `Server.ts` - Sends leaderboard time tracking events
3. `RevolverController.ts` - Sends player shot events
4. `PropController.ts` - Sends spectate mode exit events
5. `ProjectileScript.ts` - Sends player shot events
6. `PlayerManager.ts` - Sends player elimination events
7. `PartController.ts` - Sends part collection events
8. `GhostManager.ts` - Sends prop ownership and spectate events
9. `GeneratorController.ts` - Sends power outage/restore events
10. `DebugScript.ts` - Sends weather and debug events

### Primary Event Listeners (connectNetworkBroadcastEvent)

1. `KnifeController.ts` - Listens for murderer selection
2. `DoorController.ts` - Listens for door reset events
3. `WeatherManager.ts` - Listens for weather events

---

## Notes

- All events in this project use `LocalEvent` type, but are sent via network broadcast methods
- Events are designed to synchronize game state across multiplayer clients
- The distinction between LocalEvent and NetworkEvent in the Horizon API determines serialization behavior
- Most game logic events are broadcast across the network to maintain consistency

---

## Event Naming Conventions

1. **State Changes**: Use past tense (e.g., `gameStateChanged`, `playerEliminated`)
2. **Actions**: Use present tense or imperative (e.g., `spawnParts`, `openDoor`)
3. **Increments**: Prefix with "Increment" (e.g., `IncrementEliminations`)
4. **Sound Effects**: Suffix with "SFX" (e.g., `RoundStartSFX`)
5. **Triggers**: Prefix with action verb (e.g., `toggleLightGroup`, `stormTriggerLightning`)

---

_Last Updated: October 4, 2025_
