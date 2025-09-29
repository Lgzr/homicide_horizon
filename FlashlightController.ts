import Events, { GameState } from "GameUtil";
import * as hz from "horizon/core";

class FlashlightController extends hz.Component<typeof FlashlightController> {
  static propsDefinition = {
    spotlight: { type: hz.PropTypes.Entity },
    clickSFX: { type: hz.PropTypes.Entity },
  };

  private connectedToggleFlashlightInput!: hz.PlayerInput;
  private flashLightState: boolean = false;
  private initialPosition?: hz.Vec3;

  preStart(): void {
    this.connectLocalBroadcastEvent(
      Events.gameStateChanged,
      (data: { fromState: GameState; toState: GameState }) =>
        this.handleGameStateChanged(data.fromState, data.toState)
    );
  }

  start() {
    this.initialPosition = this.entity.transform.position.get();

    this.connectCodeBlockEvent(
      this.entity,
      hz.CodeBlockEvents.OnGrabStart,
      (isRightHanded: boolean, player: hz.Player) => {
        this.entity.owner.set(player);
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
        // disconnect input when flashlight is dropped
        if (this.connectedToggleFlashlightInput) {
          this.connectedToggleFlashlightInput.unregisterCallback();
          this.connectedToggleFlashlightInput = null as any;
        }
      }
    );
  }

  handleGameStateChanged(fromState: GameState, toState: GameState): void {
    if (toState === GameState.PreRound) {
      // Reset flashlight state when entering pre-round
      this.flashLightState = false;
      this.props.spotlight?.as(hz.DynamicLightGizmo).enabled.set(false);
      this.entity.transform.position.set(this.initialPosition!);
    }
  }

  private toggleFlashlight(
    action: hz.PlayerInputAction,
    pressed: boolean
  ): void {
    if (pressed) {
      // Toggle the flashlight on/off
      if (!this.flashLightState) {
        this.props.spotlight?.as(hz.DynamicLightGizmo).enabled.set(true);
        this.flashLightState = true;
      } else {
        this.props.spotlight?.as(hz.DynamicLightGizmo).enabled.set(false);
        this.flashLightState = false;
      }
      this.props.clickSFX
        ?.as(hz.AudioGizmo)
        .play({ fade: 0, players: [this.entity.owner.get()] });
    }
  }

  private setupMobileControls(player: hz.Player): void {
    this.connectedToggleFlashlightInput = hz.PlayerControls.connectLocalInput(
      hz.PlayerInputAction.RightTrigger, // Primary tap on mobile
      hz.ButtonIcon.Use, // Use a generic action icon
      this
    );
    this.connectedToggleFlashlightInput.registerCallback(
      this.toggleFlashlight.bind(this)
    );
  }

  private setupDesktopControls(player: hz.Player): void {
    this.connectedToggleFlashlightInput = hz.PlayerControls.connectLocalInput(
      hz.PlayerInputAction.RightTrigger, // Left mouse click on desktop
      hz.ButtonIcon.Use, // Use a generic action icon
      this
    );
    this.connectedToggleFlashlightInput.registerCallback(
      this.toggleFlashlight.bind(this)
    );
  }
}
hz.Component.register(FlashlightController);
