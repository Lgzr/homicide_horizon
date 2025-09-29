import * as hz from "horizon/core";
import LocalCamera from "horizon/camera";
import Events from "GameUtil";

class RevolverController extends hz.Component<typeof RevolverController> {
  static propsDefinition = {
    shootSFX: { type: hz.PropTypes.Entity },
    reloadSFX: { type: hz.PropTypes.Entity },
    emptyClickSFX: { type: hz.PropTypes.Entity },
    maxAmmo: { type: hz.PropTypes.Number, default: 6 },
    currentAmmo: { type: hz.PropTypes.Number, default: 6 },
    shootCooldown: { type: hz.PropTypes.Number, default: 1.0 }, // seconds
    projectileLauncher: { type: hz.PropTypes.Entity },
    shootVFX: { type: hz.PropTypes.Entity },
  };

  private connectedFireInput!: hz.PlayerInput;
  private connectedReloadInput!: hz.PlayerInput;

  private projectileStartPosition?: hz.Vec3;
  private projectileForwardDirection?: hz.Vec3;

  private lastShottimestamp: number | null = null;

  preStart(): void {
    // connect spawn revolver event
    this.connectLocalBroadcastEvent<{ player: hz.Player }>(
      Events.spawnRevolver,
      (data) => {
        if (data.player) {
          this.entity.owner.set(data.player);
          this.equipRevolver(data.player);
        }
      }
    );
  }

  start() {
    this.connectCodeBlockEvent(
      this.entity,
      hz.CodeBlockEvents.OnGrabStart,
      (isRightHanded: boolean, player: hz.Player) => {
        if (player) {
          if (player.deviceType.get() === hz.PlayerDeviceType.Mobile) {
            this.setupMobileControls(player);
          } else {
            this.setupDesktopControls(player);
          }
        }
      }
    );

    this.connectCodeBlockEvent(
      this.entity,
      hz.CodeBlockEvents.OnGrabEnd,
      (player: hz.Player) => {
        // disconnect input when revolver is dropped
        if (this.connectedFireInput) {
          this.connectedFireInput.unregisterCallback();
          this.connectedFireInput = null as any;
        }
        if (this.connectedReloadInput) {
          this.connectedReloadInput.unregisterCallback();
          this.connectedReloadInput = null as any;
        }
      }
    );

    this.connectCodeBlockEvent(
      this.props.projectileLauncher?.as(hz.ProjectileLauncherGizmo)!,
      hz.CodeBlockEvents.OnProjectileHitPlayer,
      (playerHit: hz.Player, position: hz.Vec3) => {
        this.sendNetworkBroadcastEvent(Events.playerShot, {
          playerShooting: this.entity.owner.get(),
          playerShot: playerHit,
        });
      }
    );
  }

  equipRevolver(player: hz.Player): void {
    this.entity
      .as(hz.GrabbableEntity)
      .forceHold(player, hz.Handedness.Right, true);
  }

  fire(action: hz.PlayerInputAction, pressed: boolean): void {
    // look at players cursor position to determine direction

    const now = Date.now();
    const cooldown = this.props.shootCooldown ?? 300;
    if (this.lastShottimestamp && now - this.lastShottimestamp < cooldown) {
      //console.log("Shot ignored: still on cooldown");
      return;
    }

    this.props.projectileLauncher?.lookAt(LocalCamera.lookAtPosition?.get());

    if (pressed) {
      this.lastShottimestamp = Date.now();
      this.entity.owner
        .get()
        ?.playAvatarGripPoseAnimationByName(
          hz.AvatarGripPoseAnimationNames.Fire
        );
      this.props.shootSFX?.as(hz.AudioGizmo).play();
      this.props.shootVFX?.as(hz.ParticleGizmo).play();
      this.props.projectileLauncher
        ?.as(hz.ProjectileLauncherGizmo)
        .launchProjectile();
    }
  }

  reload(action: hz.PlayerInputAction, pressed: boolean): void {
    if (pressed) {
      this.entity.owner
        .get()
        ?.playAvatarGripPoseAnimationByName(
          hz.AvatarGripPoseAnimationNames.Reload
        );
      this.props.reloadSFX?.as(hz.AudioGizmo).play();
    }
  }

  private setupMobileControls(player: hz.Player): void {
    this.connectedFireInput = hz.PlayerControls.connectLocalInput(
      hz.PlayerInputAction.RightTrigger, // Primary tap on mobile
      hz.ButtonIcon.Use, // Use a generic action icon
      this
    );
    this.connectedFireInput.registerCallback(this.fire.bind(this));

    this.connectedReloadInput = hz.PlayerControls.connectLocalInput(
      hz.PlayerInputAction.LeftTrigger, // Secondary tap on mobile
      hz.ButtonIcon.Reload, // Use a generic action icon
      this
    );
    this.connectedReloadInput.registerCallback(this.reload.bind(this));
  }
  private setupDesktopControls(player: hz.Player): void {
    this.connectedFireInput = hz.PlayerControls.connectLocalInput(
      hz.PlayerInputAction.RightTrigger, // Left mouse click on desktop
      hz.ButtonIcon.Use, // Use a generic action icon
      this
    );
    this.connectedFireInput.registerCallback(this.fire.bind(this));

    this.connectedReloadInput = hz.PlayerControls.connectLocalInput(
      hz.PlayerInputAction.RightPrimary, // 'R' key on desktop
      hz.ButtonIcon.Reload, // Use a generic action icon
      this
    );
    this.connectedReloadInput.registerCallback(this.reload.bind(this));
  }
}

hz.Component.register(RevolverController);
