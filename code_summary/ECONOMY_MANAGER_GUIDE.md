# EconomyManager Guide

## Overview

The `EconomyManager` class manages the in-game economy system with persistent player variables for **Gold** and **Ruby** currencies. All currency values are stored in the `economy` variable group as persistent player variables that persist across sessions.

---

## Features

### 🪙 Dual Currency System

- **Gold**: Primary currency for standard purchases
- **Ruby**: Premium currency for special items

### 💾 Persistent Storage

- All balances are stored using Horizon's persistent player variables
- Data persists across game sessions automatically
- Variable group: `economy`
- Variables: `economy:Gold`, `economy:Ruby`

### 📡 Network Events

- Real-time currency updates broadcast to all clients
- Purchase notifications
- Insufficient funds warnings

---

## Setup

### 1. Add EconomyManager to World

Attach the `EconomyManager` component to an entity in your world:

```typescript
import EconomyManager from "./EconomyManager";
```

### 2. Configure Starting Balances

Set the `startingGold` and `startingRuby` props on the component:

- **startingGold**: Default is `100`
- **startingRuby**: Default is `0`

---

## Usage Examples

### Checking if Player Can Afford Items

Use the exported helper functions:

```typescript
import { canPurchaseWithGold, canPurchaseWithRuby } from "./EconomyManager";

// Check if player can afford 50 gold
if (canPurchaseWithGold(player, 50, this.world)) {
  console.log("Player can afford this item!");
} else {
  console.log("Not enough gold!");
}

// Check if player can afford 10 rubys
if (canPurchaseWithRuby(player, 10, this.world)) {
  console.log("Player can afford this premium item!");
}
```

### Getting Player Balances

Access the EconomyManager instance to check balances:

```typescript
const economyManager = this.world
  .getEntityByName("EconomyManager")
  ?.getComponent(EconomyManager);

if (economyManager) {
  const gold = economyManager.getGold(player);
  const ruby = economyManager.getRuby(player);
  console.log(`Player has ${gold} gold and ${ruby} rubys`);
}
```

### Adding Currency (Rewards)

Reward players with currency:

```typescript
// Reward player with 25 gold for completing a quest
economyManager.addGold(player, 25);

// Give premium currency reward
economyManager.addRuby(player, 5);
```

### Spending Currency (Purchases)

Deduct currency when making purchases:

```typescript
// Purchase an item for 100 gold
const success = economyManager.spendGold(player, 100, "Sword");
if (success) {
  console.log("Purchase successful!");
  // Give player the item
} else {
  console.log("Insufficient funds!");
}

// Purchase premium item for 10 rubys
if (economyManager.spendRuby(player, 10, "Legendary Armor")) {
  // Give player the premium item
}
```

### Setting Exact Balances

Directly set a player's balance:

```typescript
// Set gold to specific amount (useful for admin commands)
economyManager.setGold(player, 1000);

// Set ruby balance
economyManager.setRuby(player, 50);
```

### Transferring Currency Between Players

Transfer gold from one player to another:

```typescript
const fromPlayer = // ... get player
const toPlayer = // ... get player

if (economyManager.transferGold(fromPlayer, toPlayer, 25)) {
  console.log("Transfer successful!");
} else {
  console.log("Transfer failed - insufficient funds!");
}
```

### Resetting Player Economy

Reset a player's economy to starting values:

```typescript
economyManager.resetPlayerEconomy(player);
```

---

## Network Events

### Listening to Economy Events

Connect to economy events to update UI or trigger other systems:

```typescript
import { EconomyEvents } from "./EconomyManager";

// Listen for gold changes
this.connectNetworkBroadcastEvent(EconomyEvents.goldChanged, (data) => {
  console.log(
    `${data.player.name.get()} gold: ${data.oldAmount} -> ${data.newAmount}`
  );
  // Update UI display
});

// Listen for ruby changes
this.connectNetworkBroadcastEvent(EconomyEvents.rubyChanged, (data) => {
  console.log(
    `${data.player.name.get()} rubys: ${data.oldAmount} -> ${data.newAmount}`
  );
});

// Listen for purchases
this.connectNetworkBroadcastEvent(EconomyEvents.purchaseMade, (data) => {
  console.log(
    `${data.player.name.get()} purchased ${data.itemName} for ${data.cost} ${
      data.currencyType
    }`
  );
});

// Listen for insufficient funds
this.connectNetworkBroadcastEvent(EconomyEvents.insufficientFunds, (data) => {
  console.log(
    `${data.player.name.get()} needs ${data.required} ${
      data.currencyType
    }, has ${data.available}`
  );
  // Show UI notification to player
});
```

### Available Events

| Event Name          | Payload                                         | Description                                             |
| ------------------- | ----------------------------------------------- | ------------------------------------------------------- |
| `goldChanged`       | `{ player, oldAmount, newAmount }`              | Triggered when gold balance changes                     |
| `rubyChanged`       | `{ player, oldAmount, newAmount }`              | Triggered when ruby balance changes                     |
| `purchaseMade`      | `{ player, itemName, cost, currencyType }`      | Triggered when purchase succeeds                        |
| `insufficientFunds` | `{ player, required, available, currencyType }` | Triggered when purchase fails due to insufficient funds |

---

## API Reference

### Exported Functions

#### `canPurchaseWithGold(player, amount, world): boolean`

Checks if player has enough gold to make a purchase.

**Parameters:**

- `player: hz.Player` - The player to check
- `amount: number` - The amount of gold required
- `world: hz.World` - The world instance

**Returns:** `true` if player has enough gold, `false` otherwise

#### `canPurchaseWithRuby(player, amount, world): boolean`

Checks if player has enough rubys to make a purchase.

**Parameters:**

- `player: hz.Player` - The player to check
- `amount: number` - The amount of rubys required
- `world: hz.World` - The world instance

**Returns:** `true` if player has enough rubys, `false` otherwise

---

### EconomyManager Methods

#### `getGold(player): number`

Gets a player's current gold balance.

#### `getRuby(player): number`

Gets a player's current ruby balance.

#### `addGold(player, amount): void`

Adds gold to a player's balance. Broadcasts `goldChanged` event.

#### `addRuby(player, amount): void`

Adds rubys to a player's balance. Broadcasts `rubyChanged` event.

#### `spendGold(player, amount, itemName?): boolean`

Spends gold from a player's balance. Returns `true` on success, `false` if insufficient funds.
Broadcasts `goldChanged` and optionally `purchaseMade` events.

#### `spendRuby(player, amount, itemName?): boolean`

Spends rubys from a player's balance. Returns `true` on success, `false` if insufficient funds.
Broadcasts `rubyChanged` and optionally `purchaseMade` events.

#### `setGold(player, amount): void`

Sets a player's gold balance to a specific amount.

#### `setRuby(player, amount): void`

Sets a player's ruby balance to a specific amount.

#### `resetPlayerEconomy(player): void`

Resets a player's economy to starting values.

#### `transferGold(fromPlayer, toPlayer, amount): boolean`

Transfers gold from one player to another. Returns `true` on success.

---

## Shop Integration Example

Here's a complete example of integrating the economy system with a shop:

```typescript
import * as hz from "horizon/core";
import { canPurchaseWithGold } from "./EconomyManager";
import EconomyManager from "./EconomyManager";

class ShopController extends hz.Component<typeof ShopController> {
  static propsDefinition = {
    itemPrice: { type: hz.PropTypes.Number, default: 50 },
    itemName: { type: hz.PropTypes.String, default: "Sword" },
  };

  private economyManager!: EconomyManager;

  preStart() {
    // Get economy manager reference
    const economyEntity = this.world.getEntityByName("EconomyManager");
    this.economyManager = economyEntity?.getComponent(EconomyManager)!;

    // Connect to purchase button
    this.connectCodeBlockEvent(
      this.entity,
      hz.CodeBlockEvents.OnPlayerEnterTrigger,
      (player: hz.Player) => {
        this.attemptPurchase(player);
      }
    );
  }

  start() {}

  attemptPurchase(player: hz.Player): void {
    const price = this.props.itemPrice || 50;
    const itemName = this.props.itemName || "Item";

    // Check if player can afford
    if (canPurchaseWithGold(player, price, this.world)) {
      // Attempt purchase
      if (this.economyManager.spendGold(player, price, itemName)) {
        console.log(`${player.name.get()} purchased ${itemName}!`);
        this.giveItemToPlayer(player);
        this.world.ui.showPopupForPlayer(
          player,
          `Purchase successful! You bought ${itemName} for ${price} gold.`
        );
      }
    } else {
      const currentGold = this.economyManager.getGold(player);
      this.world.ui.showPopupForPlayer(
        player,
        `Insufficient gold! You need ${price} gold but only have ${currentGold}.`
      );
    }
  }

  giveItemToPlayer(player: hz.Player): void {
    // Logic to give item to player
    console.log(`Giving ${this.props.itemName} to ${player.name.get()}`);
  }
}

hz.Component.register(ShopController);
```

---

## Best Practices

### 1. **Always Check Before Spending**

Use `canPurchaseWithGold()` or `canPurchaseWithRuby()` before attempting purchases:

```typescript
if (canPurchaseWithGold(player, cost, this.world)) {
  economyManager.spendGold(player, cost, itemName);
}
```

### 2. **Provide Item Names**

Always provide descriptive item names when spending currency:

```typescript
economyManager.spendGold(player, 100, "Iron Sword"); // Good
economyManager.spendGold(player, 100); // Less informative
```

### 3. **Listen to Events for UI Updates**

Connect to economy events to keep UI displays synchronized:

```typescript
this.connectNetworkBroadcastEvent(EconomyEvents.goldChanged, (data) => {
  this.updateGoldDisplay(data.player, data.newAmount);
});
```

### 4. **Validate Amounts**

The EconomyManager automatically validates negative amounts, but still check user input:

```typescript
const amount = Math.max(1, userInput); // Ensure positive
economyManager.addGold(player, amount);
```

### 5. **Use Transfer for Player-to-Player Trades**

When players trade, use `transferGold()` instead of manual add/spend:

```typescript
// Good
economyManager.transferGold(seller, buyer, price);

// Less safe
economyManager.spendGold(buyer, price);
economyManager.addGold(seller, price);
```

---

## Persistent Storage Notes

- Currency values are stored in `economy:Gold` and `economy:Ruby` variables
- These variables persist across sessions automatically
- No manual save/load logic required
- Variables are player-specific and isolated
- New players are automatically initialized with starting balances

---

## Troubleshooting

### Currency Not Persisting

**Problem:** Player balances reset on rejoin.

**Solution:** Ensure you're using the correct variable group format:

- ✅ `economy:Gold` (correct)
- ❌ `Gold` (missing group)

### Players Starting with Zero Balance

**Problem:** New players have 0 gold/ruby despite startingGold prop.

**Solution:**

- Check the `startingGold` and `startingRuby` props on the EconomyManager entity
- Ensure `initializePlayerEconomy()` is being called on player enter

### Events Not Firing

**Problem:** UI not updating when currency changes.

**Solution:**

- Verify you're using `connectNetworkBroadcastEvent()` not `connectLocalBroadcastEvent()`
- Check the event is being sent via `sendNetworkBroadcastEvent()`

---

_Last Updated: October 4, 2025_
