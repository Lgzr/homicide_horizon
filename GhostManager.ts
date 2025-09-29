import * as hz from "horizon/core";
import { Events } from "GameUtil";

class GhostManager extends hz.Component<typeof GhostManager> {
  static propsDefinition = {
    enterSpectateTrigger: { type: hz.PropTypes.Entity },
  };

  private hauntableObjects: hz.Entity[] = [];
  // Map to track which player is haunting which object
  private playerHauntMap: Map<hz.Player, hz.Entity> = new Map();
  // Map to track which object is haunted by which player
  private objectPlayerMap: Map<hz.Entity, hz.Player> = new Map();

  preStart() {
    this.connectCodeBlockEvent(
      this.props.enterSpectateTrigger!,
      hz.CodeBlockEvents.OnPlayerEnterTrigger,
      (player: hz.Player) => {
        this.startSpectating(player);
      }
    );

    // Listen for when players leave spectate mode (could be triggered by other events)
    this.connectNetworkBroadcastEvent(
      Events.exitSpectateMode,
      (data: { player: hz.Player }) => {
        this.stopSpectating(data.player);
      }
    );
  }

  start() {
    this.hauntableObjects = this.world.getEntitiesWithTags(["haunt"]);
    console.log(`Found ${this.hauntableObjects.length} hauntable objects`);
  }

  startSpectating(player: hz.Player) {
    console.log("Starting spectate mode for player:", player.name.get());

    // Check if player is already spectating
    if (this.playerHauntMap.has(player)) {
      console.log(
        "Player is already spectating, stopping current session first"
      );
      this.stopSpectating(player);
    }

    // Find available hauntable objects (not currently haunted)
    const availableObjects = this.hauntableObjects.filter(
      (obj) => !this.objectPlayerMap.has(obj)
    );

    if (availableObjects.length === 0) {
      console.log("No available haunt objects");
      return;
    }

    const randomIndex = Math.floor(Math.random() * availableObjects.length);
    const objectToHaunt = availableObjects[randomIndex];

    this.assignHauntToPlayer(player, objectToHaunt);
  }

  private assignHauntToPlayer(player: hz.Player, object: hz.Entity) {
    console.log(`Assigning ${object.name.get()} to ${player.name.get()}`);

    // Update our maps
    this.playerHauntMap.set(player, object);
    this.objectPlayerMap.set(object, player);

    // Transfer ownership to the player
    object.owner.set(player);

    // Send event to notify the prop controller that ownership has been transferred
    this.sendNetworkBroadcastEvent(Events.transferPropOwnership, {
      entity: object,
      player: player,
    });
  }

  stopSpectating(player: hz.Player) {
    const hauntedObject = this.playerHauntMap.get(player);
    if (hauntedObject) {
      console.log(
        `Stopping spectate mode for ${player.name.get()}, reclaiming ${hauntedObject.name.get()}`
      );

      // Reclaim ownership back to server
      hauntedObject.owner.set(this.world.getServerPlayer());

      // Clear our maps
      this.playerHauntMap.delete(player);
      this.objectPlayerMap.delete(hauntedObject);

      // Notify that spectating has ended
      this.sendNetworkBroadcastEvent(Events.spectateModeEnded, {
        player: player,
        entity: hauntedObject,
      });
    }
  }

  // Method to get the current haunt for a player (useful for other systems)
  getPlayerHaunt(player: hz.Player): hz.Entity | undefined {
    return this.playerHauntMap.get(player);
  }

  // Method to get all currently haunted objects
  getHauntedObjects(): hz.Entity[] {
    return Array.from(this.objectPlayerMap.keys());
  }
}
hz.Component.register(GhostManager);
