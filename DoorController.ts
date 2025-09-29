import { Events } from "GameUtil";
import * as hz from "horizon/core";

class DoorController extends hz.Component<typeof DoorController> {
  static propsDefinition = {
    trigger: { type: hz.PropTypes.Entity },
    doorOpenSFX: { type: hz.PropTypes.Entity },
    doorCloseSFX: { type: hz.PropTypes.Entity },
  };

  private doorOpen: boolean = false;
  private isAnimating: boolean = false;
  private animationStartTime: number = 0;
  private animationDuration: number = 1; // seconds
  private startRotation: hz.Quaternion = hz.Quaternion.fromEuler(
    new hz.Vec3(0, 0, 0)
  );
  private endRotation: hz.Quaternion = hz.Quaternion.fromEuler(
    new hz.Vec3(0, 0, 0)
  );
  private updateSubscription?: hz.EventSubscription;

  preStart() {
    this.connectCodeBlockEvent(
      this.props.trigger!,
      hz.CodeBlockEvents.OnPlayerEnterTrigger,
      (player: hz.Player) => {
        this.toggleDoor();
      }
    );

    this.connectNetworkBroadcastEvent<{}>(Events.resetDoors, () => {
      if (this.doorOpen) {
        this.toggleDoor();
      }
    });

    this.connectLocalEvent<{ entity: { entity: hz.Entity } }>(
      this.entity,
      Events.openDoor,
      (data: { entity: { entity: hz.Entity } }) => {
        if (data.entity.entity === this.entity && !this.doorOpen) {
          this.toggleDoor();
        }
      }
    );
  }

  start() {}

  lerpRotation(
    start: hz.Quaternion,
    end: hz.Quaternion,
    t: number
  ): hz.Quaternion {
    return hz.Quaternion.slerp(start, end, t);
  }

  toggleDoor() {
    if (this.isAnimating) return; // Prevent multiple animations

    this.doorOpen = !this.doorOpen;

    this.props.doorOpenSFX?.as(hz.AudioGizmo).play();

    this.startRotation = this.entity.transform.localRotation.get();
    this.endRotation = this.doorOpen
      ? hz.Quaternion.fromEuler(new hz.Vec3(0, 90, 0))
      : hz.Quaternion.fromEuler(new hz.Vec3(0, 0, 0));
    this.animationStartTime = Date.now();
    this.isAnimating = true;

    this.updateSubscription = this.connectLocalBroadcastEvent(
      hz.World.onUpdate,
      (data: { deltaTime: number }) => {
        this.updateAnimation();
      }
    );
  }

  private updateAnimation() {
    const elapsed = (Date.now() - this.animationStartTime) / 1000; // seconds
    const t = Math.min(elapsed / this.animationDuration, 1);
    this.entity.transform.localRotation.set(
      this.lerpRotation(this.startRotation, this.endRotation, t)
    );

    if (t >= 1) {
      if (!this.doorOpen) {
        this.props.doorCloseSFX?.as(hz.AudioGizmo).play();
      }
      this.isAnimating = false;
      this.updateSubscription?.disconnect();
      this.updateSubscription = undefined;
    }
  }
}
hz.Component.register(DoorController);
