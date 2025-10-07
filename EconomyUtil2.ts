import * as hz from "horizon/core";

/**
 * Economy Manager
 * 
 * Manages the in-game economy system with persistent player variables for Gold and Ruby currencies.
 * Handles currency transactions, balance checks, and provides network events for currency updates.
 * 
 * Currency Types:
 * - Gold: Primary currency for standard purchases
 * - Ruby: Premium currency for special items
 * 
 * All currency values are stored in the 'economy' variable group as persistent player variables.
 */

export const EconomyEvents = {
  goldChanged: new hz.LocalEvent<{ player: hz.Player; oldAmount: number; newAmount: number }>("goldChanged"),
  rubyChanged: new hz.LocalEvent<{ player: hz.Player; oldAmount: number; newAmount: number }>("rubyChanged"),
  purchaseMade: new hz.LocalEvent<{ player: hz.Player; itemName: string; cost: number; currencyType: "gold" | "ruby" }>("purchaseMade"),
  insufficientFunds: new hz.LocalEvent<{ player: hz.Player; required: number; available: number; currencyType: "gold" | "ruby" }>("insufficientFunds"),
};

/**
 * Check if a player has enough gold to make a purchase
 * @param player - The player to check
 * @param amount - The amount of gold required
 * @param world - The world instance to access persistent storage
 * @returns true if the player has enough gold, false otherwise
 */
export function canPurchaseWithGold(player: hz.Player, amount: number, world: hz.World): boolean {
  const currentGold = world.persistentStorage.getPlayerVariable(player, "economy:Gold") || 0;
  return currentGold >= amount;
}

/**
 * Check if a player has enough rubys to make a purchase
 * @param player - The player to check
 * @param amount - The amount of rubys required
 * @param world - The world instance to access persistent storage
 * @returns true if the player has enough rubys, false otherwise
 */
export function canPurchaseWithRuby(player: hz.Player, amount: number, world: hz.World): boolean {
  const currentRuby = world.persistentStorage.getPlayerVariable(player, "economy:Ruby") || 0;
  return currentRuby >= amount;
}

class EconomyManager extends hz.Component<typeof EconomyManager> {
  static propsDefinition = {
    startingGold: { type: hz.PropTypes.Number, default: 100 },
    startingRuby: { type: hz.PropTypes.Number, default: 0 },
  };

  // Manages economy system with persistent player variables
  // Tracks Gold and Ruby currencies in the 'economy' variable group
  // Provides network events for currency changes and purchases
  // Handles initialization of new players with starting currency

  preStart(): void {
    // Listen for players entering the world to initialize their economy
    this.connectCodeBlockEvent(
      this.entity,
      hz.CodeBlockEvents.OnPlayerEnterWorld,
      (player: hz.Player) => {
        this.initializePlayerEconomy(player);
      }
    );
  }

  start() {
    console.log("[EconomyManager] Economy system initialized");
  }

  /**
   * Initialize a player's economy variables if they don't exist
   */
  private initializePlayerEconomy(player: hz.Player): void {
    const goldVar = this.world.persistentStorage.getPlayerVariable(player, "economy:Gold");
    const rubyVar = this.world.persistentStorage.getPlayerVariable(player, "economy:Ruby");

    // Initialize Gold if not set
    if (goldVar === null || goldVar === undefined) {
      this.world.persistentStorage.setPlayerVariable(player, "economy:Gold", this.props.startingGold || 100);
      console.log(`[EconomyManager] Initialized ${player.name.get()} with ${this.props.startingGold} gold`);
    }

    // Initialize Ruby if not set
    if (rubyVar === null || rubyVar === undefined) {
      this.world.persistentStorage.setPlayerVariable(player, "economy:Ruby", this.props.startingRuby || 0);
      console.log(`[EconomyManager] Initialized ${player.name.get()} with ${this.props.startingRuby} rubys`);
    }
  }

  /**
   * Get a player's current gold balance
   */
  getGold(player: hz.Player): number {
    return this.world.persistentStorage.getPlayerVariable(player, "economy:Gold") || 0;
  }

  /**
   * Get a player's current ruby balance
   */
  getRuby(player: hz.Player): number {
    return this.world.persistentStorage.getPlayerVariable(player, "economy:Ruby") || 0;
  }

  /**
   * Add gold to a player's balance
   */
  addGold(player: hz.Player, amount: number): void {
    if (amount <= 0) {
      console.warn(`[EconomyManager] Attempted to add negative or zero gold: ${amount}`);
      return;
    }

    const oldAmount = this.getGold(player);
    const newAmount = oldAmount + amount;
    
    this.world.persistentStorage.setPlayerVariable(player, "economy:Gold", newAmount);
    
    console.log(`[EconomyManager] ${player.name.get()} gained ${amount} gold (${oldAmount} -> ${newAmount})`);
    
    this.sendNetworkBroadcastEvent(EconomyEvents.goldChanged, {
      player,
      oldAmount,
      newAmount,
    });
  }

  /**
   * Add rubys to a player's balance
   */
  addRuby(player: hz.Player, amount: number): void {
    if (amount <= 0) {
      console.warn(`[EconomyManager] Attempted to add negative or zero rubys: ${amount}`);
      return;
    }

    const oldAmount = this.getRuby(player);
    const newAmount = oldAmount + amount;
    
    this.world.persistentStorage.setPlayerVariable(player, "economy:Ruby", newAmount);
    
    console.log(`[EconomyManager] ${player.name.get()} gained ${amount} rubys (${oldAmount} -> ${newAmount})`);
    
    this.sendNetworkBroadcastEvent(EconomyEvents.rubyChanged, {
      player,
      oldAmount,
      newAmount,
    });
  }

  /**
   * Spend gold from a player's balance
   * @returns true if the transaction was successful, false if insufficient funds
   */
  spendGold(player: hz.Player, amount: number, itemName?: string): boolean {
    if (amount <= 0) {
      console.warn(`[EconomyManager] Attempted to spend negative or zero gold: ${amount}`);
      return false;
    }

    const currentGold = this.getGold(player);
    
    if (!canPurchaseWithGold(player, amount, this.world)) {
      console.warn(`[EconomyManager] ${player.name.get()} has insufficient gold. Required: ${amount}, Available: ${currentGold}`);
      
      this.sendNetworkBroadcastEvent(EconomyEvents.insufficientFunds, {
        player,
        required: amount,
        available: currentGold,
        currencyType: "gold",
      });
      
      return false;
    }

    const newAmount = currentGold - amount;
    this.world.persistentStorage.setPlayerVariable(player, "economy:Gold", newAmount);
    
    console.log(`[EconomyManager] ${player.name.get()} spent ${amount} gold on ${itemName || "purchase"} (${currentGold} -> ${newAmount})`);
    
    this.sendNetworkBroadcastEvent(EconomyEvents.goldChanged, {
      player,
      oldAmount: currentGold,
      newAmount,
    });

    if (itemName) {
      this.sendNetworkBroadcastEvent(EconomyEvents.purchaseMade, {
        player,
        itemName,
        cost: amount,
        currencyType: "gold",
      });
    }

    return true;
  }

  /**
   * Spend rubys from a player's balance
   * @returns true if the transaction was successful, false if insufficient funds
   */
  spendRuby(player: hz.Player, amount: number, itemName?: string): boolean {
    if (amount <= 0) {
      console.warn(`[EconomyManager] Attempted to spend negative or zero rubys: ${amount}`);
      return false;
    }

    const currentRuby = this.getRuby(player);
    
    if (!canPurchaseWithRuby(player, amount, this.world)) {
      console.warn(`[EconomyManager] ${player.name.get()} has insufficient rubys. Required: ${amount}, Available: ${currentRuby}`);
      
      this.sendNetworkBroadcastEvent(EconomyEvents.insufficientFunds, {
        player,
        required: amount,
        available: currentRuby,
        currencyType: "ruby",
      });
      
      return false;
    }

    const newAmount = currentRuby - amount;
    this.world.persistentStorage.setPlayerVariable(player, "economy:Ruby", newAmount);
    
    console.log(`[EconomyManager] ${player.name.get()} spent ${amount} rubys on ${itemName || "purchase"} (${currentRuby} -> ${newAmount})`);
    
    this.sendNetworkBroadcastEvent(EconomyEvents.rubyChanged, {
      player,
      oldAmount: currentRuby,
      newAmount,
    });

    if (itemName) {
      this.sendNetworkBroadcastEvent(EconomyEvents.purchaseMade, {
        player,
        itemName,
        cost: amount,
        currencyType: "ruby",
      });
    }

    return true;
  }

  /**
   * Set a player's gold balance to a specific amount
   */
  setGold(player: hz.Player, amount: number): void {
    if (amount < 0) {
      console.warn(`[EconomyManager] Attempted to set negative gold: ${amount}`);
      return;
    }

    const oldAmount = this.getGold(player);
    this.world.persistentStorage.setPlayerVariable(player, "economy:Gold", amount);
    
    console.log(`[EconomyManager] ${player.name.get()} gold set to ${amount} (was ${oldAmount})`);
    
    this.sendNetworkBroadcastEvent(EconomyEvents.goldChanged, {
      player,
      oldAmount,
      newAmount: amount,
    });
  }

  /**
   * Set a player's ruby balance to a specific amount
   */
  setRuby(player: hz.Player, amount: number): void {
    if (amount < 0) {
      console.warn(`[EconomyManager] Attempted to set negative rubys: ${amount}`);
      return;
    }

    const oldAmount = this.getRuby(player);
    this.world.persistentStorage.setPlayerVariable(player, "economy:Ruby", amount);
    
    console.log(`[EconomyManager] ${player.name.get()} rubys set to ${amount} (was ${oldAmount})`);
    
    this.sendNetworkBroadcastEvent(EconomyEvents.rubyChanged, {
      player,
      oldAmount,
      newAmount: amount,
    });
  }

  /**
   * Reset a player's economy to starting values
   */
  resetPlayerEconomy(player: hz.Player): void {
    this.setGold(player, this.props.startingGold || 100);
    this.setRuby(player, this.props.startingRuby || 0);
    console.log(`[EconomyManager] Reset economy for ${player.name.get()}`);
  }

  /**
   * Transfer gold from one player to another
   * @returns true if the transfer was successful, false if insufficient funds
   */
  transferGold(fromPlayer: hz.Player, toPlayer: hz.Player, amount: number): boolean {
    if (amount <= 0) {
      console.warn(`[EconomyManager] Attempted to transfer negative or zero gold: ${amount}`);
      return false;
    }

    if (!canPurchaseWithGold(fromPlayer, amount, this.world)) {
      console.warn(`[EconomyManager] ${fromPlayer.name.get()} has insufficient gold to transfer ${amount}`);
      return false;
    }

    // Deduct from sender
    const senderOldGold = this.getGold(fromPlayer);
    const senderNewGold = senderOldGold - amount;
    this.world.persistentStorage.setPlayerVariable(fromPlayer, "economy:Gold", senderNewGold);

    // Add to receiver
    const receiverOldGold = this.getGold(toPlayer);
    const receiverNewGold = receiverOldGold + amount;
    this.world.persistentStorage.setPlayerVariable(toPlayer, "economy:Gold", receiverNewGold);

    console.log(`[EconomyManager] ${fromPlayer.name.get()} transferred ${amount} gold to ${toPlayer.name.get()}`);

    // Broadcast events
    this.sendNetworkBroadcastEvent(EconomyEvents.goldChanged, {
      player: fromPlayer,
      oldAmount: senderOldGold,
      newAmount: senderNewGold,
    });

    this.sendNetworkBroadcastEvent(EconomyEvents.goldChanged, {
      player: toPlayer,
      oldAmount: receiverOldGold,
      newAmount: receiverNewGold,
    });

    return true;
  }
}

hz.Component.register(EconomyManager);

export default EconomyManager;
