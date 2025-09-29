import * as hz from "horizon/core";
import { Events } from "GameUtil";
import LocalCamera from "horizon/camera";

class PropController extends hz.Component<typeof PropController> {
  static propsDefinition = {};

  private inputImpulse: hz.PlayerInput | undefined;
  private inputRotateCameraX: hz.PlayerInput | undefined;
  private inputRotateCameraY: hz.PlayerInput | undefined;
  private currentCameraRotation = new hz.Vec3(0, 0, 0); // Euler angles for camera rotation

  preStart() {
    // Listen for ownership transfer event from the server-side GhostManager
    this.connectNetworkBroadcastEvent(
      Events.transferPropOwnership,
      (data: { entity: hz.Entity; player: hz.Player }) => {
        if (data.entity === this.entity) {
          // Ownership has been transferred to this client
          // The start() method will be called automatically after ownership transfer completes
        }
      }
    );
  }

  start() {
    // This method is called after ownership transfer completes
    // At this point, the script is running on the client's machine
    if (this.entity.owner.get() !== this.world.getServerPlayer()) {
      this.setupCamera();
      this.setupExitControls();
    }
  }

  private setupCamera() {
    try {
      console.log(
        `Setting up camera for haunted object ${this.entity.name.get()}`
      );

      // Enable perspective switching
      LocalCamera.perspectiveSwitchingEnabled.set(true);

      // Set camera to attach to the object with fixed position but dynamic rotation
      LocalCamera.setCameraModeAttach(this.entity, {
        positionOffset: new hz.Vec3(0, 0, 0), // Position camera behind and above the object (fixed)
        rotationOffset: hz.Quaternion.fromEuler(this.currentCameraRotation), // Initial rotation
      });

      LocalCamera.overrideCameraFOV(100);
      console.log("Camera setup complete");

      // Set up movement controls
      this.setupMovementControls();
    } catch (error) {
      console.error("Failed to setup camera:", error);
    }
  }

  private setupMovementControls() {
    console.log(`Setting up camera controls for ${this.entity.name.get()}`);

    // Get the physical entity for applying forces
    const physicalEntity = this.entity.as(hz.PhysicalEntity);
    if (!physicalEntity) {
      console.error("Entity does not have PhysicalEntity component");
      return;
    }

    // Rotation and movement speeds
    const rotationSpeed = 60.0;
    const impulseForce = 3.0;

    // Connect to keyboard inputs for camera rotation
    const leftAxisInput = hz.PlayerControls.connectLocalInput(
      hz.PlayerInputAction.LeftXAxis, // A/D keys (positive = right, negative = left)
      hz.ButtonIcon.None,
      this
    );

    const upInput = hz.PlayerControls.connectLocalInput(
      hz.PlayerInputAction.LeftYAxis, // W/S keys (negative = forward/up)
      hz.ButtonIcon.None,
      this
    );
    const impulseInput = hz.PlayerControls.connectLocalInput(
      hz.PlayerInputAction.Jump, // Space bar
      hz.ButtonIcon.None,
      this
    );

    // Listen for input changes
    this.connectLocalBroadcastEvent(
      hz.World.onUpdate,
      (data: { deltaTime: number }) => {
        // Handle camera rotation
        const leftAxisValue = leftAxisInput.axisValue.get();
        const upAxis = upInput.axisValue.get();

        // Horizontal rotation (A/D keys via LeftAxis)
        if (Math.abs(leftAxisValue) > 0.1) {
          this.currentCameraRotation.y +=
            leftAxisValue * rotationSpeed * data.deltaTime;
        }

        // Vertical rotation (W/S keys)
        if (Math.abs(upAxis) > 0.1) {
          this.currentCameraRotation.x -=
            upAxis * rotationSpeed * data.deltaTime;
          // Clamp vertical rotation to prevent flipping
          this.currentCameraRotation.x = Math.max(
            -Math.PI / 2,
            Math.min(Math.PI / 2, this.currentCameraRotation.x)
          );
        }

        // Update camera rotation only (position stays fixed relative to object)
        LocalCamera.setCameraModeAttach(this.entity, {
          positionOffset: new hz.Vec3(0, 1, 0), // Keep fixed position
          rotationOffset: hz.Quaternion.fromEuler(this.currentCameraRotation), // Update rotation
        });

        // Handle impulse force (Space bar)
        if (impulseInput.pressed.get()) {
          const cameraForward = LocalCamera.forward.get();
          // Apply impulse in camera forward direction
          physicalEntity.applyForce(
            cameraForward.mul(impulseForce),
            hz.PhysicsForceMode.Impulse
          );
        }
      }
    );
  }

  private setupExitControls() {
    console.log(`Setting up exit controls for ${this.entity.name.get()}`);

    // Connect to exit input (let's use the RightPrimary button to exit spectate mode)
    const exitInput = hz.PlayerControls.connectLocalInput(
      hz.PlayerInputAction.RightPrimary, // R key
      hz.ButtonIcon.None,
      this
    );

    // Listen for exit input using callback
    exitInput.registerCallback((action, pressed) => {
      if (pressed && action === hz.PlayerInputAction.RightPrimary) {
        console.log("Exit spectate mode requested");
        LocalCamera.setCameraModeFirstPerson();
        // Send event to server to exit spectate mode
        this.sendNetworkBroadcastEvent(Events.exitSpectateMode, {
          player: this.world.getLocalPlayer(),
        });
      }
    });
  }
}
hz.Component.register(PropController);
