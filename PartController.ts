import * as hz from "horizon/core";
import { Events } from "GameUtil";

class PartController extends hz.Component<typeof PartController> {
  static propsDefinition = {};

  preStart(): void {
    // Initialize network event connections
  }

  start() {
    this.connectCodeBlockEvent(
      this.entity,
      hz.CodeBlockEvents.OnGrabStart,
      (isRightHand: boolean, player: hz.Player) => {
        this.onPartCollected(player);
      }
    );
  }

  onPartCollected(player: hz.Player) {
    this.sendNetworkBroadcastEvent(Events.partCollected, {
      player,
      part: this.entity,
    });
    this.hidePart();
  }

  hidePart() {
    // this.entity.simulated.set(true);
    // const hiddenPos = new hz.Vec3(0, 0, 0);
    // this.entity.transform.position.set(hiddenPos);
    // this.entity.simulated.set(false);
  }
}
hz.Component.register(PartController);
