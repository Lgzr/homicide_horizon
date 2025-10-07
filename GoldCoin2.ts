import * as hz from "horizon/core";
import EconomyManager from "./EconomyUtil";

class GoldCoin extends hz.Component<typeof GoldCoin> {
  static propsDefinition = {
    triggerEntity: { type: hz.PropTypes.Entity },
    economyManagerEntity: { type: hz.PropTypes.Entity }, // Reference to entity with EconomyManager component
    goldAmount: { type: hz.PropTypes.Number, default: 50 },
    respawnTime: { type: hz.PropTypes.Number, default: 0 }, // 0 = no respawn
    collectSFX: { type: hz.PropTypes.Entity },
    rotationSpeed: { type: hz.PropTypes.Number, default: 90 }, // Degrees per second rotation on Y axis
  };

  // Gold coin collectible that awards gold currency
  // When player enters trigger volume, coin disappears and player receives gold
  // Shows UI popup with collection message
  // Can optionally respawn after a delay

  private economyManager!: EconomyManager;
  private isCollected: boolean = false;
  private respawnTimer: number | null = null;
  private rotationSubscription?: hz.EventSubscription;

  preStart(): void {
    // Get reference to EconomyManager component from the provided entity
    if (this.props.economyManagerEntity) {
      const manager = this.props.economyManagerEntity.getComponents(EconomyManager)[0];
      if (manager) {
        this.economyManager = manager;
      } else {
        console.error("[GoldCoin] EconomyManager component not found on economyManagerEntity prop!");
      }
    } else {
      console.error("[GoldCoin] economyManagerEntity prop not set! Please assign the entity with EconomyManager component.");
    }

    // Connect to trigger volume
    if (this.props.triggerEntity) {
      this.connectCodeBlockEvent(
        this.props.triggerEntity as hz.Entity,
        hz.CodeBlockEvents.OnPlayerEnterTrigger,
        (player: hz.Player) => {
          this.collectCoin(player);
        }
      );
    } else {
      console.warn("[GoldCoin] No trigger entity assigned!");
    }
  }

  start() {
    this.isCollected = false;
    this.entity.visible.set(true);

    // Subscribe to the World update event for smooth rotation
    this.rotationSubscription = this.connectLocalBroadcastEvent(
      hz.World.onUpdate,
      (data: { deltaTime: number }) => {
        this.updateRotation(data.deltaTime);
      }
    );
  }

  updateRotation(deltaTime: number): void {
    // Continuously rotate the coin on the Y axis when visible
    if (!this.isCollected && this.entity.visible.get()) {
      const rotationSpeed = this.props.rotationSpeed || 90; // Degrees per second
      const currentRotation = this.entity.rotation.get();
      
      // Calculate rotation increment (deltaTime is in milliseconds, convert to seconds)
      const deltaSeconds = deltaTime / 100;
      const rotationIncrement = rotationSpeed * deltaSeconds;
      
      // Create a Y-axis rotation quaternion for this frame
      const deltaRotation = hz.Quaternion.fromEuler(
        new hz.Vec3(0, rotationIncrement, 0)
      );
      
      // Multiply current rotation by the delta rotation
      const newRotation = currentRotation.mul(deltaRotation);
      
      this.entity.rotation.set(newRotation);
    }
  }

  collectCoin(player: hz.Player): void {
    // Prevent double collection
    if (this.isCollected) {
      console.log(`[GoldCoin] Already collected, ignoring ${player.name.get()}`);
      return;
    }

    // Check if economy manager is available
    if (!this.economyManager) {
      console.error("[GoldCoin] Cannot collect coin - EconomyManager not initialized!");
      this.world.ui.showPopupForPlayer(
        player,
        "⚠️ Economy system not available!",
        3
      );
      return;
    }

    const goldAmount = this.props.goldAmount || 50;

    // Mark as collected
    this.isCollected = true;

    // Hide the coin
    this.entity.visible.set(false);
    this.props.triggerEntity?.as(hz.TriggerGizmo)?.enabled.set(false);
    

    // Play collect sound effect
    this.props.collectSFX?.as(hz.AudioGizmo)?.play();

    // Award gold to player
    this.economyManager.addGold(player, goldAmount);

    // Get player's new gold total
    const currentGold = this.economyManager.getGold(player);

    // Log to console
    console.log(`[GoldCoin] ${player.name.get()} collected ${goldAmount} gold! Total: ${currentGold}`);

    // Show popup UI (requires 3 parameters: player, text, displayTime)
    this.world.ui.showPopupForPlayer(
      player,
      `💰 Collected ${goldAmount} Gold!\nTotal: ${currentGold} gold`,
      3 // Display for 3 seconds
    );

    // Handle respawn if enabled
    if (this.props.respawnTime && this.props.respawnTime > 0) {
      this.scheduleRespawn();
    }
  }

  scheduleRespawn(): void {
    const respawnTime = (this.props.respawnTime || 0) * 1000; // Convert to milliseconds

    console.log(`[GoldCoin] Coin will respawn in ${this.props.respawnTime} seconds`);

    // Clear existing timer if any
    if (this.respawnTimer !== null) {
      this.async.clearTimeout(this.respawnTimer);
    }

    // Schedule respawn
    this.respawnTimer = this.async.setTimeout(() => {
      this.respawnCoin();
    }, respawnTime);
  }

  respawnCoin(): void {
    console.log("[GoldCoin] Coin respawning");
    
    this.isCollected = false;
    this.entity.visible.set(true);
    this.respawnTimer = null;
    this.props.triggerEntity?.as(hz.TriggerGizmo)?.enabled.set(true);

    // Play respawn effect if available
    this.props.collectSFX?.as(hz.AudioGizmo)?.play();
    
  }

  // Clean up timer and event subscriptions when component is destroyed
  dispose(): void {
    if (this.respawnTimer !== null) {
      this.async.clearTimeout(this.respawnTimer);
      this.respawnTimer = null;
    }
    
    // Disconnect rotation update event
    if (this.rotationSubscription) {
      this.rotationSubscription.disconnect();
      this.rotationSubscription = undefined;
    }
  }
}

hz.Component.register(GoldCoin);

export default GoldCoin;

