# Murderer Component Documentation

## Overview

The `Murderer` component manages the Murderer role in the game, handling knife mechanics, holstering, and proximity-based elimination capabilities. This component is attached to an entity that represents the Murderer player and provides specialized gameplay mechanics for this role.

---

## Component Properties

### Props Definition

```typescript
static propsDefinition = {
  knife: { type: hz.PropTypes.Entity },
  eliminationTrigger: { type: hz.PropTypes.Entity }
}
```

| Prop                 | Type   | Description                                                |
| -------------------- | ------ | ---------------------------------------------------------- |
| `knife`              | Entity | Reference to the knife entity that the Murderer can use    |
| `eliminationTrigger` | Entity | TriggerVolume entity used for proximity-based eliminations |

---

## Private Properties

| Property             | Type                     | Default | Description                                                |
| -------------------- | ------------------------ | ------- | ---------------------------------------------------------- |
| `knifeHeld`          | `boolean`                | -       | Tracks whether the Murderer is currently holding the knife |
| `knifeHolstered`     | `boolean`                | `false` | Tracks whether the knife is holstered (attached to torso)  |
| `knife`              | `hz.Entity`              | -       | Reference to the knife entity                              |
| `owner`              | `hz.Player`              | -       | The player assigned as the Murderer                        |
| `serverPlayer`       | `hz.Player \| undefined` | -       | Reference to the server player                             |
| `eliminationTrigger` | `hz.Entity`              | -       | Reference to the elimination trigger volume                |
| `nearbyPlayers`      | `hz.Player[]`            | `[]`    | Array of players within elimination range                  |
| `updateInterval`     | `number \| undefined`    | -       | Timer ID for the proximity tracking interval               |

---

## Lifecycle Methods

### `preStart()`

Initializes event listeners and connects to game events before the component starts.

#### Event Connections:

1. **Network Event: `selectedMurderer`**

   - Listens for when a player is selected as the Murderer
   - Updates the component's owner to the selected player
   - **Payload:** `{ player: hz.Player }`

2. **Local Event: `knifeHeldUpdated`**

   - Monitors changes to the knife held state
   - Only responds when the event is for this Murderer's knife
   - Triggers elimination trigger updates based on knife state
   - **Payload:** `{ player: hz.Player, holdingKnife: boolean, tag: string }`

3. **Code Block Event: `OnGrabStart`** (knife)

   - Fires when the knife is grabbed
   - Sets `knifeHeld` to `true`

4. **Code Block Event: `OnGrabEnd`** (knife)

   - Fires when the knife is released
   - Sets `knifeHeld` to `false`

5. **Code Block Event: `OnPlayerEnterTrigger`** (eliminationTrigger)
   - Fires when a player enters the elimination trigger volume
   - Calls `handlePlayerElimination()` to process the elimination

### `start()`

Handles component initialization and player input setup.

#### Functionality:

- Gets the server player reference
- Early returns if the owner is the server player (no client-side logic needed)
- Casts the knife entity as an `AttachableEntity`
- **Input Binding (Local Player Only):**
  - Connects `RightSecondary` button (Swap icon)
  - Toggles knife between holstered (torso) and held states
  - Only active when the knife is currently held

---

## Public Methods

### `updateMurderer(player: hz.Player): void`

Updates the Murderer assignment when a new player is selected for the role.

**Parameters:**

- `player` - The player to assign as the Murderer

**Actions:**

- Sets the entity owner to the specified player
- Updates the internal `owner` property
- Placeholder for UI initialization

---

## Private Methods

### `updateEliminationTrigger(): void`

Manages the elimination trigger volume based on knife held state.

**Logic:**

- Initializes the trigger volume reference if not already set
- If knife is held: Starts tracking nearby players
- If knife is not held: Stops tracking and hides the trigger

---

### `startTrackingPlayers(): void`

Begins continuous monitoring of nearby players for elimination opportunities.

**Actions:**

- Clears any existing update intervals to prevent duplicates
- Creates a new interval that runs every **100ms** (0.1 seconds)
- Calls `updateNearbyPlayers()` on each interval tick

**Performance Note:** The 100ms interval balances responsiveness with performance optimization.

---

### `stopTrackingPlayers(): void`

Stops tracking nearby players and disables the elimination trigger.

**Actions:**

- Clears the active update interval
- Resets the `updateInterval` property to `undefined`
- Moves the elimination trigger to position `(0, -1000, 0)` (far below the map)
- Clears the `nearbyPlayers` array

**Why move the trigger?** Moving it far away prevents accidental interactions when the feature is disabled.

---

### `updateNearbyPlayers(): void`

Updates the elimination trigger position based on the closest player within range.

**Constants:**

- `ELIMINATION_RANGE` = **1.0 meter**

**Algorithm:**

1. Validates that `owner` and `eliminationTrigger` exist
2. Gets the Murderer's current position
3. Retrieves all players in the world
4. Iterates through all players:
   - Skips the Murderer themselves (by comparing player IDs)
   - Calculates distance between Murderer and each player
   - Tracks the closest player within the elimination range
5. **If a player is in range:**
   - Teleports the trigger volume to that player's position
   - Stores the player in the `nearbyPlayers` array
6. **If no players are in range:**
   - Moves the trigger volume to `(0, -1000, 0)`
   - Clears the `nearbyPlayers` array

**Key Feature:** Only tracks the **single closest player** at any time, preventing multi-target confusion.

---

### `handlePlayerElimination(player: hz.Player): void`

Processes the elimination when a player enters the trigger volume.

**Parameters:**

- `player` - The player who entered the trigger (victim)

**Actions:**

1. Plays the "Throw" grip pose animation on the Murderer's avatar
2. Broadcasts a `playerEliminated` event with:
   - `player` - The eliminated player
   - `killer` - The Murderer (owner of this component)

**Event:** `Events.playerEliminated`

---

## Game Mechanics Flow

### Knife Holstering

```
Player presses RightSecondary button
  ↓
Is knife currently held?
  ↓ YES
Is knife holstered?
  ↓ NO → Attach knife to Torso anchor (holster)
  ↓ YES → Detach knife + Force hold in Right hand (unholster)
```

### Proximity Elimination

```
Player assigned as Murderer
  ↓
Knife picked up → knifeHeldUpdated event fires
  ↓
startTrackingPlayers() begins 100ms interval
  ↓
Every 100ms: updateNearbyPlayers()
  ↓
Find closest player within 1 meter
  ↓
Teleport eliminationTrigger to that player's position
  ↓
Player enters trigger → OnPlayerEnterTrigger fires
  ↓
handlePlayerElimination() processes the kill
  ↓
playerEliminated event broadcast
```

---

## Event Dependencies

### Listens To:

- `Events.selectedMurderer` (Network) - Role assignment
- `Events.knifeHeldUpdated` (Local) - Knife state changes
- `hz.CodeBlockEvents.OnGrabStart` - Knife pickup
- `hz.CodeBlockEvents.OnGrabEnd` - Knife release
- `hz.CodeBlockEvents.OnPlayerEnterTrigger` - Elimination trigger activation

### Broadcasts:

- `Events.playerEliminated` (Local) - When a player is eliminated

---

## Technical Details

### Input Binding

- **Action:** `hz.PlayerInputAction.RightSecondary`
- **Icon:** `hz.ButtonIcon.Swap`
- **Scope:** Local player only (when they are the Murderer)

### Entity Types Used

- `hz.AttachableEntity` - For knife holstering/attachment
- `hz.GrabbableEntity` - For knife force-hold mechanics
- `hz.TriggerVolume` - For proximity-based elimination detection

### Anchor Points

- `hz.AttachablePlayerAnchor.Torso` - Where knife attaches when holstered

### Animations

- `hz.AvatarGripPoseAnimationNames.Throw` - Played during elimination

---

## Configuration Constants

| Constant            | Value           | Description                                                  |
| ------------------- | --------------- | ------------------------------------------------------------ |
| `ELIMINATION_RANGE` | 1.0             | Maximum distance (meters) for elimination trigger activation |
| Update Interval     | 0.1 seconds     | Frequency of proximity checks (100ms)                        |
| Inactive Position   | `(0, -1000, 0)` | Where trigger is moved when not in use                       |

---

## Usage Requirements

### Setup in Horizon Worlds:

1. Create an entity to hold the Murderer component
2. Assign a knife entity with `GrabbableEntity` and `AttachableEntity` components
3. Create a `TriggerVolume` entity for the elimination trigger
4. Link both entities via the component's props in the editor
5. Ensure the `selectedMurderer` event is broadcast when roles are assigned

### Dependencies:

- `GameUtil.ts` - For event definitions and player role management
- `KnifeController.ts` - For knife mechanics and `knifeHeldUpdated` events
- `PlayerManager.ts` - For handling elimination events

---

## Known Behaviors

1. **Trigger Positioning:** The elimination trigger only tracks ONE player at a time (the closest)
2. **Performance:** Updates run every 100ms to balance responsiveness with CPU usage
3. **Server Check:** The component skips client-side logic if the owner is the server player
4. **Holster Toggle:** Can only toggle holster state while actively holding the knife
5. **Elimination Animation:** Plays a throw animation when triggering an elimination

---

## Future Enhancement Opportunities

- [ ] Add cooldown timer between eliminations
- [ ] Visual feedback (UI prompt) when a player is in elimination range
- [ ] Sound effects for holstering/unholstering
- [ ] Configurable elimination range via props
- [ ] Support for multiple elimination methods (stab vs throw)
- [ ] Animation variations based on elimination angle/position

---

## Debugging

### Console Logs:

- `"Selected murderer:"` - When a player is assigned the Murderer role
- `"Knife held updated for murderer:"` - When knife state changes
- `"Knife grabbed:"` - When knife is picked up
- `"Knife released:"` - When knife is dropped
- `"Toggling knife holster state"` - When RightSecondary button is pressed

### Common Issues:

1. **Trigger not working:** Ensure `eliminationTrigger` prop is assigned in editor
2. **Multiple triggers:** Check if multiple Murderer components exist
3. **Knife not holstering:** Verify knife has `AttachableEntity` component
4. **No elimination:** Confirm `playerEliminated` event is properly handled by PlayerManager

---

## Version History

**Current Version:** Latest

- Proximity-based elimination system
- Automatic trigger positioning to nearest player
- Knife holstering mechanics
- Animation integration for eliminations

---

_Last Updated: October 6, 2025_
