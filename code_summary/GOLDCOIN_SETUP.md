# GoldCoin Setup Guide

## Overview

The `GoldCoin` script creates collectible coins that award gold currency to players when they enter a trigger volume. It integrates seamlessly with the `EconomyManager` system.

## Features

- ✅ Trigger-based collection
- ✅ Configurable gold amount
- ✅ UI popup notification
- ✅ Console logging of player balance
- ✅ Optional coin respawning
- ✅ Sound effects support
- ✅ Prevents double collection

## Setup Instructions

### 1. Prerequisites

- `EconomyManager.ts` script set up on an entity in your world
- A 3D model for your coin
- A trigger volume (sphere, box, or capsule collider)

### 2. Create Coin Entity

1. Create a new entity in your world (e.g., a 3D coin model)
2. Attach the `GoldCoin` script to the coin entity
3. Create a trigger volume entity as a child of the coin (or nearby)

### 3. Configure Props

#### Required Props:

- **triggerEntity**: Assign the trigger volume entity that players will enter
- **economyManagerEntity**: Assign the entity that has the EconomyManager component attached

#### Optional Props:

- **goldAmount** (default: 50): How much gold the coin awards
- **respawnTime** (default: 0): Time in seconds before coin respawns (0 = no respawn)
- **collectSFX**: Audio gizmo entity to play collection sound

### 4. Example Setup

```typescript
// Your coin hierarchy:
// 📦 CoinEntity (has GoldCoin script)
//   └─ 🔵 TriggerVolume (trigger gizmo)

// Another entity in the world:
// 📦 GameManager (has EconomyManager script)

// GoldCoin Props Configuration:
{
  triggerEntity: TriggerVolume,
  economyManagerEntity: GameManager,
  goldAmount: 50,
  respawnTime: 30, // Respawns after 30 seconds
  collectSFX: CoinCollectSound
}
```

## How It Works

### Collection Flow:

1. Player enters the trigger volume
2. Script checks if coin is already collected (prevents double collection)
3. Coin becomes invisible
4. Sound effect plays (if configured)
5. Gold is awarded via EconomyManager
6. UI popup shows collection message: "💰 Collected 50 Gold!\nTotal: 150 gold"
7. Console logs: `[GoldCoin] PlayerName collected 50 gold! Total: 150`
8. If respawn enabled, coin reappears after delay

### Prevention Features:

- **Double Collection Protection**: Once collected, can't be collected again until respawn
- **Error Handling**: Graceful error messages if EconomyManager not configured
- **Null Safety**: Checks all props before using them

## Console Output

When working correctly, you'll see:

```
[GoldCoin] PlayerName collected 50 gold! Total: 150
[GoldCoin] Coin will respawn in 30 seconds
[GoldCoin] Coin respawning
```

If there are configuration issues:

```
[GoldCoin] economyManagerEntity prop not set! Please assign the entity with EconomyManager component.
[GoldCoin] No trigger entity assigned!
[GoldCoin] Cannot collect coin - EconomyManager not initialized!
```

## Advanced Usage

### Multiple Coins

Create multiple coin instances with different gold values:

```typescript
// Small coin: 10 gold
// Medium coin: 50 gold
// Large coin: 100 gold
```

### Coin Spawning System

Use with a spawn controller to create dynamic coin spawning:

```typescript
// Spawn coins at random locations
// Configure different respawn times per coin type
// Create coin trails or patterns
```

### Integration with Shop System

Use coins as currency for shops:

```typescript
import { canPurchaseWithGold } from "./EconomyManager";

// In your shop script:
if (canPurchaseWithGold(player, itemPrice, this.world)) {
  // Purchase item
  economyManager.spendGold(player, itemPrice);
}
```

## Network Events

The GoldCoin automatically triggers EconomyManager network events:

- `goldChanged`: Broadcasts when player collects coin
- Event data includes player, old amount, new amount, change amount

Listen for these events in other scripts:

```typescript
this.connectNetworkBroadcastEvent(
  EconomyEvents.goldChanged,
  (data: GoldChangedEvent) => {
    console.log(`${data.player.name.get()} now has ${data.newAmount} gold!`);
  }
);
```

## Troubleshooting

### Coin not collecting:

- ✅ Check that `triggerEntity` is assigned
- ✅ Verify trigger volume is enabled
- ✅ Ensure `economyManagerEntity` points to correct entity
- ✅ Confirm EconomyManager component is on the assigned entity

### No popup showing:

- ✅ Check console for error messages
- ✅ Verify player is entering trigger correctly
- ✅ Ensure coin isn't already collected

### Coin not respawning:

- ✅ Set `respawnTime` > 0
- ✅ Check console logs for respawn message
- ✅ Verify timer isn't being cleared elsewhere

## Best Practices

1. **Organize Your Entities**: Keep coin entities grouped in a folder
2. **Use Descriptive Names**: Name coins like "GoldCoin_50", "GoldCoin_100"
3. **Test Respawn Times**: 30-60 seconds is usually good for gameplay
4. **Sound Feedback**: Always add collect sound effects for better UX
5. **Visual Feedback**: Consider adding particle effects on collection
6. **Balance Gold Values**: Test different amounts for game economy balance

## API Reference

### Props

```typescript
{
  triggerEntity: Entity; // Required
  economyManagerEntity: Entity; // Required
  goldAmount: number; // Optional (default: 50)
  respawnTime: number; // Optional (default: 0)
  collectSFX: Entity; // Optional
}
```

### Methods

- `collectCoin(player)`: Handles coin collection logic
- `scheduleRespawn()`: Schedules coin respawn
- `respawnCoin()`: Makes coin visible again
- `dispose()`: Cleanup when component destroyed

## Related Documentation

- [EconomyManager Guide](./ECONOMY_MANAGER_GUIDE.md)
- [Horizon Worlds Trigger Volumes](https://developers.meta.com/horizon-worlds/learn/documentation/)
- [Horizon Worlds UI System](https://developers.meta.com/horizon-worlds/learn/documentation/)
