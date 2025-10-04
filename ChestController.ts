import * as hz from "horizon/core";
import LocalCamera from "horizon/camera";

class ChestController extends hz.Component<typeof ChestController> {
  static propsDefinition = {
    chestHinge: { type: hz.PropTypes.Entity },
    cameraProp: { type: hz.PropTypes.Entity },
    triggerVolume: { type: hz.PropTypes.Entity },
    openSFX: { type: hz.PropTypes.Entity },
    closeSFX: { type: hz.PropTypes.Entity },
    openRotation: { type: hz.PropTypes.Vec3 },
    closedRotation: { type: hz.PropTypes.Vec3 },
    openDuration: { type: hz.PropTypes.Number, default: 1.0 },
  };

  // Physical chest that opens/closes using rotation on hinge
  // Trigger volume detects player collision to toggle chest
  // Camera attaches to CameraProp for viewing
  // Play sound effects for open and close
  // Auto-close after timeout

  private isOpen: boolean = false;
  private isAnimating: boolean = false;
  private interactingPlayer: hz.Player | null = null;
  private closeTimer: number | null = null;
  private animationTimer: number | null = null;

  preStart(): void {
    // Connect to trigger volume collision event
    if (this.props.triggerVolume) {
      this.connectCodeBlockEvent(
        this.props.triggerVolume as hz.Entity,
        hz.CodeBlockEvents.OnPlayerEnterTrigger,
        (player: hz.Player) => {
          console.log(`Player entered chest trigger: ${player.name.get()}`);
          this.toggleChest(player);
        }
      );
    }
  }

  start() {
    // Initialize chest in closed state
    this.isOpen = false;
    this.isAnimating = false;

    // Set chest hinge to closed rotation if specified
    if (this.props.chestHinge && this.props.closedRotation) {
      const hinge = this.props.chestHinge as hz.Entity;
      const closedQuat = hz.Quaternion.fromEuler(this.props.closedRotation);
      hinge.transform.localRotation.set(closedQuat);
    }
  }

  toggleChest(player: hz.Player): void {
    if (this.isAnimating || !player) {
      console.log("Cannot toggle chest - animating or no player");
      return;
    }

    if (this.isOpen) {
      console.log("Toggling chest: CLOSE");
      this.closeChest();
    } else {
      console.log("Toggling chest: OPEN");
      this.openChest(player);
    }
  }

  openChest(player: hz.Player): void {
    this.isOpen = true;
    this.isAnimating = true;
    this.interactingPlayer = player;

    console.log(`Chest opening for player: ${player.name.get()}`);

    // Play open sound effect
    this.props.openSFX?.as(hz.AudioGizmo)?.play();

    // Attach camera to camera prop
    if (this.props.cameraProp && LocalCamera) {
      LocalCamera.setCameraModeAttach(this.props.cameraProp as hz.Entity, {
        duration: 0.5,
        positionOffset: new hz.Vec3(0, 0, 0),
        rotationOffset: new hz.Vec3(0, 0, 0),
      });
    }

    // Animate chest hinge to open rotation
    this.animateChestRotation(
      this.props.closedRotation || new hz.Vec3(0, 0, 0),
      this.props.openRotation || new hz.Vec3(-90, 0, 0), // Default to -90 degrees on X axis
      this.props.openDuration || 1.0,
      () => {
        this.isAnimating = false;
        console.log("Chest fully opened");
      }
    );

    // Clear any existing close timer
    if (this.closeTimer !== null) {
      this.async.clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }

    // Set timer to auto-close chest after 10 seconds
    this.closeTimer = this.async.setTimeout(() => {
      console.log("Auto-closing chest after timeout");
      this.closeChest();
    }, 10000);
  }

  animateChestRotation(
    startEuler: hz.Vec3,
    endEuler: hz.Vec3,
    duration: number,
    onComplete?: () => void
  ): void {
    if (!this.props.chestHinge) {
      onComplete?.();
      return;
    }

    const hinge = this.props.chestHinge as hz.Entity;
    const steps = Math.ceil(duration * 60); // 60 steps per second
    let currentStep = 0;

    // Convert Euler angles to quaternions for proper interpolation
    const startQuat = hz.Quaternion.fromEuler(startEuler);
    const endQuat = hz.Quaternion.fromEuler(endEuler);

    this.animationTimer = this.async.setInterval(() => {
      currentStep++;
      const t = Math.min(currentStep / steps, 1.0);
      const eased = this.easeInOutQuad(t);

      // Slerp between start and end quaternions for smooth rotation
      const newQuat = hz.Quaternion.slerp(startQuat, endQuat, eased);
      hinge.transform.localRotation.set(newQuat);

      if (t >= 1.0) {
        if (this.animationTimer !== null) {
          this.async.clearInterval(this.animationTimer);
          this.animationTimer = null;
        }
        onComplete?.();
      }
    }, 1000 / 60);
  }

  easeInOutQuad(t: number): number {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  closeChest(): void {
    if (!this.isOpen) {
      console.log("Cannot close - chest already closed");
      return;
    }

    if (this.isAnimating) {
      console.log("Cannot close - chest is animating");
      return;
    }

    this.isAnimating = true;

    console.log("Chest closing");

    // Play close sound effect
    this.props.closeSFX?.as(hz.AudioGizmo)?.play();

    // Return camera to first person
    if (LocalCamera) {
      LocalCamera.setCameraModeFirstPerson({
        duration: 0.5,
      });
    }

    // Animate chest hinge back to closed rotation
    this.animateChestRotation(
      this.props.openRotation || new hz.Vec3(-90, 0, 0),
      this.props.closedRotation || new hz.Vec3(0, 0, 0),
      this.props.openDuration || 1.0,
      () => {
        this.isAnimating = false;
        this.isOpen = false;
        console.log("Chest fully closed");
      }
    );

    // Clear timer if exists
    if (this.closeTimer !== null) {
      this.async.clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }

    // Reset state
    this.interactingPlayer = null;
  }
}
hz.Component.register(ChestController);
