import Events from "GameUtil";
import * as hz from "horizon/core";
import { View } from "horizon/ui";

class MurdererUI extends hz.Component<typeof MurdererUI> {
  static propsDefinition = {};

  private knifeHeld: boolean = false;
  // connect to selectedMurderer event from GameManager
  preStart() {
    this.connectNetworkBroadcastEvent<{ player: hz.Player }>(
      Events.selectedMurderer,
      (data: { player: hz.Player }) => {
        console.log(
          `[MurdererUI] selectedMurderer event received for entity ${data.player.name.get()}`
        );
        this.updateUIForSelectedMurderer(data.player);
      }
    );

    this.connectLocalBroadcastEvent<{
      player: hz.Player;
      holdingKnife: boolean;
    }>(
      Events.knifeHeldUpdated,
      (data: { player: hz.Player; holdingKnife: boolean }) => {
        if (data.player === this.entity.owner.get()) {
          this.knifeHeld = data.holdingKnife;
          console.log(
            `[MurdererUI] Knife held updated for local player: ${this.knifeHeld}`
          );
        }
      }
    );
  }

  start() {}

  initializeUI() {
    // return View({
    //   width: this.entity.owner.get()!.screenWidth.get();
    //   height: this.entity.owner.get()!.screenHeight.get();
    //   children: [
    //     // Add UI elements here
    //   ]
    // });
  }

  private toggleKnife(action: hz.PlayerInputAction, pressed: boolean): void {
    if (pressed) {
      // Logic to toggle the knife visibility
      // Assuming the knife is a child or prop; replace with actual logic
      if (this.knifeHeld) {
        this.knifeHeld = false;
        this.hideKnife();
      } else {
        this.knifeHeld = true;
        this.summonKnife();
      }

      console.log("Toggling knife visibility");

      // Example: find knife entity and toggle visibility
      // const knife = this.entity.children.get().find(c => c.name.get() === "Knife");
      // if (knife) knife.visible.set(!knife.visible.get());
    }
  }

  hideKnife(): void {
    // Logic to hide the knife
    console.log("Hiding knife");
    this.sendLocalBroadcastEvent(Events.toggleKnifeToPlayer, {
      entity: this.entity,
      player: this.entity.owner.get()!,
      holdingKnife: false,
    });
  }

  summonKnife(): void {
    // Logic to summon the knife
    console.log("Summoning knife");
    this.sendLocalBroadcastEvent(Events.toggleKnifeToPlayer, {
      entity: this.entity,
      player: this.entity.owner.get()!,
      holdingKnife: true,
    });
  }

  updateUIForSelectedMurderer(player: hz.Player) {}
}
hz.Component.register(MurdererUI);
