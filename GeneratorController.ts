import Events from "GameUtil";
import * as hz from "horizon/core";
import { LightEvents } from "LightManager";

class GeneratorController extends hz.Component<typeof GeneratorController> {
  static propsDefinition = {
    handle: { type: hz.PropTypes.Entity },
    startPosition: { type: hz.PropTypes.Entity },
    endPosition: { type: hz.PropTypes.Entity },
    handleSFX: { type: hz.PropTypes.Entity },
    powerOffSFX: { type: hz.PropTypes.Entity },
  };

  preStart(): void {
    this.connectLocalBroadcastEvent(Events.registerNewMatch, () => {
      this.resetGenerator();
    });

    this.connectNetworkBroadcastEvent(
      Events.selectedMurderer,
      (player: hz.Player) => {
        this.murdererSelected = player;
      }
    );
  }

  private murdererSelected?: hz.Player;
  private generatorOn = true;

  start() {
    this.connectCodeBlockEvent(
      this.props.handle!,
      hz.CodeBlockEvents.OnGrabStart,
      (isRightHand: boolean, player: hz.Player) => {
        this.handleGeneratorToggle(player);
      }
    );
  }

  resetGenerator() {
    this.props.handle!.transform.position.set(
      this.props.startPosition!.transform.position.get()
    );
  }

  handleGeneratorToggle(player: hz.Player) {
    const startPos = this.props.startPosition!.transform.position.get();
    const endPos = this.props.endPosition!.transform.position.get();

    if (this.generatorOn) {
      if (player === this.murdererSelected) {
        this.generatorOn = false;
        this.props.handle!.as(hz.GrabbableEntity).forceRelease();
        this.sendNetworkBroadcastEvent(LightEvents.powerOutage, {});
        this.props.handle!.transform.position.set(endPos);
        this.props.powerOffSFX!.as(hz.AudioGizmo).play();
        this.props.handleSFX!.as(hz.AudioGizmo).play();
      } else {
        this.props.handle!.as(hz.GrabbableEntity).forceRelease();
        this.props.handle!.transform.position.set(startPos);
        return; // if generator is on, and the player is innocent, do nothing
      }
    } else {
      this.props.handle!.as(hz.GrabbableEntity).forceRelease();
      this.generatorOn = true;
      this.props.handle!.as(hz.GrabbableEntity).forceRelease();
      this.sendNetworkBroadcastEvent(LightEvents.powerRestored, {});
      this.props.handle!.transform.position.set(startPos);
      this.props.handleSFX!.as(hz.AudioGizmo).play();
    }
  }
}

hz.Component.register(GeneratorController);
