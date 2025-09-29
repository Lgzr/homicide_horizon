import Events from "GameUtil";
import { CodeBlockEvents, Component, Entity, Player } from "horizon/core";
import { LightEvents } from "LightManager";
import { WeatherEvents } from "WeatherManager";

class DebugScript extends Component<typeof DebugScript> {
  static propsDefinition = {};

  preStart() {
    this.connectCodeBlockEvent(
      this.entity,
      CodeBlockEvents.OnPlayerEnterTrigger,
      this.OnPlayerEnterTrigger.bind(this)
    );

    this.connectCodeBlockEvent(
      this.entity,
      CodeBlockEvents.OnPlayerExitTrigger,
      this.OnPlayerExitTrigger.bind(this)
    );

    this.connectCodeBlockEvent(
      this.entity,
      CodeBlockEvents.OnEntityEnterTrigger,
      this.OnEntityEnterTrigger.bind(this)
    );
  }

  start() {}

  OnPlayerEnterTrigger(player: Player) {
    // Add code here that you want to run when a player enters the trigger.
    // For more details and examples go to:
    // https://developers.meta.com/horizon-worlds/learn/documentation/code-blocks-and-gizmos/use-the-trigger-zone
    console.log(`Player ${player.name.get()} entered trigger.`);
    //this.sendNetworkBroadcastEvent(Events.checkForEndCondition, {});
    this.sendNetworkBroadcastEvent(WeatherEvents.stormStart, {});
  }

  OnPlayerExitTrigger(player: Player) {
    // Add code here that you want to run when a player exits the trigger.
    // The player parameter will be the player that exited the trigger.
    this.sendNetworkBroadcastEvent(WeatherEvents.stormEnd, {});
    console.log(`Player ${player.name.get()} exited trigger.`);
  }

  OnEntityEnterTrigger(entity: Entity) {
    // Add code here that you want to run when an entity enters the trigger.
    // The entity will need to have a Gameplay Tag that matches the tag your
    // trigger is configured to detect.
    console.log(`Entity ${entity.name.get()} entered trigger`);
  }
}
Component.register(DebugScript);
