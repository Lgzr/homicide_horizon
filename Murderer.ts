import Events from "GameUtil";
import * as hz from "horizon/core";

class Murderer extends hz.Component<typeof Murderer> {
  static propsDefinition = { knife: { type: hz.PropTypes.Entity } };

  private knifeHeld!: boolean;
  private knifeHolstered: boolean = false;
  private knife!: hz.Entity;
  private owner!: hz.Player;
  private serverPlayer?: hz.Player;

  preStart(): void {
    this.connectNetworkBroadcastEvent<{ player: hz.Player }>(
      Events.selectedMurderer,
      (data: { player: hz.Player }) => {
        console.log("Selected murderer:", data.player);
        this.updateMurderer(data.player);
      }
    );

    // this.connectLocalBroadcastEvent<{
    //   player: hz.Player;
    //   holdingKnife: boolean;
    // }>(
    //   Events.knifeHeldUpdated,
    //   (data: { player: hz.Player; holdingKnife: boolean }) => {
    //     console.log("Knife held updated:", data.player);
    //     this.knifeHeld = data.holdingKnife;
    //   }
    // );

    this.connectCodeBlockEvent(
      this.props.knife!,
      hz.CodeBlockEvents.OnGrabStart,
      (data) => {
        console.log("Knife grabbed:", data);
        this.knifeHeld = true;
      }
    );

    this.connectCodeBlockEvent(
      this.props.knife!,
      hz.CodeBlockEvents.OnGrabEnd,
      (data) => {
        console.log("Knife released:", data);
        this.knifeHeld = false;
      }
    );
  }

  private connectedHideKnifeInput!: hz.PlayerInput;

  start() {
    this.serverPlayer = this.world.getServerPlayer();

    if (this.owner === this.serverPlayer) {
      return;
    }

    this.knife = this.props.knife!.as(hz.AttachableEntity);

    // Only connect input if this is the local player
    if (this.owner === this.entity.owner.get()) {
      const attach = hz.PlayerControls.connectLocalInput(
        hz.PlayerInputAction.RightSecondary,
        hz.ButtonIcon.Swap,
        this
      );

      attach.registerCallback((action, pressed) => {
        if (pressed) {
          console.log("Toggling knife holster state");
          if (this.knifeHeld) {
            if (!this.knifeHolstered) {
              this.knife
                .as(hz.AttachableEntity)
                .attachToPlayer(this.owner, hz.AttachablePlayerAnchor.Torso);
            } else {
              this.knife.as(hz.AttachableEntity).detach();
              this.knife
                .as(hz.GrabbableEntity)
                .forceHold(this.owner, hz.Handedness.Right, true);
            }
          }
        }
      });
    }
  }

  updateMurderer(player: hz.Player): void {
    this.entity.owner.set(player);
    this.owner = player;
    // Initialize UI for the murderer (assuming local player)
  }
}
hz.Component.register(Murderer);
