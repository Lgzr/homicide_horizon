# Player Script System Documentation

## Overview

The Player script system provides local, per-player functionality for managing SFX, HUD elements, and other player-specific features in Horizon Worlds. Due to Horizon's architecture, each Player script must be attached to a separate entity and ownership is managed dynamically by the PlayerManager.

---

## Architecture

### Core Components

1. **Player.ts** - Individual player script (8 instances)
2. **PlayerManager.ts** - Centralized ownership and lifecycle management
3. **GameUtil.ts** - Event coordination between components

### Ownership Model

```
Server Player (Initial)
    ↓
PreRound Start → Assign to Player 1-8
    ↓
Round Active (Player owns script)
    ↓
Elimination/Round End → Return to Server
```

---

## Player.ts Component

### Purpose

Manages local player-specific functionality including:

- Horror ambience SFX (3 layers)
- Heartbeat SFX with intensity control
- Footstep sounds (walk, run, crouch, land)
- Future: HUD updates, local UI, player-specific effects

### Props Definition

```typescript
static propsDefinition = {
  horrorAmbienceSFX_1: { type: hz.PropTypes.Entity },
  horrorAmbienceSFX_2: { type: hz.PropTypes.Entity },
  horrorAmbienceSFX_3: { type: hz.PropTypes.Entity },
  heartBeatSFX: { type: hz.PropTypes.Entity },
  FootstepWalkSFX: { type: hz.PropTypes.Entity },
  FootstepRunSFX: { type: hz.PropTypes.Entity },
  FootstepCrouchSFX: { type: hz.PropTypes.Entity },
  FootstepLandSFX: { type: hz.PropTypes.Entity },
}
```

### State Management

#### Private Properties

| Property                | Type        | Default | Description                                  |
| ----------------------- | ----------- | ------- | -------------------------------------------- |
| `owner`                 | `hz.Player` | -       | Current player assigned to this script       |
| `serverPlayer`          | `hz.Player` | -       | Reference to server player                   |
| `isActive`              | `boolean`   | `false` | Whether script is actively owned by a player |
| `horrorAmbiencePlaying` | `boolean`   | `false` | Horror ambience playback state               |
| `heartbeatPlaying`      | `boolean`   | `false` | Heartbeat playback state                     |

### Lifecycle Methods

#### `preStart()`

Sets up event listeners for ownership management.

**Events:**

- `Events.assignPlayerScript` - Receive ownership assignment
- `Events.returnPlayerScript` - Return ownership to server

#### `start()`

Performs initial server check and initialization.

**Logic:**

1. Get server player reference
2. Check if current owner is server
   - If server: Set `isActive = false`, return early
   - If player: Set `isActive = true`, initialize player
3. Store owner reference
4. Call `initializePlayer()`

**Server Check:** Critical to prevent scripts running on server entities.

### Ownership Management Methods

#### `assignToPlayer(player: hz.Player)`

Assigns the script to a specific player.

**Parameters:**

- `player` - Player to receive ownership

**Actions:**

1. Set entity owner to player
2. Update `owner` property
3. Set `isActive = true`
4. Initialize player settings

#### `returnToServer()`

Returns script ownership to the server player.

**Actions:**

1. Call `cleanup()` to stop all SFX
2. Set entity owner to server player
3. Set `isActive = false`

#### `initializePlayer()`

Initialize player-specific settings when script becomes active.

**Current Implementation:**

- Console log player name
- Placeholder for future initialization

**Future Use:**

- Apply player-specific settings
- Initialize HUD elements
- Set up player bindings

#### `cleanup()`

Clean up all active effects when returning to server.

**Actions:**

1. Stop horror ambience
2. Stop heartbeat
3. Stop footsteps (placeholder)

---

## SFX Management

### Horror Ambience System

#### `playHorrorAmbience()`

Starts layered horror ambience sounds with staggered timing.

**Behavior:**

- **Layer 1:** Starts immediately, volume 0.3, 30-frame fade
- **Layer 2:** Starts after 500ms delay, volume 0.25, 30-frame fade
- **Layer 3:** Starts after 1000ms delay, volume 0.2, 30-frame fade

**Guards:**

- Returns if not active
- Returns if already playing

**Purpose:** Creates rich, evolving horror soundscape

#### `stopHorrorAmbience()`

Stops all horror ambience layers.

**Behavior:**

- Fade-out over 30 frames
- Sets `horrorAmbiencePlaying = false`

---

### Heartbeat System

#### `startHeartbeat()`

Begins looping heartbeat SFX.

**Settings:**

- Volume: 0.4 (40%)
- Fade: 20 frames

**Guards:**

- Returns if not active
- Returns if already playing

#### `stopHeartbeat()`

Stops heartbeat SFX.

**Behavior:**

- Fade-out over 20 frames
- Sets `heartbeatPlaying = false`

#### `setHeartbeatIntensity(intensity: number)`

Dynamically adjusts heartbeat volume based on intensity.

**Parameters:**

- `intensity` - Value between 0 and 1

**Volume Scaling:**

- Minimum: 0.2 (20%)
- Maximum: 0.5 (50%)
- Formula: `0.2 + intensity * 0.3`

**Use Cases:**

- Murderer proximity
- Low health
- Suspenseful moments

---

### Footstep System

#### Available Methods

```typescript
playFootstepWalk(); // Normal walking sound
playFootstepRun(); // Running/sprinting sound
playFootstepCrouch(); // Crouching movement sound
playFootstepLand(); // Landing after jump
```

**Behavior:**

- One-shot sounds (not looped)
- No fade (instant playback)
- Guard checks for active state

**Integration Points:**

- Player movement system
- Animation events
- Locomotion state changes

---

## PlayerManager.ts Integration

### New Props

```typescript
maxPlayers: { type: hz.PropTypes.Number, default: 8 }
playerScript1: { type: hz.PropTypes.Entity }
playerScript2: { type: hz.PropTypes.Entity }
playerScript3: { type: hz.PropTypes.Entity }
playerScript4: { type: hz.PropTypes.Entity }
playerScript5: { type: hz.PropTypes.Entity }
playerScript6: { type: hz.PropTypes.Entity }
playerScript7: { type: hz.PropTypes.Entity }
playerScript8: { type: hz.PropTypes.Entity }
```

**Configuration:**

- `maxPlayers` - Maximum concurrent players (default: 8)
- `playerScript1-8` - References to Player script entities

### State Management

```typescript
private playerScripts: (hz.Entity | undefined)[] = [];
private playerScriptAssignments: Map<hz.Player, number> = new Map();
private serverPlayer?: hz.Player;
```

- **playerScripts:** Array of Player entity references
- **playerScriptAssignments:** Maps players to their script index
- **serverPlayer:** Server player reference for ownership resets

---

### Management Methods

#### `initializePlayerScripts()`

Initializes all player scripts to server ownership.

**When Called:**

- On `start()` method
- After `returnAllPlayerScripts()`

**Actions:**

1. Validate server player exists
2. Iterate through playerScripts array
3. Set each script's owner to server
4. Log initialization

#### `assignPlayerScripts()`

Assigns player scripts to active match players.

**When Called:**

- On transition to `GameState.PreRound`

**Logic:**

1. Get list of players in match
2. Calculate max assignments: `min(playersInMatch, scriptsAvailable, maxPlayers)`
3. For each assignment:
   - Store assignment in map (player → index)
   - Broadcast `assignPlayerScript` event with player and index
   - Log assignment

**Parallel Array:** Players and scripts are matched by index (0-7)

#### `returnPlayerScript(player: hz.Player)`

Returns a single player's script to server.

**When Called:**

- Player elimination
- Player exits world

**Actions:**

1. Lookup script index from assignments map
2. Broadcast `returnPlayerScript` event
3. Remove assignment from map
4. Log return

#### `returnAllPlayerScripts()`

Returns all active player scripts to server.

**When Called:**

- Game over (transition to `GameState.GameOver`)

**Actions:**

1. Clear all assignments from map
2. Broadcast `returnPlayerScript` event
3. Call `initializePlayerScripts()` to reset
4. Log bulk return

---

### Integration Points

#### Round Start (PreRound State)

```typescript
case GameState.PreRound:
  if (fromState === GameState.Starting) {
    this.moveAllLobbyPlayersToMatch();
    this.assignPlayerScripts(); // ← Player scripts assigned
  }
  break;
```

#### Round End (GameOver State)

```typescript
case GameState.GameOver:
  this.returnAllPlayerScripts(); // ← Scripts returned first
  this.moveAllMatchPlayersToLobby();
  break;
```

#### Player Elimination

```typescript
playerEliminated(player: hz.Player, killer: hz.Player | null) {
  // ... existing code ...
  this.returnPlayerScript(player); // ← Individual return
  // ... existing code ...
}
```

#### Player Exit World

```typescript
handleOnPlayerExitWorld(player: hz.Player): void {
  this.returnPlayerScript(player); // ← Individual return
  this.matchPlayers.removePlayer(player);
  this.checkForEndConditions();
}
```

---

## Event System

### New Events in GameUtil.ts

#### `assignPlayerScript`

**Type:** `LocalEvent<{ player: hz.Player; playerIndex: number }>`

**Purpose:** Notify Player script to assign ownership

**Payload:**

- `player` - Player receiving ownership
- `playerIndex` - Index of script being assigned (0-7)

**Broadcast By:** PlayerManager
**Listened By:** All Player scripts

#### `returnPlayerScript`

**Type:** `LocalEvent<{}>`

**Purpose:** Notify Player scripts to return to server ownership

**Payload:** Empty (all scripts respond)

**Broadcast By:** PlayerManager
**Listened By:** All Player scripts

---

## Setup in Horizon Worlds

### 1. Create Player Script Entities

**For each of 8 player scripts:**

1. Create new entity in world
2. Name: `PlayerScript_1` through `PlayerScript_8`
3. Add `Player` component script
4. Configure AudioGizmo props:
   - Horror ambience (3 layers)
   - Heartbeat
   - Footsteps (4 types)

### 2. Configure PlayerManager

1. Find GameManager entity (or equivalent)
2. Locate PlayerManager component
3. Set `maxPlayers` prop (default: 8)
4. Assign references:
   - `playerScript1` → PlayerScript_1 entity
   - `playerScript2` → PlayerScript_2 entity
   - ... (continue through 8)

### 3. Audio Configuration

**For each Player script entity:**

#### Horror Ambience Layers

- Create 3 AudioGizmos
- Set to loop
- Assign creepy ambient sounds
- Position at player entity (will follow owner)

#### Heartbeat

- Create AudioGizmo
- Set to loop
- Assign heartbeat sound (BPM: 60-120)
- Enable volume modulation

#### Footsteps

- Create 4 AudioGizmos (walk, run, crouch, land)
- Set to one-shot (no loop)
- Assign appropriate footstep sounds
- Vary pitch slightly for realism

---

## Usage Examples

### Starting Horror Ambience

```typescript
// From another script with Player reference
const playerScript = this.getPlayerScript(player);
playerScript.playHorrorAmbience();
```

### Dynamic Heartbeat Based on Murderer Proximity

```typescript
const distance = getMurdererDistance(player);
const maxDistance = 20.0;
const intensity = 1.0 - distance / maxDistance;

playerScript.setHeartbeatIntensity(intensity);
if (!playerScript.heartbeatPlaying && intensity > 0.3) {
  playerScript.startHeartbeat();
}
```

### Footstep Integration

```typescript
// In player movement system
onPlayerMove(player: hz.Player, speed: number) {
  if (speed > 8) {
    playerScript.playFootstepRun();
  } else if (speed > 0) {
    playerScript.playFootstepWalk();
  }
}
```

---

## Flow Diagrams

### Round Start Flow

```
GameState.Starting → GameState.PreRound
    ↓
moveAllLobbyPlayersToMatch()
    ↓
assignPlayerScripts()
    ↓
For each player (0-7):
    ↓
    Broadcast assignPlayerScript { player, index }
        ↓
        Player.assignToPlayer(player)
            ↓
            Set entity.owner = player
            ↓
            isActive = true
            ↓
            initializePlayer()
```

### Elimination Flow

```
Player Eliminated
    ↓
playerEliminated(player, killer)
    ↓
returnPlayerScript(player)
    ↓
Lookup script index from map
    ↓
Broadcast returnPlayerScript
    ↓
Player.returnToServer()
    ↓
cleanup() - Stop all SFX
    ↓
Set entity.owner = serverPlayer
    ↓
isActive = false
```

### Round End Flow

```
GameState.GameOver
    ↓
returnAllPlayerScripts()
    ↓
Clear playerScriptAssignments map
    ↓
Broadcast returnPlayerScript (all scripts respond)
    ↓
initializePlayerScripts()
    ↓
All scripts → owner = serverPlayer
```

---

## Design Rationale

### Why Separate Entities?

**Horizon Limitation:** Scripts with local functionality (SFX, HUD) must be attached to entities with proper ownership. Can't run 8 instances on same entity.

### Why Parallel Array?

**Simplicity:** Index-based assignment is predictable and easy to debug. Player at match index 0 always gets playerScript1.

### Why Server Ownership?

**Cleanup:** Returning to server ensures scripts are in known state. Prevents scripts from being "orphaned" with stale player references.

### Why Index in Event Payload?

**Future Expansion:** Index allows targeting specific scripts for debugging or special functionality without iterating through all entities.

---

## Future Enhancements

### Planned Features

- [ ] HUD element management (health, stamina, ammo)
- [ ] Local player UI updates (role reveal, notifications)
- [ ] Player-specific visual effects (vignette, screen shake)
- [ ] Input handling for player-specific actions
- [ ] Proximity-based voice chat modulation
- [ ] Player stats tracking (steps, shots fired, etc.)

### Optimization Ideas

- [ ] Pool pattern for SFX (reuse AudioGizmo instances)
- [ ] Spatial audio positioning for directional footsteps
- [ ] Dynamic quality scaling based on player count
- [ ] Lazy initialization of unused SFX

### Debug Features

- [ ] Console commands to test SFX
- [ ] Visual indicators showing active player scripts
- [ ] Script assignment overlay (which player has which script)
- [ ] SFX volume debugging sliders

---

## Troubleshooting

### Script Not Activating

**Symptom:** Player script stays inactive after round start

**Checks:**

1. Verify `maxPlayers` prop in PlayerManager
2. Confirm all 8 playerScript props are assigned
3. Check console for assignment logs
4. Ensure player is in match (not lobby)

### SFX Not Playing

**Symptom:** Audio methods called but no sound

**Checks:**

1. Verify AudioGizmo props are assigned in Player entity
2. Check if `isActive` is true
3. Confirm owner is not server player
4. Test AudioGizmo directly in editor

### Ownership Errors

**Symptom:** Multiple players assigned to same script

**Checks:**

1. Verify `assignPlayerScripts()` only called once per round
2. Check for duplicate event listeners
3. Confirm `returnAllPlayerScripts()` called on game over
4. Review playerScriptAssignments map state

### Script Persists After Elimination

**Symptom:** Eliminated player still has active script

**Checks:**

1. Verify `returnPlayerScript()` called in `playerEliminated()`
2. Check `returnPlayerScript` event is connected in Player.ts
3. Confirm cleanup() stops all SFX
4. Test manual ownership reset

---

## Performance Considerations

### Memory Usage

- **8 Player Scripts:** Each script maintains SFX state
- **Map Storage:** playerScriptAssignments grows with active players
- **AudioGizmos:** 8 entities × 8 audio props = 64 audio instances

**Optimization:** Only assign scripts for active players (uses `maxAssignments`)

### Event Broadcasting

- `assignPlayerScript`: Broadcast per player (max 8/round)
- `returnPlayerScript`: Broadcast once (all scripts respond)

**Efficient:** Minimal network traffic, local event processing

### Audio Performance

- **Layered Ambience:** 3 simultaneous loops per player
- **Staggered Start:** Prevents audio spike on round start
- **Fade Transitions:** Smooth volume changes (CPU-friendly)

**Best Practice:** Keep audio files compressed, use spatial audio radius

---

## Code Quality

### ✅ Implemented

- Server ownership check prevents invalid execution
- Guard clauses on all public methods
- Proper cleanup on ownership return
- Null checks on optional props
- Console logging for debugging

### 🔄 Improvements Needed

- Add error handling for missing props
- Implement retry logic for failed assignments
- Add telemetry for script assignment success rate
- Create unit tests for ownership transitions

---

_Last Updated: October 6, 2025_
_Version: 1.0_
_Components: Player.ts, PlayerManager.ts, GameUtil.ts_
