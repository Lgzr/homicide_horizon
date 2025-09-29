import { Events } from "GameUtil";
import { getKnifeTagFromIndex, ShopEvents } from "ShopUtil";
import * as hz from "horizon/core";

class KnifeTableController extends hz.Component<typeof KnifeTableController> {
  static propsDefinition = {
    knifeSpawnPoint: { type: hz.PropTypes.Entity },
    triggerZone: { type: hz.PropTypes.Entity },
  };

  private holdingKnifeTag = "knife_default";
  private KnifeEntity?: hz.Entity;
  private selectedMurderer?: hz.Player;

  preStart(): void {
    this.connectNetworkBroadcastEvent<{
      player: hz.Player;
      knife_index: number;
    }>(
      ShopEvents.knifeSkinUpdated,
      (data: { player: hz.Player; knife_index: number }) => {
        this.updateKnifeSkin(data.knife_index);
      }
    );

    this.connectNetworkBroadcastEvent<{ player: hz.Player }>(
      Events.selectedMurderer,
      (data: { player: hz.Player }) => {
        console.log("Selected murderer:", data.player);
        this.selectedMurderer = data.player;
        this.updateOwner(data.player);
      }
    );
  }

  start() {
    this.KnifeEntity = this.world.getEntitiesWithTags(["knife_default"])[0];

    this.connectCodeBlockEvent(
      this.props.triggerZone!,
      hz.CodeBlockEvents.OnPlayerEnterTrigger,
      (collidedWith: hz.Player) => {
        // add delay between each collision
        this.async.setTimeout(() => {
          console.log("Entity collided with:", collidedWith);
          const player = collidedWith;
          if (player === this.entity.owner.get()) {
            this.holsterToPlayer(player);
          } else if (player === this.selectedMurderer || true) {
            this.updateOwner(player);
            this.holsterToPlayer(player);
          }
        }, 100); // Delay of 100ms between each collision
      }
    );
  }

  updateKnifeSkin(skinIndex: number) {
    const skinTag = getKnifeTagFromIndex(skinIndex);
    const knife = this.world.getEntitiesWithTags([skinTag])[0];
    if (knife) {
      this.KnifeEntity = knife;
      console.log("Updated Knife Skin", knife);
    }
  }

  holsterToPlayer(player: hz.Player) {
    //this.KnifeEntity?.as(hz.GrabbableEntity)?.forceHold(player, hz.Handedness.Right, true);
    this.KnifeEntity?.as(hz.AttachableEntity)?.attachToPlayer(
      player,
      hz.AttachablePlayerAnchor.Torso
    );
    this.KnifeEntity?.visible.set(false);
    console.log(
      `[KnifeTableController] Knife holstered to player: ${player.name.get()}`
    );
  }

  updateOwner(player: hz.Player) {
    this.entity.owner.set(player);
  }
}
hz.Component.register(KnifeTableController);
