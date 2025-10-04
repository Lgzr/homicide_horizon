import * as hz from "horizon/core";
import LocalCamera from "horizon/camera";

class DrawerController extends hz.Component<typeof DrawerController> {
  static propsDefinition = {
    drawerEntity: { type: hz.PropTypes.Entity },
    cameraProp: { type: hz.PropTypes.Entity },
    triggerVolume: { type: hz.PropTypes.Entity },
    spawnPoint: { type: hz.PropTypes.Entity },
    openSFX: { type: hz.PropTypes.Entity },
    pickupSFX: { type: hz.PropTypes.Entity },
    closeSFX: { type: hz.PropTypes.Entity },
    openPosition: { type: hz.PropTypes.Vec3 },
    closedPosition: { type: hz.PropTypes.Vec3 },
    openDuration: { type: hz.PropTypes.Number, default: 1.0 },
  };

  // Physical drawer that opens/closes, camera attaches to CameraProp
  // Trigger volume detects player collision to open drawer
  // Spawn random item from list when drawer opens
  // Play sound effects for open, pickup, and close
  // Auto-close after item pickup or timeout
  // Camera control prevents player movement during interaction

  private isOpen: boolean = false;
  private isAnimating: boolean = false;
  private interactingPlayer: hz.Player | null = null;
  private spawnedItem: hz.Entity | null = null;
  private closeTimer: number | null = null;
  private animationTimer: number | null = null;

  preStart(): void {
    // Connect to trigger volume collision event
    if (this.props.triggerVolume) {
      this.connectCodeBlockEvent(
        this.props.triggerVolume as hz.Entity,
        hz.CodeBlockEvents.OnPlayerEnterTrigger,
        (player: hz.Player) => {
          console.log(`Player entered drawer trigger: ${player.name.get()}`);
          this.toggleDrawer(player);
        }
      );
    }
  }

  start() {
    // Initialize drawer in closed state
    this.isOpen = false;
    this.isAnimating = false;

    // Set drawer to closed position if specified
    if (this.props.drawerEntity && this.props.closedPosition) {
      const drawer = this.props.drawerEntity as hz.Entity;
      drawer.transform.localPosition.set(this.props.closedPosition);
    }
  }

  toggleDrawer(player: hz.Player): void {
    if (this.isAnimating || !player) {
      console.log("Cannot toggle - animating or no player");
      return;
    }

    if (this.isOpen) {
      console.log("Toggling drawer: CLOSE");
      this.closeDrawer();
    } else {
      console.log("Toggling drawer: OPEN");
      this.openDrawer(player);
    }
  }

  handlePlayerInteraction(player: hz.Player): void {
    if (this.isOpen || this.isAnimating || !player) {
      return;
    }

    // Open the drawer
    this.openDrawer(player);
  }

  openDrawer(player: hz.Player): void {
    this.isOpen = true;
    this.isAnimating = true;
    this.interactingPlayer = player;

    console.log(`Drawer opening for player: ${player.name.get()}`);

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

    // Animate drawer to open position
    this.animateDrawer(
      this.props.closedPosition || new hz.Vec3(0, 0, 0),
      this.props.openPosition || new hz.Vec3(0, 0.5, 0),
      this.props.openDuration || 1.0,
      () => {
        this.isAnimating = false;
        console.log("Drawer fully opened");
        // Removed item spawning for now as requested
      }
    );

    // Clear any existing close timer
    if (this.closeTimer !== null) {
      this.async.clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }

    // Set timer to auto-close drawer after 10 seconds
    this.closeTimer = this.async.setTimeout(() => {
      console.log("Auto-closing drawer after timeout");
      this.closeDrawer();
    }, 10000);
  }

  animateDrawer(
    startPos: hz.Vec3,
    endPos: hz.Vec3,
    duration: number,
    onComplete?: () => void
  ): void {
    if (!this.props.drawerEntity) {
      onComplete?.();
      return;
    }

    const drawer = this.props.drawerEntity as hz.Entity;
    const startTime = Date.now();
    const steps = Math.ceil(duration * 60); // 60 steps per second
    let currentStep = 0;

    this.animationTimer = this.async.setInterval(() => {
      currentStep++;
      const t = Math.min(currentStep / steps, 1.0);
      const eased = this.easeInOutQuad(t);

      // Lerp between start and end positions
      const newPos = new hz.Vec3(
        startPos.x + (endPos.x - startPos.x) * eased,
        startPos.y + (endPos.y - startPos.y) * eased,
        startPos.z + (endPos.z - startPos.z) * eased
      );

      drawer.transform.localPosition.set(newPos);

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

  spawnRandomItem(): void {
    const itemList = this.world.getEntitiesWithTags(["spawnable"]);
    if (!itemList || itemList.length === 0) {
      console.warn("No items available to spawn in drawer");
      return;
    }

    // Pick a random item from the list
    const randomIndex = Math.floor(Math.random() * itemList.length);
    const itemAsset = itemList[randomIndex];

    if (!itemAsset) {
      console.warn("Invalid item asset");
      return;
    }

    // Spawn the item at the spawn point
    if (this.props.spawnPoint) {
      const spawnPos = (
        this.props.spawnPoint as hz.Entity
      ).transform.position.get();
      const spawnRot = (
        this.props.spawnPoint as hz.Entity
      ).transform.rotation.get();
      const spawnScale = new hz.Vec3(1, 1, 1);

      // Create spawn controller and spawn the item
    }
  }

  handleItemPickup(player: hz.Player): void {
    if (!this.spawnedItem) {
      return;
    }

    // Play pickup sound effect
    this.props.pickupSFX?.as(hz.AudioGizmo)?.play();

    console.log(`Player ${player.name.get()} picked up item from drawer`);

    // Close the drawer after item is picked up
    this.async.setTimeout(() => {
      this.closeDrawer();
    }, 500);
  }

  closeDrawer(): void {
    if (!this.isOpen) {
      console.log("Cannot close - drawer already closed");
      return;
    }

    if (this.isAnimating) {
      console.log("Cannot close - drawer is animating");
      return;
    }

    this.isAnimating = true;

    console.log("Drawer closing");

    // Play close sound effect
    this.props.closeSFX?.as(hz.AudioGizmo)?.play();

    // Return camera to first person
    if (LocalCamera) {
      LocalCamera.setCameraModeFirstPerson({
        duration: 0.5,
      });
    }

    // Animate drawer back to closed position
    this.animateDrawer(
      this.props.openPosition || new hz.Vec3(0, 0.5, 0),
      this.props.closedPosition || new hz.Vec3(0, 0, 0),
      this.props.openDuration || 1.0,
      () => {
        this.isAnimating = false;
        this.isOpen = false;
        console.log("Drawer fully closed");
      }
    );

    // Clear timer if exists
    if (this.closeTimer !== null) {
      this.async.clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }

    // Reset state
    this.interactingPlayer = null;
    this.spawnedItem = null;
  }
}
hz.Component.register(DrawerController);
